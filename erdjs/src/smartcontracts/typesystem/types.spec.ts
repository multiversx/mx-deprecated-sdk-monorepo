import { describe } from "mocha";
import * as errors from "../../errors";
import { assert } from "chai";
import { NumericalValue } from ".";
import { U16Type, U32Type, U32Value } from "./numerical";

describe("test types", () => {
    it("for numeric values, should throw error when invalid input", () => {
        assert.throw(() => new U32Value(BigInt(-42)), errors.ErrInvalidArgument);
        assert.throw(() => new NumericalValue(<any>Number(42), U16Type.One), errors.ErrInvalidArgument);
    });
});
