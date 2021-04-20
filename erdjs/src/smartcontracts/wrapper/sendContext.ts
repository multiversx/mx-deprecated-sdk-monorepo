import { Balance } from "../../balance";
import { GasLimit } from "../../networkParams";
import { Transaction } from "../../transaction";
import { TransactionOnNetwork } from "../../transactionOnNetwork";
import { Query } from "../query";
import { QueryResponse } from "../queryResponse";
import { ContractFunction } from "../function";
import { Account } from "../../account";
import { SmartContract } from "../smartContract";
import { EndpointDefinition, TypedValue } from "../typesystem";
import { Nonce } from "../../nonce";
import { ExecutionResultsBundle, IInteractionChecker, QueryResponseBundle } from "../interface";
import { IProvider, ISigner } from "../../interface";
import { StrictChecker } from "../strictChecker";
import { WalletWrapper } from "./walletWrapper";
import * as errors from "../../errors";

/**
 * SendContext stores contextual information which is needed when preparing a transaction.
 * 
 * This information 
 */
export class SendContext {
    private caller_: WalletWrapper | null;
    private provider_: IProvider;
    private gas_: GasLimit | null;
    checker: IInteractionChecker;

    constructor(provider: IProvider) {
        this.caller_ = null;
        this.provider_ = provider;
        this.gas_ = null;
        this.checker = new StrictChecker();
    }

    provider(provider: IProvider) {
        this.provider_ = provider;
        return this;
    }

    caller(caller: WalletWrapper) {
        this.caller_ = caller;
        return this;
    }

    gas(gas: number) {
        this.gas_ = new GasLimit(gas);
        return this;
    }

    getCaller(): WalletWrapper {
        if (this.caller_) {
            return this.caller_;
        }
        throw new errors.Err("caller not set");
    }

    getSender(): WalletWrapper {
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
}
