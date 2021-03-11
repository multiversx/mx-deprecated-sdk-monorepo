import {assert} from "chai";
import {isLedgerVersionForSigningUsingHash} from "./common";
import {LEDGER_TX_HASH_SIGN_MIN_VERSION} from "./constants";

describe("test version comparison for ledger hash signing", () => {
    // ledger hash signing version = 1.0.11
    it("should not use hash signing", () => {
        assert.isFalse(isLedgerVersionForSigningUsingHash("0.0.7"));
        assert.isFalse(isLedgerVersionForSigningUsingHash("1.0.9"));
        assert.isFalse(isLedgerVersionForSigningUsingHash("1.0.10"));
        assert.isFalse(isLedgerVersionForSigningUsingHash("1.0.10.10"));
    });
    it("should use hash signing", () => {
        assert.isTrue(isLedgerVersionForSigningUsingHash(LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.isTrue(isLedgerVersionForSigningUsingHash("1.0.11"));
        assert.isTrue(isLedgerVersionForSigningUsingHash("1.0.11.5"));
        assert.isTrue(isLedgerVersionForSigningUsingHash("1.0.12"));
        assert.isTrue(isLedgerVersionForSigningUsingHash("1.2.0"));
        assert.isTrue(isLedgerVersionForSigningUsingHash("3.5.0"));
    });
});
