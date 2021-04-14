import * as errors from "../../errors";
import { assert } from "chai";
import { Type } from "./types";
import { TypeExpressionParser } from "./typeExpressionParser";

describe("test parser", () => {
  let parser = new TypeExpressionParser();

  it("should parse expression", () => {
    let type: Type;

    type = parser.parse("u32");
    assert.deepEqual(type.toJSON(), {
      name: "u32",
      typeParameters: [],
    });

    type = parser.parse("List<u32>");
    assert.deepEqual(type.toJSON(), {
      name: "List",
      typeParameters: [
        {
          name: "u32",
          typeParameters: [],
        },
      ],
    });

    type = parser.parse("Option<List<Address>>");
    assert.deepEqual(type.toJSON(), {
      name: "Option",
      typeParameters: [
        {
          name: "List",
          typeParameters: [
            {
              name: "Address",
              typeParameters: [],
            },
          ],
        },
      ],
    });

    type = parser.parse("VarArgs<MultiArg<bytes, Address>>");
    assert.deepEqual(type.toJSON(), {
      name: "VarArgs",
      typeParameters: [
        {
          name: "MultiArg",
          typeParameters: [
            {
              name: "bytes",
              typeParameters: [],
            },
            {
              name: "Address",
              typeParameters: [],
            },
          ],
        },
      ],
    });

    type = parser.parse("MultiResultVec<MultiResult<Address, u64>>");
    assert.deepEqual(type.toJSON(), {
      name: "MultiResultVec",
      typeParameters: [
        {
          name: "MultiResult",
          typeParameters: [
            {
              name: "Address",
              typeParameters: [],
            },
            {
              name: "u64",
              typeParameters: [],
            },
          ],
        },
      ],
    });

    type = parser.parse("MultiResultVec<MultiResult<i32,bytes,>>");
    assert.deepEqual(type.toJSON(), {
      name: "MultiResultVec",
      typeParameters: [
        {
          name: "MultiResult",
          typeParameters: [
            {
              name: "i32",
              typeParameters: [],
            },
            {
              name: "bytes",
              typeParameters: [],
            },
          ],
        },
      ],
    });

    // TODO: In a future PR, replace the JSON-based parsing logic with a better one and enable this test,
    // which currently fails.

    // type = parser.parse("MultiArg<Option<u8>, List<u16>>");
    // assert.deepEqual(type.toJSON(), {
    //     "name": "MultiArg",
    //     "typeParameters": [
    //         {
    //             "name": "Option",
    //             "typeParameters": [
    //                 {
    //                     "name": "u8",
    //                     "typeParameters": []
    //                 }
    //             ]
    //         },
    //         {
    //             "name": "List",
    //             "typeParameters": [
    //                 {
    //                     "name": "u16",
    //                     "typeParameters": []
    //                 }
    //             ]
    //         }
    //     ]
    // });
  });

  it("should parse expression: tuples", () => {
    let type: Type;

    type = parser.parse("tuple2<i32, bytes>");
    assert.deepEqual(type.toJSON(), {
      name: "tuple2",
      typeParameters: [
        {
          name: "i32",
          typeParameters: [],
        },
        {
          name: "bytes",
          typeParameters: [],
        },
      ],
    });

    type = parser.parse("tuple3<i32, bytes, Option<i64>>");
    assert.deepEqual(type.toJSON(), {
      name: "tuple3",
      typeParameters: [
        {
          name: "i32",
          typeParameters: [],
        },
        {
          name: "bytes",
          typeParameters: [],
        },
        {
          name: "Option",
          typeParameters: [
            {
              name: "i64",
              typeParameters: [],
            },
          ],
        },
      ],
    });

    // TODO: In a future PR, replace the JSON-based parsing logic with a better one and enable this test.
    // This test currently fails because JSON key de-duplication takes place: i32 is incorrectly de-duplicated by the parser.
    type = parser.parse("tuple2<i32, i32>");
    assert.deepEqual(type.toJSON(), {
      name: "tuple2",
      typeParameters: [
        {
          name: "i32",
          typeParameters: [],
        },
        {
          name: "i32",
          typeParameters: [],
        },
      ],
    });
  });

  it("should not parse expression", () => {
    assert.throw(() => parser.parse("<>"), errors.ErrTypingSystem);
    assert.throw(() => parser.parse("<"), errors.ErrTypingSystem);
    // TODO: In a future PR replace Json Parsing logic with a better one and enable this test
    //assert.throw(() => parser.parse("MultiResultVec<MultiResult2<Address, u64>"), errors.ErrTypingSystem);
    assert.throw(() => parser.parse("a, b"), errors.ErrTypingSystem);
  });
});
