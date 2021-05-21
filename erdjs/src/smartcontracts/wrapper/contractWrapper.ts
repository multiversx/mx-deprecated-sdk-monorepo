import * as fs from "fs";
import * as path from "path";
import { Address } from "../../address";
import { SmartContract } from "../smartContract";
import { Interaction } from "../interaction";
import { loadContractCode, TestWallet } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { SendContext } from "./sendContext";
import { IProvider } from "../../interface";
import { Err, ErrInvalidArgument } from "../../errors";
import { ContractLogger } from "./contractLogger";
import { NetworkConfig } from "../../networkConfig";
import { EndpointDefinition } from "../typesystem";
import { Balance, Egld } from "../../balance";
import { Transaction } from "../../transaction";
import { Code } from "../code";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { TokenType } from "../../esdtToken";
import { addMethods, generateMethods, Methods } from "./generateMethods";
import { formatEndpoint, FormattedCall } from "./formattedCall";
import { AbiFormatter, loadESDTAbiFormatter } from "./abiFormatter";
import { PreparedCall } from "./preparedCall";


/**
 * Provides a simple interface in order to easily call or query the smart contract's methods.
 */
export class ContractWrapper {
    private readonly smartContract: SmartContract;
    private readonly context: SendContext;
    private readonly wasmPath: string | null;
    private readonly abi: SmartContractAbi;
    private readonly ESDTAbiFormatter: AbiFormatter;
    readonly call: Methods<Promise<any>>;
    readonly query: Methods<Promise<any>>;
    readonly format: Methods<FormattedCall>;
    [key: string]: any;

    private constructor(
        smartContract: SmartContract,
        abi: SmartContractAbi,
        wasmPath: string | null,
        context: SendContext,
        ESDTAbiFormatter: AbiFormatter,
    ) {
        this.smartContract = smartContract;
        this.abi = abi;
        this.wasmPath = wasmPath;
        this.context = context;
        this.ESDTAbiFormatter = ESDTAbiFormatter;

        let generatedCalls = generateMethods(this, this.abi, this.handleCall);
        addMethods(this, generatedCalls);
        this.call = generatedCalls;
        this.call.deploy = this.deploy.bind(this);
        this.query = generateMethods(this, this.abi, this.handleQuery);
        this.format = generateMethods(this, this.abi, this.handleFormat);
        this.format.deploy = this.handleFormat.bind(this, this.abi.getConstructorDefinition());
    }

    sender(caller: TestWallet): ContractWrapper {
        this.context.sender(caller);
        return this;
    }

    gas(gas: number): ContractWrapper {
        this.context.gas(gas);
        return this;
    }

    value(value: Balance): ContractWrapper {
        this.context.value(value);
        return this;
    }

    address(address: Address | Buffer | string): ContractWrapper {
        this.smartContract.setAddress(new Address(address));
        return this;
    }

    getAddress(): Address {
        return this.smartContract.getAddress();
    }

    logger(logger: ContractLogger | null): ContractWrapper {
        this.context.logger(logger);
        return this;
    }

    getAbi(): SmartContractAbi {
        return this.abi;
    }

    getSmartContract(): SmartContract {
        return this.smartContract;
    }

    async getCode(): Promise<Code> {
        if (this.wasmPath == null) {
            throw new Err("contract wasm path not configured");
        }
        return await loadContractCode(this.wasmPath);
    }

    private async buildDeployTransaction(args: any[]): Promise<Transaction> {
        let contractCode = await this.getCode();

        let constructorDefinition = this.abi.getConstructorDefinition();
        let convertedArgs = formatEndpoint(constructorDefinition, ...args).toTypedValues();
        let transaction = this.smartContract.deploy({
            code: contractCode,
            gasLimit: this.context.getGasLimit(),
            initArguments: convertedArgs
        });
        return transaction;
    }

    async deploy(...args: any[]): Promise<void> {
        let transaction = await this.buildDeployTransaction(args);

        let transactionOnNetwork = await this.processTransaction(transaction);

        let smartContractResults = transactionOnNetwork.getSmartContractResults();
        let immediateResult = smartContractResults.getImmediate();
        immediateResult.assertSuccess();
        let logger = this.context.getLogger();
        logger?.deployComplete(transaction, smartContractResults, this.smartContract.getAddress());
    }

    static async loadProject(provider: IProvider, projectPath: string = ".") {
        projectPath = path.resolve(projectPath);
        if (!isProjectPath(projectPath)) {
            projectPath = path.dirname(projectPath);
        }
        if (!isProjectPath(projectPath)) {
            throw new ErrInvalidArgument(`Neither path "${projectPath}" nor its parent path is a valid project path (elrond.json not found)`);
        }
        let outputPath = path.join(projectPath, "output");
        let filesInOutput = await fs.promises.readdir(outputPath);
        filesInOutput = ignoreTemporaryWasmFiles(filesInOutput);

        let abiPath = expectSingleFileWithExtension(filesInOutput, outputPath, ".abi.json");
        let wasmPath = expectSingleFileWithExtension(filesInOutput, outputPath, ".wasm");

        return await ContractWrapper.loadAbi(provider, abiPath, wasmPath);
    }

    static async loadAbi(provider: IProvider, abiPath: string, wasmPath: string | null) {
        let abi = await SmartContractAbi.loadSingleAbi(abiPath);
        let smartContract = new SmartContract({ abi: abi });

        let sendContext = new SendContext(provider).logger(new ContractLogger());
        let ESDTAbiFormatter = await loadESDTAbiFormatter();
        let contractWrapper = new ContractWrapper(smartContract, abi, wasmPath, sendContext, ESDTAbiFormatter);

        return contractWrapper;
    }

