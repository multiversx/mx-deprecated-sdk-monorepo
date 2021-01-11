import * as errors from "../errors";
import { assert } from "chai";
import { TestWallets } from "../testutils";
import { UserPrivateKey } from "./userKeys";
import { Mnemonic } from "./mnemonic";
import { UserWallet, Randomness } from "./userWallet";
import { Address } from "../address";
import { UserSigner } from "./userSigner";
import { Transaction } from "../transaction";
import { Nonce } from "../nonce";
import { Balance } from "../balance";
import { ChainID, GasLimit, GasPrice, TransactionVersion } from "../networkParams";
import { TransactionPayload } from "../transactionPayload";

describe("test user wallets", () => {
    let wallets = new TestWallets();
    let alice = wallets.alice;
    let bob = wallets.bob;
    let carol = wallets.carol;
    let password = wallets.password;

    it("should generate mnemonic", () => {
        let mnemonic = Mnemonic.generate();
        let words = mnemonic.getWords();
        assert.lengthOf(words, 24);
    });

    it("should derive keys", () => {
        let mnemonic = Mnemonic.fromString(wallets.mnemonic);

        assert.equal(mnemonic.deriveKey(0).hex(), alice.privateKey);
        assert.equal(mnemonic.deriveKey(1).hex(), bob.privateKey);
        assert.equal(mnemonic.deriveKey(2).hex(), carol.privateKey);
    });

    it("should create private key", () => {
        let keyHex = wallets.alice.privateKey;
        let fromBuffer = new UserPrivateKey(Buffer.from(keyHex, "hex"));
        let fromHex = UserPrivateKey.fromString(keyHex);

        assert.equal(fromBuffer.hex(), keyHex);
        assert.equal(fromHex.hex(), keyHex);
    });

    it("should compute public key (and address)", () => {
        let privateKey: UserPrivateKey;

        privateKey = new UserPrivateKey(Buffer.from(alice.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().hex(), alice.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(alice.address));

        privateKey = new UserPrivateKey(Buffer.from(bob.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().hex(), bob.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(bob.address));

        privateKey = new UserPrivateKey(Buffer.from(carol.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().hex(), carol.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(carol.address));
    });

    it("should throw error when invalid input", () => {
        assert.throw(() => new UserPrivateKey(Buffer.alloc(42)), errors.ErrInvariantFailed);
        assert.throw(() => UserPrivateKey.fromString("foobar"), errors.ErrInvariantFailed);
    });

    it("should handle PEM files", () => {

    });

    it("should create and load encrypted files", function () {
        this.timeout(10000);

        let alicePrivateKey = UserPrivateKey.fromString(alice.privateKey);
        let bobPrivateKey = UserPrivateKey.fromString(bob.privateKey);
        let carolPrivateKey = UserPrivateKey.fromString(carol.privateKey);

        console.time("encrypt");
        let aliceKeyFile = new UserWallet(alicePrivateKey, password);
        let bobKeyFile = new UserWallet(bobPrivateKey, password);
        let carolKeyFile = new UserWallet(carolPrivateKey, password);
        console.timeEnd("encrypt");

        assert.equal(aliceKeyFile.toJSON().bech32, alice.address.bech32());
        assert.equal(bobKeyFile.toJSON().bech32, bob.address.bech32());
        assert.equal(carolKeyFile.toJSON().bech32, carol.address.bech32());

        console.time("decrypt");
        assert.deepEqual(UserWallet.loadPrivateKey(aliceKeyFile.toJSON(), password), alicePrivateKey);
        assert.deepEqual(UserWallet.loadPrivateKey(bobKeyFile.toJSON(), password), bobPrivateKey);
        assert.deepEqual(UserWallet.loadPrivateKey(carolKeyFile.toJSON(), password), carolPrivateKey);
        console.timeEnd("decrypt");

        // With provided randomness, in order to reproduce our development wallets

        aliceKeyFile = new UserWallet(alicePrivateKey, password, new Randomness({
            id: alice.keyFileObject.id,
            iv: Buffer.from(alice.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(alice.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        bobKeyFile = new UserWallet(bobPrivateKey, password, new Randomness({
            id: bob.keyFileObject.id,
            iv: Buffer.from(bob.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(bob.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        carolKeyFile = new UserWallet(carolPrivateKey, password, new Randomness({
            id: carol.keyFileObject.id,
            iv: Buffer.from(carol.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(carol.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        assert.deepEqual(aliceKeyFile.toJSON(), alice.keyFileObject);
        assert.deepEqual(bobKeyFile.toJSON(), bob.keyFileObject);
        assert.deepEqual(carolKeyFile.toJSON(), carol.keyFileObject);
    });

    it("should sign", async () => {
        let signer = new UserSigner(UserPrivateKey.fromString("1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf"));
        let sender = new Address("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        let receiver = new Address("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r");


        let transaction = new Transaction({
            nonce: new Nonce(0),
            value: Balance.Zero(),
            receiver: receiver,
            gasPrice: new GasPrice(1000000000),
            gasLimit: new GasLimit(50000),
            data: new TransactionPayload("foo"),
            chainID: new ChainID("1"),
            version: new TransactionVersion(1)
        });

        let serialized = transaction.serializeForSigning(sender).toString();
        await signer.sign(transaction);

        assert.equal(serialized, `{"nonce":0,"value":"0","receiver":"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r","sender":"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz","gasPrice":1000000000,"gasLimit":50000,"data":"Zm9v","chainID":"1","version":1}`);
        assert.equal(transaction.signature.hex(), "b5fddb8c16fa7f6123cb32edc854f1e760a3eb62c6dc420b5a4c0473c58befd45b621b31a448c5b59e21428f2bc128c80d0ee1caa4f2bf05a12be857ad451b00");
    });
});
