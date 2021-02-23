import * as errors from "../../errors";
import { assert } from "chai";
import { BetterType } from "./types";
import { TypeExpressionParser } from "./typeExpressionParser";
import { TypeMapper } from "./typeMapper";
import { BigUIntType, U16Type, U32Type, U64Type, U8Type } from "./numerical";

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

    function testMapping(expression: string, constructor: (new () => BetterType)) {
        let type = parser.parse(expression);
        let mappedType = mapper.mapType(type);

        assert.instanceOf(mappedType, constructor);
        assert.deepEqual(mappedType, new constructor());
    }
});

