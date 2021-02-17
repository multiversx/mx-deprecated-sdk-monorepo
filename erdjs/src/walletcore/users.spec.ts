import * as errors from "../errors";
import { assert } from "chai";
import { TestWallets } from "../testutils";
import { UserSecretKey } from "./userKeys";
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

        assert.equal(mnemonic.deriveKey(0).hex(), alice.secretKeyHex);
        assert.equal(mnemonic.deriveKey(1).hex(), bob.secretKeyHex);
        assert.equal(mnemonic.deriveKey(2).hex(), carol.secretKeyHex);
    });

    it("should create secret key", () => {
        let keyHex = wallets.alice.secretKeyHex;
        let fromBuffer = new UserSecretKey(Buffer.from(keyHex, "hex"));
        let fromHex = UserSecretKey.fromString(keyHex);

        assert.equal(fromBuffer.hex(), keyHex);
        assert.equal(fromHex.hex(), keyHex);
    });

    it("should compute public key (and address)", () => {
        let secretKey: UserSecretKey;

        secretKey = new UserSecretKey(Buffer.from(alice.secretKeyHex, "hex"));
        assert.equal(secretKey.generatePublicKey().hex(), alice.address.hex());
        assert.isTrue(secretKey.generatePublicKey().toAddress().equals(alice.address));

        secretKey = new UserSecretKey(Buffer.from(bob.secretKeyHex, "hex"));
        assert.equal(secretKey.generatePublicKey().hex(), bob.address.hex());
        assert.isTrue(secretKey.generatePublicKey().toAddress().equals(bob.address));

        secretKey = new UserSecretKey(Buffer.from(carol.secretKeyHex, "hex"));
        assert.equal(secretKey.generatePublicKey().hex(), carol.address.hex());
        assert.isTrue(secretKey.generatePublicKey().toAddress().equals(carol.address));
    });

    it("should throw error when invalid input", () => {
        assert.throw(() => new UserSecretKey(Buffer.alloc(42)), errors.ErrInvariantFailed);
        assert.throw(() => UserSecretKey.fromString("foobar"), errors.ErrInvariantFailed);
    });

    it("should handle PEM files", () => {
        assert.equal(UserSecretKey.fromPem(alice.pemFileText).hex(), alice.secretKeyHex);
        assert.equal(UserSecretKey.fromPem(bob.pemFileText).hex(), bob.secretKeyHex);
        assert.equal(UserSecretKey.fromPem(carol.pemFileText).hex(), carol.secretKeyHex);
    });

    it("should create and load encrypted files", function () {
        this.timeout(10000);

        let aliceSecretKey = UserSecretKey.fromString(alice.secretKeyHex);
        let bobSecretKey = UserSecretKey.fromString(bob.secretKeyHex);
        let carolSecretKey = UserSecretKey.fromString(carol.secretKeyHex);

        console.time("encrypt");
        let aliceKeyFile = new UserWallet(aliceSecretKey, password);
        let bobKeyFile = new UserWallet(bobSecretKey, password);
        let carolKeyFile = new UserWallet(carolSecretKey, password);
        console.timeEnd("encrypt");

        assert.equal(aliceKeyFile.toJSON().bech32, alice.address.bech32());
        assert.equal(bobKeyFile.toJSON().bech32, bob.address.bech32());
        assert.equal(carolKeyFile.toJSON().bech32, carol.address.bech32());

        console.time("decrypt");
        assert.deepEqual(UserWallet.decryptSecretKey(aliceKeyFile.toJSON(), password), aliceSecretKey);
        assert.deepEqual(UserWallet.decryptSecretKey(bobKeyFile.toJSON(), password), bobSecretKey);
        assert.deepEqual(UserWallet.decryptSecretKey(carolKeyFile.toJSON(), password), carolSecretKey);
        console.timeEnd("decrypt");

        // With provided randomness, in order to reproduce our development wallets

        aliceKeyFile = new UserWallet(aliceSecretKey, password, new Randomness({
            id: alice.keyFileObject.id,
            iv: Buffer.from(alice.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(alice.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        bobKeyFile = new UserWallet(bobSecretKey, password, new Randomness({
            id: bob.keyFileObject.id,
            iv: Buffer.from(bob.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(bob.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        carolKeyFile = new UserWallet(carolSecretKey, password, new Randomness({
            id: carol.keyFileObject.id,
            iv: Buffer.from(carol.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(carol.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        assert.deepEqual(aliceKeyFile.toJSON(), alice.keyFileObject);
        assert.deepEqual(bobKeyFile.toJSON(), bob.keyFileObject);
        assert.deepEqual(carolKeyFile.toJSON(), carol.keyFileObject);
    });

    it("should sign transactions", async () => {
        let signer = new UserSigner(UserSecretKey.fromString("1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf"));
        let sender = new Address("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        let receiver = new Address("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r");

        // With data field
        let transaction = new Transaction({
            nonce: new Nonce(0),
            value: Balance.Zero(),
            receiver: receiver,
            gasPrice: new GasPrice(1000000000),
            gasLimit: new GasLimit(50000),
            data: new TransactionPayload("foo"),
            chainID: new ChainID("1")
        });

        let serialized = transaction.serializeForSigning(sender).toString();
        await signer.sign(transaction);

        assert.equal(serialized, `{"nonce":0,"value":"0","receiver":"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r","sender":"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz","gasPrice":1000000000,"gasLimit":50000,"data":"Zm9v","chainID":"1","version":1}`);
        assert.equal(transaction.getSignature().hex(), "b5fddb8c16fa7f6123cb32edc854f1e760a3eb62c6dc420b5a4c0473c58befd45b621b31a448c5b59e21428f2bc128c80d0ee1caa4f2bf05a12be857ad451b00");
    
        // Without data field
        transaction = new Transaction({
            nonce: new Nonce(8),
            value: Balance.fromString("10000000000000000000"),
            receiver: receiver,
            gasPrice: new GasPrice(1000000000),
            gasLimit: new GasLimit(50000),
            chainID: new ChainID("1")
        });

        serialized = transaction.serializeForSigning(sender).toString();
        await signer.sign(transaction);

        assert.equal(serialized, `{"nonce":8,"value":"10000000000000000000","receiver":"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r","sender":"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz","gasPrice":1000000000,"gasLimit":50000,"chainID":"1","version":1}`);
        assert.equal(transaction.getSignature().hex(), "4a6d8186eae110894e7417af82c9bf9592696c0600faf110972e0e5310d8485efc656b867a2336acec2b4c1e5f76c9cc70ba1803c6a46455ed7f1e2989a90105");
    });

    it("should sign transactions using PEM files", async () => {
        let signer = UserSigner.fromPem(alice.pemFileText);
        
        let transaction = new Transaction({
            nonce: new Nonce(0),
            value: Balance.Zero(),
            receiver: new Address("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"),
            gasPrice: new GasPrice(1000000000),
            gasLimit: new GasLimit(50000),
            data: new TransactionPayload("foo"),
            chainID: new ChainID("1"),
            version: new TransactionVersion(1)
        });

        await signer.sign(transaction);
        assert.equal(transaction.signature.hex(), "c0bd2b3b33a07b9cc5ee7435228acb0936b3829c7008aacabceea35163e555e19a34def2c03a895cf36b0bcec30a7e11215c11efc0da29294a11234eb2b3b906");
    });
});
