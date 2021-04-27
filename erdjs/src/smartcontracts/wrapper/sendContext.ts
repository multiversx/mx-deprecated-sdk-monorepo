import { GasLimit } from "../../networkParams";
import { IInteractionChecker } from "../interface";
import { IProvider } from "../../interface";
import { StrictChecker } from "../strictChecker";
import * as errors from "../../errors";
import { ContractLogger } from "./contractLogger";
import { TestWallet } from "../../testutils";
import { Balance } from "../../balance";
import BigNumber from "bignumber.js";

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
    private value_: Balance | null;
    readonly checker: IInteractionChecker;

    constructor(provider: IProvider) {
        this.caller_ = null;
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

    caller(caller: TestWallet): SendContext {
        this.caller_ = caller;
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

    valueEgld(value: BigNumber.Value): SendContext {
        return this.value(Balance.egld(value));
    }

    getAndResetValue(): Balance {
        if (this.value_ == null) {
            throw new errors.Err("Did not provide a value for a payable method");
        }
        let value = this.value_;
        this.value_ = null;
        return value;
    }

    assertNoValue(): void {
        if (this.value_ != null) {
            throw new errors.Err("Value was provided but the method is not payable");
        }
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
