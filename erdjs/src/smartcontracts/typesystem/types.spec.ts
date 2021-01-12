import * as errors from "../../errors";
import { assert } from "chai";
import { NumericalValue } from ".";
import { U16Type, U32Type, U32Value } from "./numerical";
import { PrimitiveType, Type } from "./types";
import { BooleanType } from "./boolean";
import { AddressType } from "./address";

describe("test types", () => {
    it("for numeric values, should throw error when invalid input", () => {
        assert.throw(() => new U32Value(BigInt(-42)), errors.ErrInvalidArgument);
        assert.throw(() => new NumericalValue(new U16Type(), <any>Number(42)), errors.ErrInvalidArgument);
    });

    it("should report type hierarchy", () => {
        assert.isTrue((new Type("Type")).isAssignableFrom(new PrimitiveType("PrimitiveType")));
        assert.isTrue((new Type("Type")).isAssignableFrom(new BooleanType()));
        assert.isTrue((new Type("Type")).isAssignableFrom(new AddressType()));
        assert.isTrue((new Type("Type")).isAssignableFrom(new U32Type()));

        assert.isTrue((new PrimitiveType("PrimitiveType")).isAssignableFrom(new BooleanType()));
        assert.isTrue((new PrimitiveType("PrimitiveType")).isAssignableFrom(new AddressType()));
        assert.isTrue((new PrimitiveType("PrimitiveType")).isAssignableFrom(new U32Type()));

        assert.isTrue((new AddressType()).isAssignableFrom(new AddressType()));
        assert.isFalse((new AddressType()).isAssignableFrom(new BooleanType()));
        assert.isFalse((new U32Type()).isAssignableFrom(new BooleanType()));
        assert.isFalse((new U32Type()).isAssignableFrom(new PrimitiveType("PrimitiveType")));
    });
});
