import { assert } from "chai";
import { TestWallets } from "../testutils";
import { PrivateKey } from "./privateKey";
import { EncryptedKey, Randomness } from "./encryptedKey";

describe("test encrypted key file", () => {
    let wallets = new TestWallets();
    let alice = wallets.alice;
    let bob = wallets.bob;
    let carol = wallets.carol;
    let password = wallets.password;

    it("should create and load encrypted files", function() {
        this.timeout(10000);

        let alicePrivateKey = PrivateKey.fromString(alice.privateKey);
        let bobPrivateKey = PrivateKey.fromString(bob.privateKey);
        let carolPrivateKey = PrivateKey.fromString(carol.privateKey);
        
        console.time("encrypt");
        let aliceKeyFile = new EncryptedKey(alicePrivateKey, password);
        let bobKeyFile = new EncryptedKey(bobPrivateKey, password);
        let carolKeyFile = new EncryptedKey(carolPrivateKey, password);
        console.timeEnd("encrypt");

        assert.equal(aliceKeyFile.toJSON().bech32, alice.address.bech32());
        assert.equal(bobKeyFile.toJSON().bech32, bob.address.bech32());
        assert.equal(carolKeyFile.toJSON().bech32, carol.address.bech32());

        console.time("decrypt");
        assert.deepEqual(EncryptedKey.load(aliceKeyFile.toJSON(), password), alicePrivateKey);
        assert.deepEqual(EncryptedKey.load(bobKeyFile.toJSON(), password), bobPrivateKey);
        assert.deepEqual(EncryptedKey.load(carolKeyFile.toJSON(), password), carolPrivateKey);
        console.timeEnd("decrypt");

        // With provided randomness, in order to reproduce our development wallets

        aliceKeyFile = new EncryptedKey(alicePrivateKey, password, new Randomness({
            id: alice.keyFileObject.id,
            iv: Buffer.from(alice.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(alice.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        bobKeyFile = new EncryptedKey(bobPrivateKey, password, new Randomness({
            id: bob.keyFileObject.id,
            iv: Buffer.from(bob.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(bob.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        carolKeyFile = new EncryptedKey(carolPrivateKey, password, new Randomness({
            id: carol.keyFileObject.id,
            iv: Buffer.from(carol.keyFileObject.crypto.cipherparams.iv, "hex"),
            salt: Buffer.from(carol.keyFileObject.crypto.kdfparams.salt, "hex")
        }));

        assert.deepEqual(aliceKeyFile.toJSON(), alice.keyFileObject);
        assert.deepEqual(bobKeyFile.toJSON(), bob.keyFileObject);
        assert.deepEqual(carolKeyFile.toJSON(), carol.keyFileObject);
    });
});
