export interface ArwenDebugProvider {
    deployContract(request: DeployRequest): Promise<DeployResponse>;
    upgradeContract(request: UpgradeRequest): Promise<UpgradeResponse>;
    runContract(request: RunRequest): Promise<RunResponse>;
    queryContract(request: QueryRequest): Promise<QueryResponse>;
    createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse>;
}

export class RequestBase {
    databasePath: string = "";
    world: string = "";
}

export class ResponseBase {
    Error: string = "";

    isSuccess(): Boolean {
        return this.Error ? false : true;
    }
}

export class ContractRequestBase extends RequestBase {
    impersonated: string = "";
    value: string = "";
    gasPrice: number = 0;
    gasLimit: number = 0;
}

export class ContractResponseBase extends ResponseBase {
    Input: any = {};
    Output: VMOutput = new VMOutput();

    isSuccess(): Boolean {
        let ok = this.Output.ReturnCode == 0;
        return ok && super.isSuccess();
    }
}

export class DeployRequest extends ContractRequestBase {
    code: string = "";
    codePath: string = "";
    codeMetadata: string = "";
    arguments: string[] = [];
}

export class DeployResponse extends ContractResponseBase {
    ContractAddress: string = ""
}

export class UpgradeRequest extends DeployRequest {
    contractAddress: string = "";
}

export class UpgradeResponse extends ContractResponseBase {
}

export class RunRequest extends ContractRequestBase {
    contractAddress: string = "";
    function: string = "";
    arguments: string[] = [];
}

export class RunResponse extends ContractResponseBase {
}

export class QueryRequest extends RunRequest {
}

export class QueryResponse extends ContractResponseBase {
}

export class CreateAccountRequest extends RequestBase {
    address: string = "";
    balance: string = "";
    nonce: number = 0;
}

export class CreateAccountResponse {
    Account: Account | null = null;
}

export class Account {
    Address: string = "";
    Nonce: number = 0;
    Balance: number = 0;
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
}