    async handleQuery(endpoint: EndpointDefinition, ...args: any[]): Promise<any> {
        let preparedCall = await this.prepareCallWithPayment(endpoint, args);
        let interaction = this.convertPreparedCallToInteraction(preparedCall);
        let provider = this.context.getProvider();
        let logger = this.context.getLogger();

        let query = interaction.buildQuery();
        logger?.queryCreated(query);
        query.caller = this.context.getSender().address;
        let response = await provider.queryContract(query);
        let queryResponseBundle = interaction.interpretQueryResponse(response);
        let result = queryResponseBundle.firstValue?.valueOf();
        logger?.queryComplete(result, response);

        return result;
    }

    async handleCall(endpoint: EndpointDefinition, ...args: any[]): Promise<any> {
        let { transaction, interaction } = this.buildTransactionAndInteraction(endpoint, args);

        let transactionOnNetwork = await this.processTransaction(transaction);

        let { firstValue, smartContractResults, immediateResult } = interaction.interpretExecutionResults(transactionOnNetwork);
        let result = firstValue?.valueOf();
        let logger = this.context.getLogger();
        logger?.transactionComplete(result, immediateResult.data, transaction, smartContractResults);

        return result;
    }

    async processTransaction(transaction: Transaction): Promise<TransactionOnNetwork> {
        let provider = this.context.getProvider();
        let sender = this.context.getSender();
        transaction.setNonce(sender.account.nonce);
        await sender.signer.sign(transaction);

        let logger = this.context.getLogger();
        logger?.transactionCreated(transaction);
        await transaction.send(provider);

        // increment the nonce only after the transaction is sent
        // since an exception thrown by the provider means we will have to re-use the same nonce
        // otherwise the next transactions will hang (and never complete)
        sender.account.incrementNonce();

        logger?.transactionSent(transaction);
        await transaction.awaitExecuted(provider);
        let transactionOnNetwork = await transaction.getAsOnNetwork(provider, true, false);
        return transactionOnNetwork;
    }

    handleFormat(endpoint: EndpointDefinition, ...args: any[]): FormattedCall {
        let { formattedCall } = this.prepareCallWithPayment(endpoint, args);
        return formattedCall;
    }

    buildTransactionAndInteraction(endpoint: EndpointDefinition, args: any[]): { transaction: Transaction, interaction: Interaction } {
        let preparedCall = this.prepareCallWithPayment(endpoint, args);
        let interaction = this.convertPreparedCallToInteraction(preparedCall);
        interaction.withGasLimit(this.context.getGasLimit());
        let transaction = interaction.buildTransaction();
        return { transaction, interaction };
    }

    prepareCallWithPayment(endpoint: EndpointDefinition, args: any[]): PreparedCall {
        let value = this.context.getAndResetValue();
        if (value == null && endpoint.modifiers.isPayable()) {
            throw new Err("Did not provide any value for a payable method");
        }
        if (value != null && !endpoint.modifiers.isPayable()) {
            throw new Err("A value was provided for a non-payable method");
        }
        if (value != null && !endpoint.modifiers.isPayableInToken(value.token.name)) {
            throw new Err(`Token ${value.token.name} is not accepted by payable method. Accepted tokens: ${endpoint.modifiers.payableInTokens}`);
        }
        let formattedCall = formatEndpoint(endpoint, ...args);
        let preparedCall = new PreparedCall(this.smartContract.getAddress(), Egld(0), formattedCall);
        this.applyValueModfiers(value, preparedCall);
        return preparedCall;
    }

    convertPreparedCallToInteraction(preparedCall: PreparedCall): Interaction {
        let func = preparedCall.formattedCall.getFunction();
        let typedValueArgs = preparedCall.formattedCall.toTypedValues();
        let interaction = new Interaction(this.smartContract, func, typedValueArgs, preparedCall.receiver);
        interaction.withValue(preparedCall.egldValue);
        return interaction;
    }

    applyValueModfiers(value: Balance | null, preparedCall: PreparedCall) {
        if (value == null) {
            return;
        }
        if (value.token.isEgld()) {
            preparedCall.egldValue = value;
            return;
        }
        switch (value.token.type) {
            case TokenType.FungibleESDT:
                preparedCall.formattedCall = this.ESDTAbiFormatter.ESDTTransfer(value.token.name, value.valueOf(), preparedCall.formattedCall);
                break;
            case TokenType.SemiFungibleESDT:
            case TokenType.NonFungibleESDT:
                preparedCall.receiver = this.context.getSender().address;
                preparedCall.formattedCall = this.ESDTAbiFormatter.ESDTNFTTransfer(value.token.name, value.getNonce(), value.valueOf(), this.smartContract, preparedCall.formattedCall);
                break;
        }
    }
}

function isProjectPath(projectPath: string): boolean {
    try {
        fs.accessSync(path.join(projectPath, "elrond.json"), fs.constants.F_OK);
        return true;
    }
    catch (err) {
        return false;
    }
}

function filterByExtension(fileList: string[], extension: string): string[] {
    return fileList.filter(name => name.endsWith(extension));
}

function ignoreTemporaryWasmFiles(fileList: string[]) {
    let temporaryWasmFiles = filterByExtension(fileList, "_wasm.wasm");
    let difference = fileList.filter(file => temporaryWasmFiles.indexOf(file) === -1);
    return difference;
}

function expectSingleFileWithExtension(fileList: string[], folderPath: string, extension: string): string {
    let filteredFileList = filterByExtension(fileList, extension);
    if (filteredFileList.length != 1) {
        throw new ErrInvalidArgument(`Expected a single ${extension} file in ${folderPath} (found ${filteredFileList.length})`);
    }
    return path.join(folderPath, filteredFileList[0]);
}
