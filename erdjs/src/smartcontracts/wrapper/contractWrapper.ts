import * as fs from "fs";
import * as path from "path";
import { ContractFunction } from "../function";
import { Address } from "../../address";
import { SmartContract } from "../smartContract";
import { Interaction } from "../interaction";
import { loadAbiRegistry, loadContractCode, TestWallet } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { SendContext } from "./sendContext";
import { IProvider } from "../../interface";
import { ArgSerializer } from "../argSerializer";
import { Err, ErrInvalidArgument } from "../../errors";
import { ContractLogger } from "./contractLogger";
import { NetworkConfig } from "../../networkConfig";
import { EndpointDefinition } from "../typesystem";
import { Balance } from "../../balance";
import { BigNumber } from "bignumber.js";
import { Transaction } from "../../transaction";
import { Code } from "../code";


/**
 * Provides a simple interface in order to easily call or query the smart contract's methods.
 */
export class ContractWrapper {
    private readonly smartContract: SmartContract;
    private readonly context: SendContext;
    private readonly wasmPath: string | null;
    private readonly abi: SmartContractAbi;
    readonly call: Record<string, Method<Promise<any>>>;
    readonly query: Record<string, Method<Promise<any>>>;
    readonly rawTx: Record<string, Method<Promise<Transaction>>>;
    readonly argBuffers: Record<string, Method<Buffer[]>>;
    [key: string]: any;

    private constructor(
        smartContract: SmartContract,
        abi: SmartContractAbi,
        wasmPath: string | null,
        context: SendContext,
    ) {
        this.smartContract = smartContract;
        this.abi = abi;
        this.wasmPath = wasmPath;
        this.context = context;

        let generatedCalls = this.generateMethods(this.handleCall);
        for (const key in generatedCalls) {
            this[key] = generatedCalls[key];
        }
        this.call = generatedCalls;
        this.call.deploy = this.deploy.bind(this);
        this.query = this.generateMethods(this.handleQuery);
        this.rawTx = this.generateMethods(this.handleRawTx);
        this.rawTx.deploy = this.rawTxDeploy.bind(this);
        this.argBuffers = this.generateMethods(this.handleArgs);
        this.argBuffers.deploy = this.handleArgs.bind(this, new ContractFunction("deploy"));
    }

