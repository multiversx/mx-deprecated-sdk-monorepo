import {assert} from "chai";
import {shouldUseHashSigning} from "./common";
import {LEDGER_TX_HASH_SIGN_MIN_VERSION} from "./constants";

describe("test version comparison for ledger hash signing", () => {
    // ledger hash signing version = 1.0.11
    it("should not use hash signing", () => {
        assert.isFalse(shouldUseHashSigning("0.0.7"));
        assert.isFalse(shouldUseHashSigning("1.0.9"));
        assert.isFalse(shouldUseHashSigning("1.0.10"));
        assert.isFalse(shouldUseHashSigning("1.0.10.10"));
    });
    it("should use hash signing", () => {
        assert.isTrue(shouldUseHashSigning(LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.isTrue(shouldUseHashSigning("1.0.11"));
        assert.isTrue(shouldUseHashSigning("1.0.11.5"));
        assert.isTrue(shouldUseHashSigning("1.0.12"));
        assert.isTrue(shouldUseHashSigning("1.2.0"));
        assert.isTrue(shouldUseHashSigning("3.5.0"));
    });
});
