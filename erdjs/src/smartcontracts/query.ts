import { ContractFunction } from "./function";
import { Argument } from "./arguments";
import { Balance } from "../balance";
import { Address } from "../address";
import { guardValueIsSet } from "../utils";

export const MaxUint64 = BigInt("18446744073709551615");

export class Query {
    caller: Address;
    address: Address;
    func: ContractFunction;
    args: Argument[];
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
            "ScAddress": this.address.bech32(),
            "FuncName": this.func.toString(),
            "Args": this.args.map(arg => arg.toString()),
            "CallValue": this.value.toString()
        };

        if (!this.caller.isEmpty()) {
            request["CallerAddr"] = this.caller.bech32();
        }

        return request;
    }
}
