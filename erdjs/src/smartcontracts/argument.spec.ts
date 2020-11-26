import { describe } from "mocha";
import { assert } from "chai";
import { Argument } from "./argument";
import { BigIntValue, BigUIntValue, OptionalValue, U8Value, Vector } from "./typesystem";

describe("test arguments", () => {
    it("should create arguments", async () => {
        assert.equal(Argument.number(100).valueOf(), "64");
        assert.equal(Argument.utf8("a").valueOf(), "61");
        assert.equal(Argument.hex("abba").valueOf(), "abba");
        assert.equal(Argument.bigInt(BigInt("1000000000000000000000000000000000")).valueOf(), "314dc6448d9338c15b0a00000000");
        assert.equal(Argument.typed(new BigUIntValue(BigInt(0xabba))).valueOf(), "abba");
        assert.equal(Argument.typed(new Vector([])).valueOf(), "");
        assert.equal(Argument.typed(new OptionalValue()).valueOf(), "");
        assert.equal(Argument.missingOptional().valueOf(), "");
        assert.equal(Argument.typed(new Vector([new U8Value(42), new U8Value(7), new U8Value(3)])).valueOf(), "2a0703");
    });
});
