import * as errors from "../../errors";
import { assert } from "chai";
import { BetterType } from "./types";
import { TypeExpressionParser } from "./typeExpressionParser";

describe("test parser", () => {
    let parser = new TypeExpressionParser();

    it("should parse expression", () => {
        let type: BetterType;

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

        type = parser.parse("VarArgs<MultiArg2<bytes, Address>>");
        assert.deepEqual(type.toJSON(), {
            "name": "VarArgs",
            "typeParameters": [
                {
                    "name": "MultiArg2",
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

        type = parser.parse("MultiResultVec<MultiResult2<Address, u64>>");
        assert.deepEqual(type.toJSON(), {
            "name": "MultiResultVec",
            "typeParameters": [
                {
                    "name": "MultiResult2",
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
    });

    it("should not parse expression", () => {
        assert.throw(() => parser.parse("<>"), errors.ErrTypingSystem);
        assert.throw(() => parser.parse("<"), errors.ErrTypingSystem);
        assert.throw(() => parser.parse("MultiResultVec<MultiResult2<Address, u64>"), errors.ErrTypingSystem);
        assert.throw(() => parser.parse("a, b"), errors.ErrTypingSystem);
    });
});

