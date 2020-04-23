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
    error: string = "";
}

export class ContractRequestBase extends RequestBase {
    impersonated: string = "";
    value: string = "";
    gasPrice: number = 0;
    gasLimit: number = 0;
}

export class ContractResponseBase extends ResponseBase {
    input: any = {};
    output: any = {};
}

export class DeployRequest extends ContractRequestBase {
    code: string = "";
    codePath: string = "";
    codeMetadata: string = "";
    arguments: string[] = [];
}

export class DeployResponse extends ContractResponseBase {
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
