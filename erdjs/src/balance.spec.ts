import { assert } from "chai";
import { Balance } from "./balance";

describe("test balance", () => {
    it("should have desired precision", () => {
        assert.equal(Balance.eGLD(1).raw(), "1000000000000000000");
        assert.equal(Balance.eGLD(10).raw(), "10000000000000000000");
        assert.equal(Balance.eGLD(100).raw(), "100000000000000000000");
        assert.equal(Balance.eGLD(1000).raw(), "1000000000000000000000");

        assert.equal(Balance.eGLD(0.1).raw(), "100000000000000000");
        assert.equal(Balance.eGLD("0.1").raw(), "100000000000000000");

        assert.equal(Balance.eGLD("0.123456789").raw(), "123456789000000000");
        assert.equal(Balance.eGLD("0.123456789123456789").raw(), "123456789123456789");
        assert.equal(Balance.eGLD("0.123456789123456789777").raw(), "123456789123456789");
        assert.equal(Balance.eGLD("0.123456789123456789777777888888").raw(), "123456789123456789");
    });
});
