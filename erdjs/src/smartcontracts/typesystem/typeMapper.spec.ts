import * as errors from "../../errors";
import { assert } from "chai";
import { BetterType } from "./types";
import { TypeExpressionParser } from "./typeExpressionParser";
import { TypeMapper } from "./typeMapper";
import { BigUIntType, I32Type, U16Type, U32Type, U64Type, U8Type } from "./numerical";
import { MultiArgType, MultiResultType, MultiResultVecType, OptionalResultType, VarArgsType } from "./composite";
import { BytesType } from "./bytes";
import { AddressType } from "./address";

type TypeConstructor = new (...typeParameters: BetterType[]) => BetterType;

describe("test mapper", () => {
    let parser = new TypeExpressionParser();
    let mapper = new TypeMapper();

    it("should map primitive types", () => {
        testMapping("u8", U8Type);
        testMapping("u16", U16Type);
        testMapping("u32", U32Type);
        testMapping("u64", U64Type);
        testMapping("BigUint", BigUIntType);
    });

    it("should map variadic types", () => {
        testMapping("VarArgs<u32>", VarArgsType, [new U32Type()]);
        testMapping("VarArgs<bytes>", VarArgsType, [new BytesType()]);
        testMapping("MultiResultVec<u32>", MultiResultVecType, [new U32Type()]);
        testMapping("MultiResultVec<Address>", MultiResultVecType, [new AddressType()]);
    });

    it("should map complex generic, composite, variadic types", () => {
        testMapping("MultiResultVec<MultiResult<i32,bytes,>>", MultiResultVecType, [new MultiResultType(new I32Type(), new BytesType())]);
        testMapping("VarArgs<MultiArg<i32,bytes,>>", VarArgsType, [new MultiArgType(new I32Type(), new BytesType())]);
        testMapping("OptionalResult<Address>", OptionalResultType, [new AddressType()]);
    });

    function testMapping(expression: string, constructor: TypeConstructor, typeParameters: BetterType[] = []) {
        let type = parser.parse(expression);
        let mappedType = mapper.mapType(type);

        assert.instanceOf(mappedType, constructor);
        assert.deepEqual(mappedType, new constructor(...typeParameters));
    }
});

