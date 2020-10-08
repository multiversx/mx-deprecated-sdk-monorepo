import path = require("path");
import { DeployResponse, RunResponse, QueryResponse } from "./arwenMessages";
import { ArwenDebugProvider } from "./arwenInterfaces";
import { ArwenCLI } from "./arwenCli";
import { getToolsSubfolder } from "./workstation";
import { Address, Balance, Nonce, Code, CodeMetadata, Argument, GasLimit, GasPrice, ContractFunction } from "@elrondnetwork/erdjs";
import { readJSONFileAsAny } from "./ioutils";
import { CreateAccountResponse } from "./worldMessages";

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
            : { impersonated: Address, code?: Code, codePath?: string, codeMetadata?: CodeMetadata, args?: Argument[], value?: Balance, gasLimit?: GasLimit, gasPrice?: GasPrice })
        : Promise<DeployResponse> {
        return await this.provider.deployContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            impersonated: impersonated,
            code: code || Code.nothing(),
            codeMetadata: codeMetadata || new CodeMetadata(),
            codePath: codePath || "",
            arguments: args || [],
            value: value || Balance.Zero(),
            gasLimit: gasLimit || GasLimit.min(),
            gasPrice: gasPrice || GasPrice.min()
        });
    }

    async runContract(
        { contract, impersonated, func, args, value, gasLimit, gasPrice }
            : { contract: Address, impersonated: Address, func: ContractFunction, args?: Argument[], value?: Balance, gasLimit?: GasLimit, gasPrice?: GasPrice })
        : Promise<RunResponse> {
        return await this.provider.runContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            contractAddress: contract,
            impersonated: impersonated,
            function: func,
            arguments: args || [],
            value: value || Balance.Zero(),
            gasLimit: gasLimit || GasLimit.min(),
            gasPrice: gasPrice || GasPrice.min()
        });
    }

    async queryContract(
        { contract, impersonated, func, args, value, gasLimit }
            : { contract: Address, impersonated: Address, func: ContractFunction, args?: Argument[], value?: Balance, gasLimit?: GasLimit })
        : Promise<QueryResponse> {
        return await this.provider.queryContract({
            databasePath: this.databasePath,
            world: this.uniqueName,
            contractAddress: contract,
            impersonated: impersonated,
            function: func,
            arguments: args || [],
            value: value || Balance.Zero(),
            gasPrice: GasPrice.min(),
            gasLimit: gasLimit || GasLimit.min()
        });
    }

    async createAccount(
        { address, balance, nonce }
            : { address: Address, balance?: Balance, nonce?: Nonce })
        : Promise<CreateAccountResponse> {
        return await this.provider.createAccount({
            databasePath: this.databasePath,
            world: this.uniqueName,
            address: address,
            balance: balance || Balance.Zero(),
            nonce: nonce || new Nonce(0)
        });
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
        this.Address = new Address(obj.AddressHex);
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
        return new Address(this.hex);
    }

    asNumber(): number {
        return parseInt(this.hex, 16) || 0;
    }

    asString(): string {
        let buffer = Buffer.from(this.hex, "hex");
        return buffer.toString();
    }
}
