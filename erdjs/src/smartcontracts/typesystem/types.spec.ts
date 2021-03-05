import * as errors from "../../errors";
import { assert } from "chai";
import { NumericalValue } from ".";
import { NumericalType, U16Type, U32Type, U32Value } from "./numerical";
import { PrimitiveType, Type } from "./types";
import { BooleanType } from "./boolean";
import { AddressType } from "./address";
import BigNumber from "bignumber.js";

describe("test types", () => {
    it("for numeric values, should throw error when invalid input", () => {
        assert.throw(() => new U32Value(new BigNumber(-42)), errors.ErrInvalidArgument);
        assert.throw(() => new NumericalValue(<any>Number(42), U16Type.One), errors.ErrInvalidArgument);
    });

    it("should report type hierarchy", () => {
        assert.isTrue(Type.One.isAssignableFrom(PrimitiveType.One));
        assert.isTrue(Type.One.isAssignableFrom(BooleanType.One));
        assert.isTrue(Type.One.isAssignableFrom(AddressType.One));
        assert.isTrue(Type.One.isAssignableFrom(NumericalType.One));
        assert.isTrue(PrimitiveType.One.isAssignableFrom(BooleanType.One));
        assert.isTrue(PrimitiveType.One.isAssignableFrom(AddressType.One));
        assert.isTrue(PrimitiveType.One.isAssignableFrom(NumericalType.One));
        assert.isTrue(AddressType.One.isAssignableFrom(AddressType.One));
        assert.isFalse(AddressType.One.isAssignableFrom(BooleanType.One));
        assert.isFalse(NumericalType.One.isAssignableFrom(BooleanType.One));
        assert.isFalse(NumericalType.One.isAssignableFrom(PrimitiveType.One));
    });
});
