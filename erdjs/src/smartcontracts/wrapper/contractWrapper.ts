import { ContractFunction } from "../function";
import { Address } from "../../address";
import { SmartContract } from "../smartContract";
import { Interaction } from "../interaction";
import { loadAbiRegistry } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { DefaultInteractionRunner } from "../defaultRunner";
import { SendContext } from "./sendContext";
import { WalletWrapper } from "./walletWrapper";
import { IProvider } from "../../interface";
import { IInteractionRunner } from "../interface";
import { ArgSerializer } from "../argSerializer";


/**
 * Provides a simple interface in order to easily call or query the smart contract's methods.
 */
export class ContractWrapper {
    private smartContract: SmartContract;
    private context: SendContext;
    private abi: SmartContractAbi;
    private static method: Function = async function method(this: ContractWrapper, handleInteraction: Function, func: ContractFunction, ...args: any[]): Promise<any> {
        let endpointDefinition = this.abi.getEndpoint(func.name);
        let converted_args = ArgSerializer.nativeToValues(args, endpointDefinition.input);
        let sender = this.context.getSender();
        let signer = sender.wallet.signer;
        let runner = new DefaultInteractionRunner(this.context.checker, signer, this.context.getProvider());
        let interaction = new Interaction(this.smartContract, func, converted_args);
        let result = await handleInteraction(this.context, interaction, runner);
        if (result != null) {
            result = result.valueOf();
        }
        //console.log(`Method (${handleInteraction.name}) result for ${func.name} is ${result}`);
        return result;
    };

    [key: string]: any;

    private constructor(
        smartContract: SmartContract,
        abi: SmartContractAbi,
        context: SendContext,
    ) {
        this.smartContract = smartContract;
        this.abi = abi;
        this.context = context;
    }

    caller(caller: WalletWrapper) {
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

    static async from_abi(name: string, abi_path: string, provider: IProvider) {
        let abiRegistry = await loadAbiRegistry([abi_path]);
        let abi = new SmartContractAbi(abiRegistry, [name]);
        let smartContract = new SmartContract({ abi: abi });

        let sendContext = new SendContext(provider);
        let contractWrapper = new ContractWrapper(smartContract, abi, sendContext);

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

async function query(_context: SendContext, interaction: Interaction, runner: IInteractionRunner): Promise<any> {
    let QueryResponseBundle = await runner.runQuery(interaction);
    return QueryResponseBundle.firstValue;
}

async function call(context: SendContext, interaction: Interaction, runner: IInteractionRunner): Promise<any> {
    interaction.withNonce(context.getSender().account.getNonceThenIncrement());
    interaction.withGasLimit(context.getGasLimit());
    let executionResultsBundle = await runner.runAwaitExecution(interaction);
    return executionResultsBundle.firstValue;
}
