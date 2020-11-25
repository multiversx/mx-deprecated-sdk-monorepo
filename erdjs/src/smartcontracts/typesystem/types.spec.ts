import { describe } from "mocha";
import * as errors from "../../errors";
import { assert } from "chai";
import { NumericalValue } from ".";
import { U16Type, U32Type } from "./numerical";

describe("test types", () => {
    it("for numeric values, should throw error when invalid input", () => {
        assert.throw(() => new NumericalValue(BigInt(-42), U32Type.One), errors.ErrInvalidArgument);
        assert.throw(() => new NumericalValue(<any>Number(42), U16Type.One), errors.ErrInvalidArgument);
    });
});
