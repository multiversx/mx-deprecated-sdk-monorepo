import { GasLimit } from "../../networkParams";
import { IInteractionChecker } from "../interface";
import { IProvider } from "../../interface";
import { StrictChecker } from "../strictChecker";
import { ContractLogger } from "./contractLogger";
import { TestWallet } from "../../testutils";
import { Balance } from "../../balance";
import { Err } from "../../errors";

/**
 * Stores contextual information which is needed when preparing a transaction.
 */
export class SendContext {
    private sender_: TestWallet | null;
    private provider_: IProvider;
    private gas_: GasLimit | null;
    private logger_: ContractLogger | null;
    private value_: Balance | null;
    readonly checker: IInteractionChecker;

    constructor(provider: IProvider) {
        this.sender_ = null;
        this.provider_ = provider;
        this.gas_ = null;
        this.logger_ = null;
        this.value_ = null;
        this.checker = new StrictChecker();
    }

    provider(provider: IProvider): SendContext {
        this.provider_ = provider;
        return this;
    }

    sender(sender: TestWallet): SendContext {
        this.sender_ = sender;
        return this;
    }

    gas(gas: number): SendContext {
        this.gas_ = new GasLimit(gas);
        return this;
    }

    logger(logger: ContractLogger | null): SendContext {
        this.logger_ = logger;
        return this;
    }

    value(value: Balance): SendContext {
        this.value_ = value;
        return this;
    }

    getAndResetValue(): Balance | null {
        let value = this.value_;
        this.value_ = null;
        return value;
    }

    getSender(): TestWallet {
        if (this.sender_) {
            return this.sender_;
        }
        throw new Err("sender not set");
    }

    getProvider(): IProvider {
        return this.provider_;
    }

    getGasLimit(): GasLimit {
        if (this.gas_) {
            return this.gas_;
        }
        throw new Err("gas limit not set");
    }

    getLogger(): ContractLogger | null {
        return this.logger_;
    }
}
