import { Address } from "../address";
import { ISigner } from "../interface";
import { SimpleSigner } from "../simpleSigner";

export class TestWallets {
    mnemonic: string;
    password: string;
    alice: TestWallet;
    bob: TestWallet;
    carol: TestWallet;

    constructor() {
        this.mnemonic = "moral volcano peasant pass circle pen over picture flat shop clap goat never lyrics gather prepare woman film husband gravity behind test tiger improve";
        this.password = "password";

        let aliceKeyFile = {
            "version": 4,
            "id": "0dc10c02-b59b-4bac-9710-6b2cfa4284ba",
            "address": "0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1",
            "bech32": "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th",
            "crypto": {
                "ciphertext": "4c41ef6fdfd52c39b1585a875eb3c86d30a315642d0e35bb8205b6372c1882f135441099b11ff76345a6f3a930b5665aaf9f7325a32c8ccd60081c797aa2d538",
                "cipherparams": {
                    "iv": "033182afaa1ebaafcde9ccc68a5eac31"
                },
                "cipher": "aes-128-ctr",
                "kdf": "scrypt",
                "kdfparams": {
                    "dklen": 32,
                    "salt": "4903bd0e7880baa04fc4f886518ac5c672cdc745a6bd13dcec2b6c12e9bffe8d",
                    "n": 4096,
                    "r": 8,
                    "p": 1
                },
                "mac": "5b4a6f14ab74ba7ca23db6847e28447f0e6a7724ba9664cf425df707a84f5a8b"
            }
        };

        let bobKeyFile = {
            "version": 4,
            "id": "85fdc8a7-7119-479d-b7fb-ab4413ed038d",
            "address": "8049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f8",
            "bech32": "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx",
            "crypto": {
                "ciphertext": "c2664a31350aaf6a00525560db75c254d0aea65dc466441356c1dd59253cceb9e83eb05730ef3f42a11573c9a0e33dd952d488f00535b35357bb41d127b1eb82",
                "cipherparams": {
                    "iv": "18378411e31f6c4e99f1435d9ab82831"
                },
                "cipher": "aes-128-ctr",
                "kdf": "scrypt",
                "kdfparams": {
                    "dklen": 32,
                    "salt": "18304455ac2dbe2a2018bda162bd03ef95b81622e99d8275c34a6d5e6932a68b",
                    "n": 4096,
                    "r": 8,
                    "p": 1
                },
                "mac": "23756172195ac483fa29025dc331bc7aa2c139533922a8dc08642eb0a677541f"
            }
        };

        let carolKeyFile = {
            "version": 4,
            "id": "65894f35-d142-41d2-9335-6ad02e0ed0be",
            "address": "b2a11555ce521e4944e09ab17549d85b487dcd26c84b5017a39e31a3670889ba",
            "bech32": "erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8",
            "crypto": {
                "ciphertext": "bdfb984a1e7c7460f0a289749609730cdc99d7ce85b59305417c2c0f007b2a6aaa7203dd94dbf27315bced39b0b281769fbc70b01e6e57f89ae2f2a9e9100007",
                "cipherparams": {
                    "iv": "258ed2b4dc506b4dc9d274b0449b0eb0"
                },
                "cipher": "aes-128-ctr",
                "kdf": "scrypt",
                "kdfparams": {
                    "dklen": 32,
                    "salt": "4f2f5530ce28dc0210962589b908f52714f75c8fb79ff18bdd0024c43c7a220b",
                    "n": 4096,
                    "r": 8,
                    "p": 1
                },
                "mac": "f8de52e2627024eaa33f2ee5eadcd3d3815e10dd274ea966dc083d000cc8b258"
            }
        };

        this.alice = new TestWallet(new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"), "413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9", aliceKeyFile);
        this.bob = new TestWallet(new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx"), "b8ca6f8203fb4b545a8e83c5384da033c415db155b53fb5b8eba7ff5a039d639", bobKeyFile);
        this.carol = new TestWallet(new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8"), "e253a571ca153dc2aee845819f74bcc9773b0586edead15a94cb7235a5027436", carolKeyFile);
    }
}

export class TestWallet {
    readonly address: Address;
    readonly privateKey: string;
    readonly signer: ISigner;
    readonly keyFileObject: any;

    constructor(address: Address, privateKey: string, keyFileObject: any) {
        this.address = address;
        this.privateKey = privateKey;
        this.signer = new SimpleSigner(privateKey);
        this.keyFileObject = keyFileObject;
    }
}
