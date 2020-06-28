import path = require("path");
import { ArwenDebugProvider, CreateAccountResponse, DeployRequest, DeployResponse, RunResponse, QueryResponse } from "./arwen";
import { ArwenCLI } from "./arwenCli";
import { getToolsSubfolder } from "./workstation";
import { Address } from "@elrondnetwork/erdjs";
import { readJSONFileAsAny } from "./ioutils";


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

    private getPath(): string {
        return path.join(this.databasePath, "worlds", `${this.uniqueName}.json`);
    }

    async deployContract(
        { impersonated, code, codePath, codeMetadata, args, value, gasLimit, gasPrice }
            : { impersonated: Address, code?: string, codePath?: string, codeMetadata?: string, args?: any[], value?: string, gasLimit?: number, gasPrice?: number })
        : Promise<DeployResponse> {
        return await this.provider.deployContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            impersonated: impersonated,
            code: code || "",
            codeMetadata: codeMetadata || "",
            codePath: codePath || "",
            arguments: this.encodeArguments(args || []),
            value: value || "0",
            gasLimit: gasLimit || 0,
            gasPrice: gasPrice || 0
        });
    }

    async runContract(
        { contract, impersonated, functionName, args, value, gasLimit, gasPrice }
            : { contract: Address, impersonated: Address, functionName: string, args?: any[], value?: string, gasLimit?: number, gasPrice?: number })
        : Promise<RunResponse> {
        return await this.provider.runContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            contractAddress: contract,
            impersonated: impersonated,
            function: functionName,
            arguments: this.encodeArguments(args || []),
            value: value || "0",
            gasLimit: gasLimit || 0,
            gasPrice: gasPrice || 0
        });
    }

    async queryContract(
        { contract, impersonated, functionName, args, gasLimit }
            : { contract: Address, impersonated: Address, functionName: string, args?: any[], gasLimit?: number })
        : Promise<QueryResponse> {
        return await this.provider.queryContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            contractAddress: contract,
            impersonated: impersonated,
            function: functionName,
            arguments: this.encodeArguments(args || []),
            value: "0",
            gasLimit: gasLimit || 0,
            gasPrice: 0
        });
    }

    async createAccount(
        { address, balance, nonce }
            : { address: Address, balance?: string, nonce?: number })
        : Promise<CreateAccountResponse> {
        return await this.provider.createAccount({
            databasePath: this.databasePath,
            world: this.uniqueName,
            address: address,
            balance: balance || "100000000",
            nonce: nonce || 0
        });
    }

    private encodeArguments(args: any[]): string[] {
        return args.map(this.encodeArgument);
    }

    private encodeArgument(arg: any): string {
        let hexString = "";

        if (typeof arg === "string") {
            let argString = String(arg);
            let buffer = Buffer.from(argString);
            hexString = buffer.toString("hex");
        } else if (typeof arg === "number") {
            let argNumber = Number(arg);
            hexString = argNumber.toString(16);
        } else {
            throw new Error("Cannot encode argument.");
        }

        let hexStringLength = hexString.length % 2 == 0 ? hexString.length : hexString.length + 1;
        let paddedHexString = hexString.padStart(hexStringLength, "0");
        return paddedHexString;
    }

    getAccountStorage(address: Address): WorldAccountStorage | null {
        let accounts = this.loadAccounts();
        let account = accounts.getByAddress(address);
        if (!account) {
            return null;
        }

        return account.Storage;
    }

    loadAccounts(): WorldAccounts {
        let worldState = readJSONFileAsAny(this.getPath());
        let accountsMap = worldState.Accounts || {};
        let accounts = [];
        for (const [, value] of Object.entries(accountsMap)) {
            accounts.push(new WorldAccount(value));
        }

        return new WorldAccounts(accounts);
    }
}

export class WorldAccounts {
    private accounts: WorldAccount[];

    constructor(accounts: WorldAccount[]) {
        this.accounts = accounts;
    }

    getByAddress(address: Address): WorldAccount | null {
        return this.accounts.find(item => item.Address.equals(address)) || null;
    }
}

export class WorldAccount {
    Address: Address;
    Nonce: number;
    Balance: BigInt;
    Storage: any;

    constructor(obj: any) {
        this.Address = new Address().setHex(obj.AddressHex);
        this.Nonce = obj.Nonce;
        this.Balance = BigInt(obj.Balance.toString());
        this.Storage = new WorldAccountStorage(obj.Storage);
    }
}

export class WorldAccountStorage {
    private map: any;

    constructor(storageMap: any) {
        this.map = storageMap;
    }

    byHex(hexKey: string): StorageValue | null {
        let item = this.map[hexKey];
        return item ? new StorageValue(item) : null;
    }

    byString(key: string): StorageValue | null {
        let buffer = Buffer.from(key);
        let hexKey = buffer.toString("hex");
        return this.byHex(hexKey);
    }
}

export class StorageValue {
    hex: string;

    constructor(hexValue: any) {
        this.hex = hexValue;
    }

    asHex(): string {
        return this.hex;
    }

    asAddress(): Address | null {
        return new Address().setHex(this.hex);
    }

    asNumber(): number {
        return parseInt(this.hex, 16) || 0;
    }

    asString(): string {
        let buffer = Buffer.from(this.hex, "hex");
        return buffer.toString();
    }
}
