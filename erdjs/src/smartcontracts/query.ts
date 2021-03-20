import { ContractFunction } from "./function";
import { Balance } from "../balance";
import { Address } from "../address";
import { guardValueIsSet } from "../utils";
import { TypedValue } from "./typesystem";
import { ArgSerializer } from "./argSerializer";
import BigNumber from "bignumber.js";

export const MaxUint64 = new BigNumber("18446744073709551615");

export class Query {
    caller: Address;
    address: Address;
    func: ContractFunction;
    args: TypedValue[];
    value: Balance;

    constructor(init?: Partial<Query>) {
        this.caller = new Address();
        this.address = new Address();
        this.func = ContractFunction.none();
        this.args = [];
        this.value = Balance.Zero();

        Object.assign(this, init);

        guardValueIsSet("address", this.address);
        guardValueIsSet("func", this.func);

        this.address.assertNotEmpty();
        this.args = this.args || [];
        this.caller = this.caller || new Address();
        this.value = this.value || Balance.Zero();
    }

    toHttpRequest() {
        let request: any = {
            "scAddress": this.address.bech32(),
            "funcName": this.func.toString(),
            "args": new ArgSerializer().valuesToStrings(this.args),
            "value": this.value.toString()
        };

        if (!this.caller.isEmpty()) {
            request["caller"] = this.caller.bech32();
        }

        return request;
    }
}
