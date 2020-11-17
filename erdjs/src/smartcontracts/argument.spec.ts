import { describe } from "mocha";
import { assert } from "chai";
import { Argument } from "./argument";

describe("test arguments", () => {
    it("should create arguments", async () => {
        assert.equal(Argument.number(100).value, "64");
        assert.equal(Argument.utf8("a").value, "61");
        assert.equal(Argument.hex("abba").value, "abba");
        assert.equal(Argument.bigInt(BigInt("1000000000000000000000000000000000")).value, "314dc6448d9338c15b0a00000000");
    });
});
