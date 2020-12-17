import { assert } from "chai";
import { Argument } from "./argument";
import { BigUIntValue, OptionalValue, U8Value, Vector } from "./typesystem";

describe("test arguments", () => {
    it("should create arguments", async () => {
        assert.equal(Argument.fromNumber(100).toString(), "64");
        assert.equal(Argument.fromUTF8("a").toString(), "61");
        assert.equal(Argument.fromHex("abba").toString(), "abba");
        assert.equal(Argument.fromBigInt(BigInt("1000000000000000000000000000000000")).toString(), "314dc6448d9338c15b0a00000000");
        assert.equal(Argument.fromTypedValue(new BigUIntValue(BigInt(0xabba))).toString(), "abba");
        assert.equal(Argument.fromTypedValue(new Vector([])).toString(), "");
        assert.equal(Argument.fromTypedValue(new OptionalValue()).toString(), "");
        assert.equal(Argument.fromMissingOptional().toString(), "");
        assert.equal(Argument.fromTypedValue(new Vector([new U8Value(42), new U8Value(7), new U8Value(3)])).toString(), "2a0703");
    });
});