    caller(caller: TestWallet): ContractWrapper {
        this.context.caller(caller);
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

    valueEgld(valueEgld: BigNumber.Value): ContractWrapper {
        this.context.valueEgld(valueEgld);
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
        await synchronizeNetworkConfigIfNeeded(this.context);

        let constructorDefinition = this.abi.getConstructorDefinition();
        let convertedArgs = convertArgsFromNativeValues(args, constructorDefinition);
        let transactionDeploy = this.smartContract.deploy({
            code: contractCode,
            gasLimit: this.context.getGasLimit(),
            initArguments: convertedArgs
        });
        return transactionDeploy;
    }

    async deploy(...args: any[]): Promise<void> {
        let transactionDeploy = await this.buildDeployTransaction(args);

        let provider = this.context.getProvider();
        let callerAccount = this.context.getCaller().account;
        transactionDeploy.setNonce(callerAccount.nonce);
        await this.context.getCaller().signer.sign(transactionDeploy);
        let logger = this.context.getLogger();
        logger?.transactionCreated(transactionDeploy);
        callerAccount.incrementNonce();
        await transactionDeploy.send(provider);
        logger?.transactionSent(transactionDeploy);
        await transactionDeploy.awaitExecuted(provider);
        let transactionOnNetwork = await transactionDeploy.getAsOnNetwork(provider, true, false);
        let smartContractResults = transactionOnNetwork.getSmartContractResults();
        let immediateResult = smartContractResults.getImmediate();
        immediateResult.assertSuccess();
        logger?.deployComplete(transactionDeploy, smartContractResults, this.smartContract.getAddress());
    }

    private async rawTxDeploy(...args: any[]): Promise<Transaction> {
        return await this.buildDeployTransaction(args);
    }

    static async fromProject(provider: IProvider, projectPath: string = ".") {
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

        return await ContractWrapper.fromAbi(provider, null, abiPath, wasmPath);
    }

    static async fromAbi(provider: IProvider, name: string | null, abiPath: string, wasmPath: string | null) {
        let abiRegistry = await loadAbiRegistry([abiPath]);
        let names = name ? [name] : abiRegistry.interfaces.map(iface => iface.name);
        let abi = new SmartContractAbi(abiRegistry, names);
        let smartContract = new SmartContract({ abi: abi });

        let sendContext = new SendContext(provider).logger(new ContractLogger());
        let contractWrapper = new ContractWrapper(smartContract, abi, wasmPath, sendContext);

        return contractWrapper;
    }

    private generateMethods<T>(handleInteraction: InteractionHandler<T>): Record<string, Method<T>> {
        let generated: Record<string, Method<T>> = {};
        for (const endpoint of this.abi.getAllEndpoints()) {
            let functionName = endpoint.name;
            let func = new ContractFunction(functionName);
            generated[functionName] = handleInteraction.bind(this, func);
        }
        return generated;
    }

    async handleQuery(func: ContractFunction, ...args: any[]): Promise<any> {
        let interaction: Interaction = await this.prepareInteraction(func, args);
        let provider = this.context.getProvider();
        let logger = this.context.getLogger();

        setValueForPayableMethods(this.context, interaction);
        this.context.checker.checkInteraction(interaction);

        let query = interaction.buildQuery();
        logger?.queryCreated(query);
        query.caller = this.context.getSender().address;
        let response = await provider.queryContract(query);
        let queryResponseBundle = interaction.interpretQueryResponse(response);
        let result = queryResponseBundle.firstValue?.valueOf();
        logger?.queryComplete(result, response);

        return result;
    }

    async handleCall(func: ContractFunction, ...args: any[]): Promise<any> {
        let { transaction, interaction } = await this.buildTransaction(func, args);

        let provider = this.context.getProvider();
        await this.context.getSender().signer.sign(transaction);
        this.context.getSender().account.incrementNonce();
        let logger = this.context.getLogger();
        logger?.transactionCreated(transaction);
        await transaction.send(provider);

        logger?.transactionSent(transaction);
        await transaction.awaitExecuted(provider);
        let transactionOnNetwork = await transaction.getAsOnNetwork(provider, true, false);
        let executionResultsBundle = interaction.interpretExecutionResults(transactionOnNetwork);
        let result = executionResultsBundle.firstValue?.valueOf();
        let smartContractResults = executionResultsBundle.smartContractResults;
        logger?.transactionComplete(result, executionResultsBundle.immediateResult.data, transaction, smartContractResults);

        return result;
    }

    async handleRawTx(func: ContractFunction, ...args: any[]): Promise<Transaction> {
        let { transaction } = await this.buildInteractionAndTransaction(func, args);
        return transaction;
    }

    handleArgs(func: ContractFunction, ...args: any[]): Buffer[] {
        let endpointDefinition = func.name == "deploy" ? this.abi.getConstructorDefinition() : this.abi.getEndpoint(func.name);
        let convertedArgs = convertArgsFromNativeValues(args, endpointDefinition);
        let argSerializer = new ArgSerializer();
        return argSerializer.valuesToBuffers(convertedArgs);
    }

    async buildTransaction(func: ContractFunction, args: any[]): Promise<{ transaction: Transaction, interaction: Interaction }> {
        let interaction: Interaction = await this.prepareInteraction(func, args);

        interaction.withGasLimit(this.context.getGasLimit());
        interaction.withNonce(this.context.getSender().account.nonce);

        setValueForPayableMethods(this.context, interaction);
        this.context.checker.checkInteraction(interaction);

        let transaction = interaction.buildTransaction();
        return { transaction, interaction };
    }

    async prepareInteraction(func: ContractFunction, args: any[]): Promise<Interaction> {
        let smartContract: SmartContract = this.getSmartContract();
        let endpointDefinition: EndpointDefinition = this.getAbi().getEndpoint(func.name);
        let convertedArgs = convertArgsFromNativeValues(args, endpointDefinition);
        let interaction = new Interaction(smartContract, func, convertedArgs);
        await synchronizeNetworkConfigIfNeeded(this.context);
        return interaction;
    }
}

type InteractionHandler<T> = (this: ContractWrapper, func: ContractFunction, ...args: any[]) => T;
type Method<T> = (...args: any[]) => T;

function setValueForPayableMethods(context: SendContext, interaction: Interaction) {
    if (interaction.getEndpointDefinition().modifiers.isPayableInEGLD()) {
        interaction.withValue(context.getAndResetValue());
    } else {
        context.assertNoValue();
    }
}

async function synchronizeNetworkConfigIfNeeded(context: SendContext) {
    let networkConfig = NetworkConfig.getDefault();
    if (!networkConfig.isSynchronized) {
        await networkConfig.sync(context.getProvider());
        context.getLogger()?.synchronizedNetworkConfig(networkConfig);
    }
}

function convertArgsFromNativeValues(args: any[], endpointDefinition: EndpointDefinition) {
    if (args.length != endpointDefinition.input.length) {
        throw new ErrInvalidArgument(`Wrong number of arguments: expected ${endpointDefinition.input.length}, got ${args.length}`);
    }
    return ArgSerializer.nativeToTypedValues(args, endpointDefinition.input);
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
