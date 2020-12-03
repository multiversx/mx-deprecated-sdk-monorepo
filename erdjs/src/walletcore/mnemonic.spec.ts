import { assert } from "chai";
import { Mnemonic } from "./mnemonic";
import { TestWallets } from "../testutils";

describe("test mnemonic", () => {
    let wallets = new TestWallets();

    it("should generate mnemonic", () => {
        let mnemonic = Mnemonic.generate();
        let words = mnemonic.getWords();
        assert.lengthOf(words, 24);
    });

    it("should derive keys", () => {
        let mnemonic = Mnemonic.fromString(wallets.mnemonic);

        assert.equal(mnemonic.deriveKey(0).toString(), wallets.alice.privateKey);
        assert.equal(mnemonic.deriveKey(1).toString(), wallets.bob.privateKey);
        assert.equal(mnemonic.deriveKey(2).toString(), wallets.carol.privateKey);
    });
});
