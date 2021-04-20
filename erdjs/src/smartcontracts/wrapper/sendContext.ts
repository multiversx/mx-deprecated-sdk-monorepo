import { GasLimit } from "../../networkParams";
import { IInteractionChecker } from "../interface";
import { IProvider } from "../../interface";
import { StrictChecker } from "../strictChecker";
import * as errors from "../../errors";
import { ContractLogger } from "./contractLogger";
import { TestWallet } from "../../testutils";

/**
 * SendContext stores contextual information which is needed when preparing a transaction.
 * 
 * This information 
 */
export class SendContext {
    private caller_: TestWallet | null;
    private provider_: IProvider;
    private gas_: GasLimit | null;
    private logger_: ContractLogger | null;
    readonly checker: IInteractionChecker;

    constructor(provider: IProvider) {
        this.caller_ = null;
        this.provider_ = provider;
        this.gas_ = null;
        this.checker = new StrictChecker();
        this.logger_ = null;
    }

    provider(provider: IProvider) {
        this.provider_ = provider;
        return this;
    }

    caller(caller: TestWallet) {
        this.caller_ = caller;
        return this;
    }

    gas(gas: number) {
        this.gas_ = new GasLimit(gas);
        return this;
    }

    logger(logger: ContractLogger | null) {
        this.logger_ = logger;
        return this;
    }

    getCaller(): TestWallet {
        if (this.caller_) {
            return this.caller_;
        }
        throw new errors.Err("caller not set");
    }

    getSender(): TestWallet {
        return this.getCaller();
    }

    getProvider(): IProvider {
        return this.provider_;
    }

    getGasLimit(): GasLimit {
        if (this.gas_) {
            return this.gas_;
        }
        throw new errors.Err("gas limit not set");
    }

    getLogger(): ContractLogger | null {
        return this.logger_;
    }
}
