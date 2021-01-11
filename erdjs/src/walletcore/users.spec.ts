import * as errors from "../errors";
import { assert } from "chai";
import { TestWallets } from "../testutils";
import { UserPrivateKey } from "./userKeys";
import { Mnemonic } from "./mnemonic";
import { UserWallet, Randomness } from "./userWallet";

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

        assert.equal(mnemonic.deriveKey(0).toString(), alice.privateKey);
        assert.equal(mnemonic.deriveKey(1).toString(), bob.privateKey);
        assert.equal(mnemonic.deriveKey(2).toString(), carol.privateKey);
    });

    it("should create private key", () => {
        let keyHex = wallets.alice.privateKey;
        let fromBuffer = new UserPrivateKey(Buffer.from(keyHex, "hex"));
        let fromHex = UserPrivateKey.fromString(keyHex);

        assert.equal(fromBuffer.toString(), keyHex);
        assert.equal(fromHex.toString(), keyHex);
    });

    it("should compute public key (and address)", () => {
        let privateKey: UserPrivateKey;

        privateKey = new UserPrivateKey(Buffer.from(alice.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().toString(), alice.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(alice.address));

        privateKey = new UserPrivateKey(Buffer.from(bob.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().toString(), bob.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(bob.address));

        privateKey = new UserPrivateKey(Buffer.from(carol.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().toString(), carol.address.hex());
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
        assert.deepEqual(UserWallet.load(aliceKeyFile.toJSON(), password), alicePrivateKey);
        assert.deepEqual(UserWallet.load(bobKeyFile.toJSON(), password), bobPrivateKey);
        assert.deepEqual(UserWallet.load(carolKeyFile.toJSON(), password), carolPrivateKey);
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
});
