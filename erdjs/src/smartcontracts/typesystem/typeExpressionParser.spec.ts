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
            "name": "u32",
            "typeParameters": []
        });

        type = parser.parse("List<u32>");
        assert.deepEqual(type.toJSON(), {
            "name": "List",
            "typeParameters": [
                {
                    "name": "u32",
                    "typeParameters": []
                }
            ]
        });

        type = parser.parse("Option<List<Address>>");
        assert.deepEqual(type.toJSON(), {
            "name": "Option",
            "typeParameters": [
                {
                    "name": "List",
                    "typeParameters": [
                        {
                            "name": "Address",
                            "typeParameters": []
                        }
                    ]
                }
            ]
        });

        type = parser.parse("VarArgs<MultiArg<bytes, Address>>");
        assert.deepEqual(type.toJSON(), {
            "name": "VarArgs",
            "typeParameters": [
                {
                    "name": "MultiArg",
                    "typeParameters": [
                        {
                            "name": "bytes",
                            "typeParameters": []
                        },
                        {
                            "name": "Address",
                            "typeParameters": []
                        }
                    ]
                }
            ]
        });

        type = parser.parse("MultiResultVec<MultiResult<Address, u64>>");
        assert.deepEqual(type.toJSON(), {
            "name": "MultiResultVec",
            "typeParameters": [
                {
                    "name": "MultiResult",
                    "typeParameters": [
                        {
                            "name": "Address",
                            "typeParameters": []
                        },
                        {
                            "name": "u64",
                            "typeParameters": []
                        }
                    ]
                }
            ]
        });

        type = parser.parse("MultiResultVec<MultiResult<i32,bytes,>>");
        assert.deepEqual(type.toJSON(), {
            "name": "MultiResultVec",
            "typeParameters": [
                {
                    "name": "MultiResult",
                    "typeParameters": [
                        {
                            "name": "i32",
                            "typeParameters": []
                        },
                        {
                            "name": "bytes",
                            "typeParameters": []
                        }
                    ]
                }
            ]
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

    it("should not parse expression", () => {
        assert.throw(() => parser.parse("<>"), errors.ErrTypingSystem);
        assert.throw(() => parser.parse("<"), errors.ErrTypingSystem);
        assert.throw(() => parser.parse("MultiResultVec<MultiResult2<Address, u64>"), errors.ErrTypingSystem);
        assert.throw(() => parser.parse("a, b"), errors.ErrTypingSystem);
    });
});

