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


/**
 * Provides a simple interface in order to easily call or query the smart contract's methods.
 */
export class ContractWrapper {
    private smartContract: SmartContract;
    private context: SendContext;
    private wasmPath: string | null;
    private abi: SmartContractAbi;
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

    address(address: Address): ContractWrapper {
        this.smartContract.setAddress(address);
        return this;
    }

    getAddress(): Address {
        return this.smartContract.getAddress();
    }

    logger(logger: ContractLogger | null): ContractWrapper {
        this.context.logger(logger);
        return this;
    }

    getContext(): SendContext {
        return this.context;
    }

    getAbi(): SmartContractAbi {
        return this.abi;
    }

    getSmartContract(): SmartContract {
        return this.smartContract;
    }

    async deploy(...args: any[]): Promise<void> {
        if (this.wasmPath == null) {
            throw new Err("contract wasm path not configured");
        }
        await synchronizeNetworkConfigIfNeeded(this.context);

        let constructorDefinition = this.abi.getConstructorDefinition();
        let convertedArgs = convertArgsFromNativeValues(args, constructorDefinition);
        let transactionDeploy = this.smartContract.deploy({
            code: await loadContractCode(this.wasmPath),
            gasLimit: this.context.getGasLimit(),
            initArguments: convertedArgs
        });

        let provider = this.context.getProvider();
        let callerAccount = this.context.getCaller().account;
        transactionDeploy.setNonce(callerAccount.nonce);
        await this.context.getCaller().signer.sign(transactionDeploy);
        callerAccount.incrementNonce();
        await transactionDeploy.send(provider);
        let logger = this.context.getLogger();
        logger?.deploySent(transactionDeploy);
        await transactionDeploy.awaitExecuted(provider);
        let transactionOnNetwork = await transactionDeploy.getAsOnNetwork(provider, true, false);
        let smartContractResults = transactionOnNetwork.getSmartContractResults();
        let immediateResult = smartContractResults.getImmediate();
        immediateResult.assertSuccess();
        logger?.deployComplete(transactionDeploy, smartContractResults, this.smartContract.getAddress());
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

        return ContractWrapper.fromAbi(provider, null, abiPath, wasmPath);
    }

    static async fromAbi(provider: IProvider, name: string | null, abiPath: string, wasmPath: string | null) {
        let abiRegistry = await loadAbiRegistry([abiPath]);
        let names = name ? [name] : abiRegistry.interfaces.map(iface => iface.name);
        let abi = new SmartContractAbi(abiRegistry, names);
        let smartContract = new SmartContract({ abi: abi });

        let sendContext = new SendContext(provider).logger(new ContractLogger());
        let contractWrapper = new ContractWrapper(smartContract, abi, wasmPath, sendContext);

        let generatedCalls = contractWrapper.generateMethods(call);
        //console.log(generatedCalls);
        contractWrapper = Object.assign(contractWrapper, generatedCalls);
        contractWrapper.call = generatedCalls;
        contractWrapper.query = contractWrapper.generateMethods(query);

        // TODO: build deploy (constructor) function

        return contractWrapper;
    }

    private generateMethods(handleInteraction: typeof call | typeof query): any {
        let generated: Record<string, AsyncMethod> = {};
        for (const endpoint of this.abi.getAllEndpoints()) {
            let functionName = endpoint.name;
            let func = new ContractFunction(functionName);
            let generatedMethod = methodHandler.bind(null, this, handleInteraction, func);
            generated[functionName] = generatedMethod;
        }
        return generated;
    }
}

type AsyncMethod = (...args: any[]) => Promise<any>;

async function methodHandler(wrapper: ContractWrapper, handleInteraction: typeof call | typeof query, func: ContractFunction, ...args: any[]): Promise<any> {
    let context: SendContext = wrapper.getContext();
    let abi: SmartContractAbi = wrapper.getAbi();
    let smartContract: SmartContract = wrapper.getSmartContract();
    let endpointDefinition = abi.getEndpoint(func.name);
    let convertedArgs = convertArgsFromNativeValues(args, endpointDefinition);
    let interaction = new Interaction(smartContract, func, convertedArgs);
    await synchronizeNetworkConfigIfNeeded(context);
    return await handleInteraction(context, interaction);
}

async function query(context: SendContext, interaction: Interaction): Promise<any> {
    let provider = context.getProvider();
    let logger = context.getLogger();

    setValueForPayableMethods(context, interaction);
    context.checker.checkInteraction(interaction);

    let query = interaction.buildQuery();
    logger?.queryCreated(query);
    query.caller = context.getSender().address;
    let response = await provider.queryContract(query);
    let queryResponseBundle = interaction.interpretQueryResponse(response);
    let result = queryResponseBundle.firstValue?.valueOf();
    logger?.queryComplete(result, response);

    return result;
}

async function call(context: SendContext, interaction: Interaction): Promise<any> {
    let provider = context.getProvider();

    interaction.withGasLimit(context.getGasLimit());
    let senderAccount = context.getSender().account;
    interaction.withNonce(senderAccount.nonce);

    setValueForPayableMethods(context, interaction);
    context.checker.checkInteraction(interaction);

    let transaction = interaction.buildTransaction();
    await context.getSender().signer.sign(transaction);
    senderAccount.incrementNonce();
    let logger = context.getLogger();
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
