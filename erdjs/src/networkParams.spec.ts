import {assert} from "chai";
import {TransactionOptions, TransactionVersion} from "./networkParams";
import {
    TRANSACTION_OPTIONS_DEFAULT,
    TRANSACTION_OPTIONS_TX_HASH_SIGN,
    TRANSACTION_VERSION_DEFAULT,
    TRANSACTION_VERSION_TX_HASH_SIGN
} from "./constants";

describe("test transaction version", () => {
    it("constructor of TransactionVersion should work", () => {
        const expectedVersion = 37;
        let txVersion = new TransactionVersion(expectedVersion);
        assert.equal(expectedVersion, txVersion.valueOf());
    });

    it("should init with correct numeric values based on static constructors", () => {
        let txVersionDefault = TransactionVersion.withDefaultVersion();
        let txVersionTxHashSign = TransactionVersion.withTxHashSignVersion();

        assert.equal(TRANSACTION_VERSION_DEFAULT, txVersionDefault.valueOf());
        assert.equal(TRANSACTION_VERSION_TX_HASH_SIGN, txVersionTxHashSign.valueOf());
    });
});

describe("test transaction options", () => {
    it("constructor of TransactionOptions should work", () => {
        const expectedOptions = 37;
        let txOptions = new TransactionOptions(expectedOptions);
        assert.equal(expectedOptions, txOptions.valueOf());
    });

    it("should init TransactionOptions with correct numeric values based on static constructors", () => {
        let txOptionsDefault = TransactionOptions.withDefaultOptions();
        let txOptionsTxHashSign = TransactionOptions.withTxHashSignOptions();

        assert.equal(TRANSACTION_OPTIONS_DEFAULT, txOptionsDefault.valueOf());
        assert.equal(TRANSACTION_OPTIONS_TX_HASH_SIGN, txOptionsTxHashSign.valueOf());
    });
});
