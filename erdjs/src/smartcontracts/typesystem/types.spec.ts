import * as errors from "../../errors";
import { assert } from "chai";
import { NumericalValue } from ".";
import { I64Type, U16Type, U32Type, U32Value } from "./numerical";
import { PrimitiveType, Type } from "./types";
import { BooleanType } from "./boolean";
import { AddressType } from "./address";
import { OptionType } from "./generic";
import { TypeExpressionParser } from "./typeExpressionParser";
import BigNumber from "bignumber.js";

describe("test types", () => {
    let parser = new TypeExpressionParser();
    
    it("for numeric values, should throw error when invalid input", () => {
        assert.throw(() => new U32Value(new BigNumber(-42)), errors.ErrInvalidArgument);
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

    it("should report equality", () => {
        assert.isFalse(new Type("foo").equals(new Type("bar")));
        assert.isTrue(new Type("foo").equals(new Type("foo")));
        assert.isTrue(new U32Type().equals(new U32Type()));
        assert.isFalse(new U32Type().equals(new I64Type()));

        assert.isTrue(parser.parse("MultiResultVec<u32>").equals(parser.parse("MultiResultVec<u32>")));
        assert.isFalse(parser.parse("MultiResultVec<u32>").equals(parser.parse("MultiResultVec<u33>")));
        assert.isTrue(parser.parse("Option<u32>").equals(new OptionType(new U32Type())));
    });
});
