import { ContractFunction } from "../function";
import { Address } from "../../address";
import { SmartContract } from "../smartContract";
import { Interaction } from "../interaction";
import { loadAbiRegistry, loadContractCode, TestWallet } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { DefaultInteractionRunner } from "../defaultRunner";
import { SendContext } from "./sendContext";
import { IProvider } from "../../interface";
import { ArgSerializer } from "../argSerializer";
import { Err } from "../../errors";
import { ContractLogger } from "./contractLogger";


/**
 * Provides a simple interface in order to easily call or query the smart contract's methods.
 */
export class ContractWrapper {
    private smartContract: SmartContract;
    private context: SendContext;
    private wasm_path: string | null;
    private abi: SmartContractAbi;
    private static method: Function = async function method(this: ContractWrapper, handleInteraction: Function, func: ContractFunction, ...args: any[]): Promise<any> {
        let endpointDefinition = this.abi.getEndpoint(func.name);
        let converted_args = ArgSerializer.nativeToTypedValues(args, endpointDefinition.input);
        let sender = this.context.getSender();
        let signer = sender.signer;
        let runner = new DefaultInteractionRunner(this.context.checker, signer, this.context.getProvider());
        let interaction = new Interaction(this.smartContract, func, converted_args);
        let result = await handleInteraction(this.context, interaction);


        //console.log(`Method (${handleInteraction.name}) result for ${func.name} is ${result}`);
        return result;
    };
    [key: string]: any;

    private constructor(
        smartContract: SmartContract,
        abi: SmartContractAbi,
        wasm_path: string | null,
        context: SendContext,
    ) {
        this.smartContract = smartContract;
        this.abi = abi;
        this.wasm_path = wasm_path;
        this.context = context;
    }

    caller(caller: TestWallet) {
        this.context.caller(caller);
        return this;
    }

    gas(gas: number) {
        this.context.gas(gas);
        return this;
    }

    address(address: Address) {
        this.smartContract.setAddress(address);
        return this;
    }

    logger(logger: ContractLogger | null) {
        this.context.logger(logger)
        return this;
    }

    async deploy(...args: any[]): Promise<void> {
        if (this.wasm_path == null) {
            throw new Err("contract wasm path not configured");
        }
        let constructorDefinition = this.abi.getConstructorDefinition();
        let converted_args = ArgSerializer.nativeToTypedValues(args, constructorDefinition.input);
        let transactionDeploy = this.smartContract.deploy({
            code: await loadContractCode(this.wasm_path),
            gasLimit: this.context.getGasLimit(),
            initArguments: converted_args
        });

        transactionDeploy.setNonce(this.context.getCaller().account.getNonceThenIncrement());
        await this.context.getCaller().signer.sign(transactionDeploy);
        let provider = this.context.getProvider();
        await transactionDeploy.send(provider);
        let logger = this.context.getLogger();
        logger?.deploySent(transactionDeploy);
        await transactionDeploy.awaitExecuted(provider);
        let transactionOnNetwork = await transactionDeploy.getAsOnNetwork(provider);
        let smartContractResults = transactionOnNetwork.getSmartContractResults();
        logger?.deployComplete(transactionDeploy, smartContractResults);
    }

    static async from_abi(name: string, abi_path: string, wasm_path: string | null, provider: IProvider) {
        let abiRegistry = await loadAbiRegistry([abi_path]);
        let abi = new SmartContractAbi(abiRegistry, [name]);
        let smartContract = new SmartContract({ abi: abi });

        let sendContext = new SendContext(provider);
        let contractWrapper = new ContractWrapper(smartContract, abi, wasm_path, sendContext);

        let generatedCalls = this.generate_methods(contractWrapper, call);
        //console.log(generatedCalls);
        contractWrapper = Object.assign(contractWrapper, generatedCalls);
        contractWrapper.call = generatedCalls;
        contractWrapper.query = this.generate_methods(contractWrapper, query);

        // TODO: build deploy (constructor) function

        return contractWrapper;
    }

    private static generate_methods(contractWrapper: ContractWrapper, handleInteraction: Function): any {
        let generated: any = {};
        for (const endpoint of contractWrapper.abi.getAllEndpoints()) {
            let function_name = endpoint.name;
            let func = new ContractFunction(function_name);
            generated[function_name] = this.method.bind(contractWrapper, handleInteraction, func);
        }
        return generated;
    }
}

async function query(context: SendContext, interaction: Interaction): Promise<any> {
    let logger = context.getLogger();
    context.checker.checkInteraction(interaction);

    let query = interaction.buildQuery();
    logger?.queryCreated(query);
    query.caller = context.getSender().address;
    let provider = context.getProvider();
    let response = await provider.queryContract(query);
    let queryResponseBundle = interaction.interpretQueryResponse(response);
    let result = queryResponseBundle.firstValue?.valueOf();
    logger?.queryComplete(result, response);

    return result;
}

async function call(context: SendContext, interaction: Interaction): Promise<any> {
    let provider = context.getProvider();
    interaction.withNonce(context.getSender().account.getNonceThenIncrement());
    interaction.withGasLimit(context.getGasLimit());
    context.checker.checkInteraction(interaction);

    let transaction = interaction.buildTransaction();
    await context.getSender().signer.sign(transaction);
    let logger = context.getLogger();
    logger?.transactionCreated(transaction);
    await transaction.send(provider);
    logger?.transactionSent(transaction);
    await transaction.awaitExecuted(provider);
    // This will wait until the transaction is notarized, as well (so that SCRs are returned by the API).
    let transactionOnNetwork = await transaction.getAsOnNetwork(provider);
    let executionResultsBundle = interaction.interpretExecutionResults(transactionOnNetwork);
    let result = executionResultsBundle.firstValue?.valueOf();
    let smartContractResults = executionResultsBundle.smartContractResults;
    logger?.transactionComplete(result, transactionOnNetwork.data.toString(), transaction, smartContractResults);

    return result;
}
