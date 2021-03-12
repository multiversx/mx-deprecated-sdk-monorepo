import { assert } from "chai";
import { Balance } from "./balance";
import BigNumber from "bignumber.js";
import {bigIntToBuffer} from "./smartcontracts/codec/utils";

describe("test balance", () => {
    it("should have desired precision", () => {
        const x = new Balance("10");

        assert.equal(Balance.eGLD(1).toString(), "1000000000000000000");
        assert.equal(Balance.eGLD(10).toString(), "10000000000000000000");
        assert.equal(Balance.eGLD(100).toString(), "100000000000000000000");
        assert.equal(Balance.eGLD(1000).toString(), "1000000000000000000000");

        assert.equal(Balance.eGLD(0.1).toString(), "100000000000000000");
        assert.equal(Balance.eGLD("0.1").toString(), "100000000000000000");

        assert.equal(Balance.eGLD("0.123456789").toString(), "123456789000000000");
        assert.equal(Balance.eGLD("0.123456789123456789").toString(), "123456789123456789");
        assert.equal(Balance.eGLD("0.123456789123456789777").toString(), "123456789123456789");
        assert.equal(Balance.eGLD("0.123456789123456789777777888888").toString(), "123456789123456789");
    });

    it("should format as currency", () => {
        assert.equal(Balance.eGLD(0.1).toCurrencyString(), "0.100000000000000000 eGLD");
        assert.equal(Balance.eGLD(1).toCurrencyString(), "1.000000000000000000 eGLD");
        assert.equal(Balance.eGLD(10).toCurrencyString(), "10.000000000000000000 eGLD");
        assert.equal(Balance.eGLD(100).toCurrencyString(), "100.000000000000000000 eGLD");
        assert.equal(Balance.eGLD(1000).toCurrencyString(), "1000.000000000000000000 eGLD");
        assert.equal(Balance.eGLD("0.123456789").toCurrencyString(), "0.123456789000000000 eGLD");
        assert.equal(Balance.eGLD("0.123456789123456789777777888888").toCurrencyString(), "0.123456789123456789 eGLD");
    });

    it("should format as denominated", () => {
        assert.equal(new Balance('1000000000').toDenominated(), "0.000000001000000000");
    });
});
