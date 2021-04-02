
import { assert } from "chai";
import { U8Value, EndpointParameterDefinition, TypedValue, U32Value, I64Value, U16Value, OptionValue, List } from "./typesystem";
import { ArgSerializer } from "./argSerializer";
import BigNumber from "bignumber.js";
import { BytesValue } from "./typesystem/bytes";
import { TypeMapper } from "./typesystem/typeMapper";
import { TypeExpressionParser } from "./typesystem/typeExpressionParser";
import { CompositeValue } from "./typesystem/composite";
import { VariadicValue } from "./typesystem/variadic";

describe("test serializer", () => {
    it("should serialize <valuesToString> then back <stringToValues>", async () => {
        let serializer = new ArgSerializer();
        let typeParser = new TypeExpressionParser();
        let typeMapper = new TypeMapper();

        serializeThenDeserialize(
            ["u32", "i64", "bytes"],
            [
                new U32Value(100),
                new I64Value(new BigNumber("-1")),
                new BytesValue(Buffer.from("abba", "hex"))
            ],
            "64@ff@abba"
        );

        serializeThenDeserialize(
            ["Option<u32>", "Option<u8>", "MultiArg<u8, bytes>"],
            [
                OptionValue.newProvided(new U32Value(100)),
                OptionValue.newMissing(),
                CompositeValue.fromItems(new U8Value(3), new BytesValue(Buffer.from("abba", "hex")))
            ],
            "0100000064@@03@abba"
        );

        serializeThenDeserialize(
            ["MultiArg<List<u16>>", "VarArgs<bytes>"],
            [
                CompositeValue.fromItems(List.fromItems([new U16Value(8), new U16Value(9)])),
                VariadicValue.fromItems(new BytesValue(Buffer.from("abba", "hex")), new BytesValue(Buffer.from("abba", "hex")), new BytesValue(Buffer.from("abba", "hex")))
            ],
            "00080009@abba@abba@abba"
        );

        // TODO: In a future PR, improve the types expression parser and enable this test, which currently fails.
        
        // serializeThenDeserialize(
        //     ["MultiArg<Option<u8>, List<u16>>", "VarArgs<bytes>"],
        //     [
        //         CompositeValue.fromItems(providedOption(new U8Value(7)), List.fromItems([new U16Value(8), new U16Value(9)])),
        //         VariadicValue.fromItems(new BytesValue(Buffer.from("abba", "hex")), new BytesValue(Buffer.from("abba", "hex")), new BytesValue(Buffer.from("abba", "hex")))
        //     ],
        //     "0107@0000000200080009@abba@abba@abba"
        // );

        function serializeThenDeserialize(typeExpressions: string[], values: TypedValue[], joinedString: string) {
            let types = typeExpressions.map(expression => typeParser.parse(expression)).map(type => typeMapper.mapType(type));
            let endpointDefinitions = types.map(type => new EndpointParameterDefinition("foo", "bar", type));

            // values => joined string
            let actualJoinedString = serializer.valuesToString(values);
            assert.equal(actualJoinedString, joinedString);

            // joined string => values
            let decodedValues = serializer.stringToValues(actualJoinedString, endpointDefinitions);

            // Now let's check for equality
            assert.lengthOf(decodedValues, values.length);

            for (let i = 0; i < values.length; i++) {
                let value = values[i];
                let decoded = decodedValues[i];

                assert.deepEqual(decoded.valueOf(), value.valueOf(), `index = ${i}`);
            }
        }
    });
});
