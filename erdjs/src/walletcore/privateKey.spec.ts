import * as errors from "../errors";
import { assert } from "chai";
import { TestWallets } from "../testutils";
import { PrivateKey } from "./privateKey";

describe("test private key", () => {
    let wallets = new TestWallets();

    it("should create", () => {
        let keyHex = wallets.alice.privateKey;
        let fromBuffer = new PrivateKey(Buffer.from(keyHex, "hex"));
        let fromHex = PrivateKey.fromString(keyHex);

        assert.equal(fromBuffer.toString(), keyHex);
        assert.equal(fromHex.toString(), keyHex);
    });

    it("should compute public key (and address)", () => {
        let privateKey: PrivateKey;

        privateKey = new PrivateKey(Buffer.from(wallets.alice.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().toString(), wallets.alice.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(wallets.alice.address));

        privateKey = new PrivateKey(Buffer.from(wallets.bob.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().toString(), wallets.bob.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(wallets.bob.address));

        privateKey = new PrivateKey(Buffer.from(wallets.carol.privateKey, "hex"));
        assert.equal(privateKey.toPublicKey().toString(), wallets.carol.address.hex());
        assert.isTrue(privateKey.toPublicKey().toAddress().equals(wallets.carol.address));
    });

    it("should throw error when invalid input", () => {
        assert.throw(() => new PrivateKey(Buffer.alloc(42)), errors.ErrInvariantFailed);
        assert.throw(() => PrivateKey.fromString("foobar"), errors.ErrInvariantFailed);
    });
});
