import { describe } from "mocha";
import * as errors from "../../errors";
import { assert, AssertionError } from "chai";
import { BooleanValue, NumericalValue, PrimitiveType } from "./types";

describe("test types", () => {
    it("for numeric values, should throw error when invalid input", () => {
        assert.throw(() => new NumericalValue(BigInt(42), PrimitiveType.Address), errors.ErrInvalidArgument);
        assert.throw(() => new NumericalValue(BigInt(-42), PrimitiveType.U32), errors.ErrInvalidArgument);
        assert.throw(() => new NumericalValue(<any>Number(42), PrimitiveType.U16), errors.ErrInvalidArgument);
    });
});
