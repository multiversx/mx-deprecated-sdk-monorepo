import * as fs from "fs";
import * as path from "path";
import { Account } from "../account";
import { Address } from "../address";
import { ErrInvalidArgument } from "../errors";
import { IProvider, ISigner } from "../interface";
import { UserSecretKey } from "../walletcore";
import { UserSigner } from "../walletcore/userSigner";

export async function loadAndSyncTestWallets(provider: IProvider, count: number = 0): Promise<Record<string, TestWallet>> {
    if (provider === undefined) {
        throw new ErrInvalidArgument("The provider argument is missing");
    }
    let wallets = await loadTestWallets(count);
    await Promise.all(Object.keys(wallets).map(async (name) => wallets[name].sync(provider)));
    return wallets;
}

export async function loadTestWallets(count: number = 0): Promise<Record<string, TestWallet>> {
    let walletNames = ["alice", "bob", "carol", "dan", "eve", "frank", "grace", "heidi", "ivan", "judy", "mallory", "mike"];
    if (count > 0) {
        walletNames = walletNames.slice(0, count);
    }
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


export class TestWallets {
    mnemonic: string;
    password: string;

    constructor() {
        this.mnemonic = "moral volcano peasant pass circle pen over picture flat shop clap goat never lyrics gather prepare woman film husband gravity behind test tiger improve";
        this.password = "password";
        /*
                this.alice = new TestWallet(new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"), "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9", aliceKeyFile, alicePEM);
                this.bob = new TestWallet(new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"), "b8ca6f8203fb4b545a8e83c5384da033c415db155b53fb5b8eba7ff5a039d639", bobKeyFile, bobPEM);
                this.carol = new TestWallet(new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8"), "e253a571ca153dc2aee845819f74bcc9773b0586edead15a94cb7235a5027436", carolKeyFile, carolPEM);*/
    }
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
