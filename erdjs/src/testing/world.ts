import { ArwenDebugProvider } from "./arwen";
import { ArwenCLI } from "./arwenCli";
import { getToolsSubfolder } from "./workstation";

export class World {
    private name: string;
    private uniqueName: string;
    private databasePath: string;
    private provider: ArwenDebugProvider;

    constructor(name: string) {
        this.name = name;
        this.uniqueName = `${name}${Date.now()}`;
        this.databasePath = getToolsSubfolder("tests-db");
        this.provider = new ArwenCLI();
    }

    async createAccount(address: string, balance: string = "1000000000", nonce: number = 0): Promise<any> {
        this.provider.createAccount({
            databasePath: this.databasePath,
            world: this.uniqueName,
            address: address,
            balance: balance,
            nonce: nonce
        });
    }
}
