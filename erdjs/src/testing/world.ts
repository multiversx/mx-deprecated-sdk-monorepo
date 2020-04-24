import { ArwenDebugProvider, CreateAccountResponse, DeployRequest, DeployResponse, RunResponse } from "./arwen";
import { ArwenCLI } from "./arwenCli";
import { getToolsSubfolder } from "./workstation";

export class World {
    private uniqueName: string;
    private databasePath: string;
    private provider: ArwenDebugProvider;

    constructor(name: string, databasePath: string = "") {
        this.uniqueName = `${name}${Date.now()}`;
        this.databasePath = databasePath || this.getDefaultDatabasePath();
        this.provider = new ArwenCLI();
    }

    private getDefaultDatabasePath(): string {
        return getToolsSubfolder("tests-db");
    }

    async deployContract(
        { impersonated, code, codePath, codeMetadata, args, value, gasLimit, gasPrice }
            : { impersonated: string, code?: string, codePath?: string, codeMetadata?: string, args?: any, value?: string, gasLimit?: number, gasPrice?: number })
        : Promise<DeployResponse> {
        return await this.provider.deployContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            impersonated: impersonated,
            code: code || "",
            codeMetadata: codeMetadata || "",
            codePath: codePath || "",
            arguments: args,
            value: value || "0",
            gasLimit: gasLimit || 0,
            gasPrice: gasPrice || 0
        });
    }

    async runContract(
        { contract, impersonated, functionName, args, value, gasLimit, gasPrice }
            : { contract: string, impersonated: string, functionName: string, args?: any, value?: string, gasLimit?: number, gasPrice?: number })
        : Promise<RunResponse> {
        return await this.provider.runContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            contractAddress: contract,
            impersonated: impersonated,
            function: functionName,
            arguments: args,
            value: value || "0",
            gasLimit: gasLimit || 0,
            gasPrice: gasPrice || 0
        });
    }

    async createAccount(
        { address, balance, nonce }
            : { address: string, balance?: string, nonce?: number })
        : Promise<CreateAccountResponse> {
        return await this.provider.createAccount({
            databasePath: this.databasePath,
            world: this.uniqueName,
            address: address,
            balance: balance || "100000000",
            nonce: nonce || 0
        });
    }
}
