import { ERC20Client } from "./interface";
import { Provider } from "../../providers/interface";
import { Account, Address } from "../account";
import { SmartContract } from "./smartcontract";
import { SmartContractCall } from "./scCall";
import * as errors from "../errors";

export class BasicERC20Client extends SmartContract implements ERC20Client {
    protected defaultDecimals = 18;
    protected functionName_totalSupply = "totalSupply";
    protected functionName_balanceOf = "balanceOf";
    protected functionName_transfer = "transfer";

    public name(): string {
        return "";
    }

    public symbol(): string {
        return "";
    }

    public decimals(): number {
        return this.defaultDecimals;
    }

    public async totalSupply(): Promise<bigint> {
        // TODO clean this up and rely on this.performCall(), once the
        // providers can return SmartContractResults
        if (this.provider == null) {
            throw errors.ErrProviderNotSet;
        }
        if (this.scAddress == null) {
            throw errors.ErrSCAddressNotSet;
        }

        let result = await this.provider.getVMValueInt(
            this.scAddress.toString(),
            this.functionName_totalSupply,
            []
        );

        return result;
    }

    public async balanceOf(address: string): Promise<bigint> {
        // TODO clean this up and rely on this.performCall(), once the
        // providers can return SmartContractResults
        if (this.provider == null) {
            throw errors.ErrProviderNotSet;
        }
        if (this.scAddress == null) {
            throw errors.ErrSCAddressNotSet;
        }
        address;

        let result = await this.provider.getVMValueInt(
            this.scAddress.toString(),
            this.functionName_balanceOf,
            [address]
        );

        return result;
    }

    public async transfer(receiver: string, value: bigint): Promise<boolean> {
        let call = new SmartContractCall(null);
        call.setFunctionName(this.functionName_transfer);
        call.addRawArgument(receiver);
        call.addBigIntArgument(value);

        let result = false;
        try {
            await this.performCall(call);
            result = true;
        } catch(err) {
            result = false;
            console.error(err);
        } finally {
            this.cleanupCall();
            return result;
        }
    }

    public transferFrom(sender: string, receiver: string, value: bigint): Promise<boolean> {
        sender;
        receiver;
        value;
        throw new Error("Method not implemented.");
    }

    public approve(spender: string, value: bigint): Promise<boolean> {
        spender;
        value;
        throw new Error("Method not implemented.");
    }

    public allowance(owner: string, spender: string): Promise<bigint> {
        owner;
        spender;
        throw new Error("Method not implemented.");
    }
}
