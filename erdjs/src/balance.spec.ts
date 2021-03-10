import { assert } from "chai";
import { Balance } from "./balance";

describe("test balance", () => {
    it("should have desired precision", () => {
        assert.equal(Balance.egld(1).toString(), "1000000000000000000");
        assert.equal(Balance.egld(10).toString(), "10000000000000000000");
        assert.equal(Balance.egld(100).toString(), "100000000000000000000");
        assert.equal(Balance.egld(1000).toString(), "1000000000000000000000");

        assert.equal(Balance.egld(0.1).toString(), "100000000000000000");
        assert.equal(Balance.egld("0.1").toString(), "100000000000000000");

        assert.equal(Balance.egld("0.123456789").toString(), "123456789000000000");
        assert.equal(Balance.egld("0.123456789123456789").toString(), "123456789123456789");
        assert.equal(Balance.egld("0.123456789123456789777").toString(), "123456789123456789");
        assert.equal(Balance.egld("0.123456789123456789777777888888").toString(), "123456789123456789");
    });

    it("should format as currency", () => {
        assert.equal(Balance.egld(0.1).toCurrencyString(), "0.100000000000000000 EGLD");
        assert.equal(Balance.egld(1).toCurrencyString(), "1.000000000000000000 EGLD");
        assert.equal(Balance.egld(10).toCurrencyString(), "10.000000000000000000 EGLD");
        assert.equal(Balance.egld(100).toCurrencyString(), "100.000000000000000000 EGLD");
        assert.equal(Balance.egld(1000).toCurrencyString(), "1000.000000000000000000 EGLD");
        assert.equal(Balance.egld("0.123456789").toCurrencyString(), "0.123456789000000000 EGLD");
        assert.equal(Balance.egld("0.123456789123456789777777888888").toCurrencyString(), "0.123456789123456789 EGLD");
    });

    it("should format as denominated", () => {
        assert.equal(new Balance('1000000000').toDenominated(), "0.000000001000000000");
    });
});
