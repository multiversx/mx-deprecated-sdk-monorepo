import { Address } from "../address";
import { ISigner } from "../interface";
import { SimpleSigner } from "../simpleSigner";

export class TestWallets {
    alice: TestWallet;
    bob: TestWallet;
    carol: TestWallet;

    constructor() {
        this.alice = new TestWallet(new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"), "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9");
        this.bob = new TestWallet(new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"), "b8ca6f8203fb4b545a8e83c5384da033c415db155b53fb5b8eba7ff5a039d639");
        this.carol = new TestWallet(new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8"), "e253a571ca153dc2aee845819f74bcc9773b0586edead15a94cb7235a5027436");
    }
}

export class TestWallet {
    readonly address: Address;
    readonly privateKey: string;
    readonly signer: ISigner;

    constructor(address: Address, privateKey: string) {
        this.address = address;
        this.privateKey = privateKey;
        this.signer = new SimpleSigner(privateKey);
    }
}