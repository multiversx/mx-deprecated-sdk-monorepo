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

    it("should throw error when invalid input", () => {
        assert.throw(() => new PrivateKey(Buffer.alloc(42)), errors.ErrInvariantFailed);
        assert.throw(() => PrivateKey.fromString("foobar"), errors.ErrInvariantFailed);
    });
});
