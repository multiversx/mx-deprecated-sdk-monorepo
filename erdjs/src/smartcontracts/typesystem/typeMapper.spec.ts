import * as errors from "../../errors";
import { assert } from "chai";
import { Type } from "./types";
import { TypeExpressionParser } from "./typeExpressionParser";
import { TypeMapper } from "./typeMapper";
import { BigUIntType, I32Type, U16Type, U32Type, U64Type, U8Type } from "./numerical";
import { BytesType } from "./bytes";
import { AddressType } from "./address";
import { OptionalType, VariadicType } from "./variadic";
import { CompositeType } from "./composite";

type TypeConstructor = new (...typeParameters: Type[]) => Type;

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
        testMapping("VarArgs<u32>", VariadicType, [new U32Type()]);
        testMapping("VarArgs<bytes>", VariadicType, [new BytesType()]);
        testMapping("MultiResultVec<u32>", VariadicType, [new U32Type()]);
        testMapping("MultiResultVec<Address>", VariadicType, [new AddressType()]);
    });

    it("should map complex generic, composite, variadic types", () => {
        testMapping("MultiResultVec<MultiResult<i32,bytes,>>", VariadicType, [new CompositeType(new I32Type(), new BytesType())]);
        testMapping("VarArgs<MultiArg<i32,bytes,>>", VariadicType, [new CompositeType(new I32Type(), new BytesType())]);
        testMapping("OptionalResult<Address>", OptionalType, [new AddressType()]);
    });

    function testMapping(expression: string, constructor: TypeConstructor, typeParameters: Type[] = []) {
        let type = parser.parse(expression);
        let mappedType = mapper.mapType(type);

        assert.instanceOf(mappedType, constructor);
        assert.deepEqual(mappedType, new constructor(...typeParameters));
    }
});

