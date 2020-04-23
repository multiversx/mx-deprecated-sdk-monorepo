import { ArwenDebugProvider, CreateAccountResponse } from "./arwen";
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

    async createAccount(address: string, balance: string = "1000000000", nonce: number = 0): Promise<CreateAccountResponse> {
        return await this.provider.createAccount({
            databasePath: this.databasePath,
            world: this.uniqueName,
            address: address,
            balance: balance,
            nonce: nonce
        });
    }
}
