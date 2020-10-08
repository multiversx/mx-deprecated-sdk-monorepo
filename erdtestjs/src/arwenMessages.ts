import { AccountOnNetwork, Address, Balance, Nonce,  Code, CodeMetadata, Argument, ContractFunction, GasPrice, GasLimit } from "@elrondnetwork/erdjs";
import { CreateAccountResponse } from "./worldMessages";

export class RequestBase {
    databasePath: string = "";
    world: string = "";
}

export class ResponseBase {
    Error: string = "";

    isSuccess(): boolean {
        return this.Error ? false : true;
    }
}

export class ContractRequestBase extends RequestBase {
    impersonated: Address = new Address();
    value: Balance = Balance.Zero();
    gasPrice: GasPrice = GasPrice.min();
    gasLimit: GasLimit = GasLimit.min();
}

export class ContractResponseBase extends ResponseBase {
    Input: any = {};
    Output: VMOutput = new VMOutput();
    ReturnCodeString: string = "";

    isSuccess(): boolean {
        let ok = this.ReturnCodeString == "ok";
        return ok && super.isSuccess();
    }

    firstResult(): WrappedContractReturnData {
        let first = this.Output.ReturnData[0];
        return new WrappedContractReturnData(first);
    }
}

export class DeployRequest extends ContractRequestBase {
    code: Code = Code.nothing();
    codePath: string = "";
    codeMetadata: CodeMetadata = new CodeMetadata();
    arguments: Argument[] = [];
}

export class DeployResponse extends ContractResponseBase {
    ContractAddressHex: string = "";

    getContractAddress(): Address {
        return new Address(this.ContractAddressHex);
    }
}

export class UpgradeRequest extends DeployRequest {
    contractAddress: string = "";
}

export class UpgradeResponse extends ContractResponseBase {
}

export class RunRequest extends ContractRequestBase {
    contractAddress: Address = new Address();
    function: ContractFunction = ContractFunction.none();
    arguments: Argument[] = [];
}

export class RunResponse extends ContractResponseBase {
}

export class QueryRequest extends RunRequest {
}

export class QueryResponse extends ContractResponseBase {
}

export class CreateAccountRequest extends RequestBase {
    address: Address = new Address();
    balance: Balance = Balance.Zero();
    nonce: Nonce = new Nonce(0);
}

export class CreateAccountResponseDto {
    Account: AccountDto | null = null;

    toWorldMessage(): CreateAccountResponse  {
        let response = new CreateAccountResponse();
        let accountDto = this.Account!;

        response.account = new AccountOnNetwork({
            address: new Address(accountDto.AddressHex),
            nonce: new Nonce(accountDto.Nonce),
            balance: Balance.fromString(accountDto.BalanceString)
        });

        return response;
    }
}

export class AccountDto {
    AddressHex: string = "";
    Nonce: number = 0;
    BalanceString: string = "0";
    CodeHex: string = "0";
    CodeMetadataHex: string = "0";
}

export class VMOutput {
    ReturnData: any[] = [];
    ReturnCode: number = 0;
    ReturnMessage: string = "";
    GasRemaining: number = 0;
    GasRefund: number = 0;
    OutputAccounts: any = {};
    DeletedAccounts: any[] = [];
    TouchedAccounts: any[] = [];
    Logs: any[] = [];
    // TODO: Storage updates for OutputAccounts. Decode base64.
}

export class WrappedContractReturnData {
    raw: any;
    asHex: string;
    asNumber: number;
    asString: string;

    constructor(raw: any) {
        let buffer = Buffer.from(raw, "base64");

        this.raw = raw;
        this.asHex = buffer.toString("hex");
        this.asNumber = parseInt(this.asHex, 16) || 0;
        this.asString = buffer.toString();
    }
}
