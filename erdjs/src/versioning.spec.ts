import {assert} from "chai";
import {compareVersions} from "./versioning";

describe("test for general use", () => {
    it("should calculate correctly", () => {
        assert.equal(-1, compareVersions("10.17.19.20", "11.0.0"));
        assert.equal(0, compareVersions("10.17.19", "10.17.19"));
        assert.equal(1, compareVersions("10.18.19", "10.18.18"));
        assert.equal(-1, compareVersions("7", "8"));
    });
});

describe("test version comparison for ledger hash signing", () => {
    const LEDGER_TX_HASH_SIGN_MIN_VERSION = '1.0.11';
    // ledger hash signing version = 1.0.11
    it("should not use hash signing", () => {
        assert.equal(-1, compareVersions("0.0.7", LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.equal(-1, compareVersions("1.0.9", LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.equal(-1, compareVersions("1.0.10", LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.equal(-1, compareVersions("1.0.10.10", LEDGER_TX_HASH_SIGN_MIN_VERSION));
    });
    it("should use hash signing", () => {
        assert.equal(0, compareVersions("1.0.11", LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.equal(1, compareVersions("1.0.11.5", LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.equal(1, compareVersions("1.0.12", LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.equal(1, compareVersions("1.2.0", LEDGER_TX_HASH_SIGN_MIN_VERSION));
        assert.equal(1, compareVersions("3.5.0", LEDGER_TX_HASH_SIGN_MIN_VERSION));
    });
});
