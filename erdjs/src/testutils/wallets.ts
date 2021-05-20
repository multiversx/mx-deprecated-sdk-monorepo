import * as fs from "fs";
import * as path from "path";
import { NetworkConfig } from "..";
import { Account } from "../account";
import { Address } from "../address";
import { IProvider, ISigner } from "../interface";
import { UserSecretKey } from "../walletcore";
import { UserSigner } from "../walletcore/userSigner";
import { getLocalTestnetProvider } from "./utils";

export async function setupNode(provider?: IProvider): Promise<{ provider: IProvider } | Record<string, TestWallet>> {
    if (typeof provider === "undefined") {
        provider = getLocalTestnetProvider();
    }
    await NetworkConfig.getDefault().sync(provider);
    let wallets = await loadAndSyncTestWallets(provider);
    return { provider, ...wallets };
}

export async function loadAndSyncTestWallets(provider: IProvider): Promise<Record<string, TestWallet>> {
    let wallets = await loadTestWallets();
    await syncTestWallets(wallets, provider);
    return wallets;
}

export async function syncTestWallets(wallets: Record<string, TestWallet>, provider: IProvider) {
    await Promise.all(Object.values(wallets).map(async (wallet) => wallet.sync(provider)));
}

export async function loadTestWallets(): Promise<Record<string, TestWallet>> {
    let walletNames = ["alice", "bob", "carol", "dan", "eve", "frank", "grace", "heidi", "ivan", "judy", "mallory", "mike"];
    let wallets = await Promise.all(walletNames.map(async name => await loadTestWallet(name)));
    let walletMap: Record<string, TestWallet> = {};
    for (let i in walletNames) {
        walletMap[walletNames[i]] = wallets[i];
    }
    return walletMap;
}

export async function loadMnemonic(): Promise<string> {
    return await readTestWalletFileContents("mnemonic.txt");
}

export async function loadPassword(): Promise<string> {
    return await readTestWalletFileContents("password.txt");
}

export async function loadTestWallet(name: string): Promise<TestWallet> {
    let jsonContents = JSON.parse(await readTestWalletFileContents(name + ".json"));
    let pemContents = await readTestWalletFileContents(name + ".pem");
    let pemKey = UserSecretKey.fromPem(pemContents);
    return new TestWallet(
        new Address(jsonContents.address),
        pemKey.hex(),
        jsonContents,
        pemContents);
}

async function readTestWalletFileContents(name: string): Promise<string> {
    let basePath = path.join(__dirname, "testwallets");
    let filePath = path.join(basePath, name);
    return await fs.promises.readFile(filePath, { encoding: "utf8" });
}

export class TestWallet {
    readonly address: Address;
    readonly secretKeyHex: string;
    readonly secretKey: Buffer;
    readonly signer: ISigner;
    readonly keyFileObject: any;
    readonly pemFileText: any;
    readonly account: Account;

    constructor(address: Address, secretKeyHex: string, keyFileObject: any, pemFileText: any) {
        this.address = address;
        this.secretKeyHex = secretKeyHex;
        this.secretKey = Buffer.from(secretKeyHex, "hex");
        this.signer = new UserSigner(UserSecretKey.fromString(secretKeyHex));
        this.keyFileObject = keyFileObject;
        this.pemFileText = pemFileText;
        this.account = new Account(this.address);
    }

    async sync(provider: IProvider) {
        await this.account.sync(provider);
        return this;
    }
}
