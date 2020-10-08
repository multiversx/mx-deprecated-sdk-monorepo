import { DeployRequest, DeployResponse, UpgradeRequest, UpgradeResponse, RunRequest, RunResponse, QueryRequest, QueryResponse, CreateAccountRequest } from "./arwenMessages";
import { CreateAccountResponse } from "./worldMessages";


export interface ArwenDebugProvider {
    deployContract(request: DeployRequest): Promise<DeployResponse>;
    upgradeContract(request: UpgradeRequest): Promise<UpgradeResponse>;
    runContract(request: RunRequest): Promise<RunResponse>;
    queryContract(request: QueryRequest): Promise<QueryResponse>;
    createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse>;
}
