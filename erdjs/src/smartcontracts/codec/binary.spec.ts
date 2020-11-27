import { describe } from "mocha";
import { assert } from "chai";
import { BinaryCodec, BinaryCodecConstraints } from "./binary";
import { AddressType, AddressValue, BigIntType, BigUIntType, BigUIntValue, BooleanType, BooleanValue, I16Type, I8Type, NumericalType, NumericalValue, Structure, StructureDefinition, StructureField, StructureFieldDefinition, StructureType, TypeDescriptor, TypedValue, TypesRegistry, U16Type, U32Type, U32Value, U64Type, U64Value, U8Type, U8Value, Vector, VectorType } from "../typesystem";
import { discardSuperfluousBytesInTwosComplement, discardSuperfluousZeroBytes, isMsbOne } from "./utils";
import { Address } from "../../address";
import { Balance } from "../../balance";

describe("test binary codec (basic)", () => {
    let codec = new BinaryCodec();

    it("should create boolean values, encode and decode", async () => {
        check(true, [0x01], [0x01]);
        check(false, [0x00], []);

        function check(asBoolean: boolean, nested: number[], topLevel: number[]) {
            let value = new BooleanValue(asBoolean);
            let typeDescriptor = new TypeDescriptor([BooleanType.One]);

            assert.deepEqual(codec.encodeNested(value), Buffer.from(nested));
            assert.deepEqual(codec.encodeTopLevel(value), Buffer.from(topLevel));

            let [decodedNested, nestedLength] = codec.decodeNested<BooleanValue>(Buffer.from(nested), typeDescriptor);
            assert.instanceOf(decodedNested, BooleanValue);
            assert.isTrue((decodedNested).equals(value));
            assert.equal(nestedLength, 1);

            let decodedTop = codec.decodeTopLevel<BooleanValue>(Buffer.from(topLevel), typeDescriptor);
            assert.instanceOf(decodedTop, BooleanValue);
            assert.isTrue((decodedTop).equals(value));
        }
    });

    it("should create numeric values, encode and decode", async () => {

        // Small int

        check(BigInt(42), U8Type.One, [0x2A], [0x2A]);
        check(BigInt(42), U16Type.One, [0x00, 0x2A], [0x2A]);
        check(BigInt(42), U64Type.One, [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x2A], [0x2A]);
        check(BigInt(-10), I8Type.One, [0xF6], [0xF6]);
        check(BigInt(-10), I16Type.One, [0xFF, 0xF6], [0xF6]);

        // BigInt

        check(BigInt(0), BigIntType.One, [0, 0, 0, 0], []);
        check(BigInt(1), BigIntType.One, [0, 0, 0, 1, 0x01], [0x01]);
        check(BigInt(-1), BigIntType.One, [0, 0, 0, 1, 0xFF], [0xFF]);
        check(BigInt(-2), BigIntType.One, [0, 0, 0, 1, 0xFE], [0xFE]);
        check(BigInt(127), BigIntType.One, [0, 0, 0, 1, 0x7F], [0x7F]);
        check(BigInt(128), BigIntType.One, [0, 0, 0, 2, 0x00, 0x80], [0x00, 0x80]);
        check(BigInt(255), BigIntType.One, [0, 0, 0, 2, 0x00, 0xFF], [0x00, 0xFF]);
        check(BigInt(256), BigIntType.One, [0, 0, 0, 2, 0x01, 0x00], [0x01, 0x00]);
        check(BigInt(-255), BigIntType.One, [0, 0, 0, 2, 0xFF, 0x01], [0xFF, 0x01]);
        check(BigInt(-257), BigIntType.One, [0, 0, 0, 2, 0xFE, 0xFF], [0xFE, 0xFF]);

        // Zero, fixed-size

        (<NumericalType[]>TypesRegistry.findTypes(type => type instanceof NumericalType && type.hasFixedSize())).forEach(type => {
            check(BigInt(0), type, Array(type.sizeInBytes!).fill(0), []);
        });

        // Zero, arbitrary-size (big)

        (<NumericalType[]>TypesRegistry.findTypes(type => type instanceof NumericalType && type.hasArbitrarySize())).forEach(type => {
            check(BigInt(0), type, [0, 0, 0, 0], []);
        });

        function check(asBigInt: bigint, type: NumericalType, nested: number[], topLevel: number[]) {
            let value = new NumericalValue(asBigInt, type);

            assert.deepEqual(codec.encodeNested(value), Buffer.from(nested));
            assert.deepEqual(codec.encodeTopLevel(value), Buffer.from(topLevel));

            let [decodedNested, nestedLength] = codec.decodeNested<NumericalValue>(Buffer.from(nested), new TypeDescriptor([type]));
            assert.instanceOf(decodedNested, NumericalValue);
            assert.isTrue(decodedNested.equals(value));
            assert.equal(nestedLength, nested.length);

            let decodedTop = codec.decodeTopLevel<NumericalValue>(Buffer.from(topLevel), new TypeDescriptor([type]));
            assert.instanceOf(decodedTop, NumericalValue);
            assert.isTrue(decodedTop.equals(value));
        }
    });
});

describe("test binary codec (advanced)", () => {
    it("should encode / decode vectors", async () => {
        let codec = new BinaryCodec();
        let vector = new Vector([
            new AddressValue(new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th")),
            new AddressValue(new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx")),
            new AddressValue(new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8"))
        ]);

        let bufferNested = codec.encodeNested(vector);
        let bufferTopLevel = codec.encodeTopLevel(vector);
        assert.equal(bufferNested.length, 4 + vector.getLength() * 32);
        assert.equal(bufferTopLevel.length, vector.getLength() * 32);

        let [decodedNested, decodedNestedLength] = codec.decodeNested<Vector>(bufferNested, new TypeDescriptor([VectorType.One, AddressType.One]));
        let decodedTopLevel = codec.decodeTopLevel<Vector>(bufferTopLevel, TypeDescriptor.createFromTypeNames(["Vector", "Address"]));
        assert.equal(decodedNestedLength, bufferNested.length);
        assert.equal(decodedNested.getLength(), 3);
        assert.equal(decodedTopLevel.getLength(), 3);

        assert.deepEqual(decodedNested, vector);
        assert.deepEqual(decodedTopLevel, vector);
    });

    it("benchmark: should work well with large vectors", async () => {
        let numItems = 2**16;
        let codec = new BinaryCodec(new BinaryCodecConstraints({
            maxVectorLength: numItems,
            maxBufferLength: numItems * 4 + 4
        }));
        let items: TypedValue[] = [];

        for (let i = 0; i < numItems; i++) {
            items.push(new U32Value(i));
        }

        let vector = new Vector(items);

        console.time("encoding");
        let buffer = codec.encodeNested(vector);
        console.timeEnd("encoding");
        assert.equal(buffer.length, 4 + numItems * 4);

        console.time("decoding");
        let [decodedVector, decodedLength] = codec.decodeNested<Vector>(buffer, TypeDescriptor.createFromTypeNames(["Vector", "U32"]));
        console.timeEnd("decoding");
        assert.equal(decodedLength, buffer.length);
        assert.deepEqual(decodedVector, vector);
    });

    it("should encode / decode structures", async () => {
        let codec = new BinaryCodec();
        let fooDefinition = new StructureDefinition(
            "Foo",
            [
                new StructureFieldDefinition("ticket_price", "", ["BigUInt"]),
                new StructureFieldDefinition("tickets_left", "", ["U32"]),
                new StructureFieldDefinition("deadline", "", ["U64"]),
                new StructureFieldDefinition("max_entries_per_user", "", ["U32"]),
                new StructureFieldDefinition("prize_distribution", "", ["Vector", "U8"]),
                new StructureFieldDefinition("whitelist", "", ["Vector", "Address"]),
                new StructureFieldDefinition("current_ticket_number", "", ["U32"]),
                new StructureFieldDefinition("prize_pool", "", ["BigUInt"])
            ]
        );

        let fooType = new StructureType(fooDefinition);
        let fooStructure = new Structure(fooType, [
            new StructureField(new BigUIntValue(Balance.eGLD(10).valueOf()), "ticket_price"),
            new StructureField(new U32Value(0), "tickets_left"),
            new StructureField(new U64Value(BigInt("0x000000005fc2b9db")), "deadline"),
            new StructureField(new U32Value(0xffffffff), "max_entries_per_user"),
            new StructureField(new Vector([new U8Value(0x64)]), "prize_distribution"),
            new StructureField(new Vector([]), "whitelist"),
            new StructureField(new U32Value(9472), "current_ticket_number"),
            new StructureField(new BigUIntValue(BigInt("94720000000000000000000")), "prize_pool")
        ]);

        let encodedExpected = serialized("[00000008|8ac7230489e80000] [00000000] [000000005fc2b9db] [ffffffff] [00000001|64] [00000000] [00002500] [0000000a|140ec80fa7ee88000000]");
        let encoded = codec.encodeNested(fooStructure);
        assert.deepEqual(encoded, encodedExpected);

        let [decoded, decodedLength] = codec.decodeNested(encodedExpected, new TypeDescriptor([fooType]));
        assert.equal(decodedLength, encodedExpected.length);
        assert.deepEqual(decoded, fooStructure);

        let plainFoo = decoded.valueOf();
        assert.deepEqual(plainFoo, {
            ticket_price: BigInt("10000000000000000000"),
            tickets_left: BigInt(0),
            deadline: BigInt("0x000000005fc2b9db"),
            max_entries_per_user: BigInt(0xffffffff),
            prize_distribution: [BigInt(100)],
            whitelist: [],
            current_ticket_number: BigInt(9472),
            prize_pool: BigInt("94720000000000000000000")
        });
    });
});

function serialized(prettyHex: string): Buffer {
    let uglyHex = prettyHex.replace(/[\|\s\[\]]/gi, "");
    let buffer = Buffer.from(uglyHex, "hex");
    return buffer;
}

describe("test codec utilities", () => {
    it("should check whether isMsbOne", async () => {
        assert.isTrue(isMsbOne(Buffer.from([0xFF]), 0));
        assert.isTrue(isMsbOne(Buffer.from([0x00, 0xFF]), 1));
        assert.isTrue(isMsbOne(Buffer.from([0x00, 0xFF, 0xFF]), 2));

        assert.isFalse(isMsbOne(Buffer.from([1])));
        assert.isFalse(isMsbOne(Buffer.from([2])));
        assert.isFalse(isMsbOne(Buffer.from([3])));
        assert.isFalse(isMsbOne(Buffer.from([127])));
        assert.isTrue(isMsbOne(Buffer.from([128])));
        assert.isTrue(isMsbOne(Buffer.from([255])));

        assert.isTrue(isMsbOne(Buffer.from([0b10001000]), 0));
        assert.isFalse(isMsbOne(Buffer.from([0b01001000]), 0));
        assert.isTrue(isMsbOne(Buffer.from([0b00000000, 0b10000000]), 1));
        assert.isFalse(isMsbOne(Buffer.from([0b00000000, 0b01000000]), 1));

        let buffer: Buffer;

        buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(65535);
        assert.isTrue(isMsbOne(buffer));
        buffer.writeInt16BE(-32768);
        assert.isTrue(isMsbOne(buffer));
        buffer.writeInt16BE(32767);
        assert.isFalse(isMsbOne(buffer));

        buffer = Buffer.alloc(8);
        buffer.writeBigUInt64BE(BigInt("18446744073709551615"));
        assert.isTrue(isMsbOne(buffer));
        buffer.writeBigInt64BE(BigInt("-9223372036854775808"));
        assert.isTrue(isMsbOne(buffer));
        buffer.writeBigInt64BE(BigInt("9223372036854775807"));
        assert.isFalse(isMsbOne(buffer));
    });

    it("should discardSuperfluousZeroBytes", async () => {
        let buffer: Buffer;

        buffer = discardSuperfluousZeroBytes(Buffer.from([0, 0, 0, 1, 2, 3, 4, 5]));
        assert.deepEqual(buffer, Buffer.from([1, 2, 3, 4, 5]));
        assert.equal(buffer.toString("hex"), "0102030405");

        buffer = discardSuperfluousZeroBytes(Buffer.from([0, 0]));
        assert.deepEqual(buffer, Buffer.from([]));
        assert.equal(buffer.toString("hex"), "");

        buffer = discardSuperfluousZeroBytes(Buffer.from([5, 0, 0]));
        assert.deepEqual(buffer, Buffer.from([5, 0, 0]));
        assert.equal(buffer.toString("hex"), "050000");
    });

    it("should discardSuperfluousBytesInTwosComplement", async () => {
        let buffer: Buffer;

        // Negative, -1
        buffer = Buffer.alloc(1);
        buffer.writeInt8(-1);
        assert.deepEqual(buffer, Buffer.from([0xFF]));
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0xFF]));

        buffer = Buffer.alloc(2);
        buffer.writeInt16BE(-1);
        assert.deepEqual(buffer, Buffer.from([0xFF, 0xFF]));
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0xFF]));

        buffer = Buffer.alloc(4);
        buffer.writeInt32BE(-1);
        assert.deepEqual(buffer, Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]));
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0xFF]));

        buffer = Buffer.alloc(8);
        buffer.writeBigInt64BE(BigInt("-1"));
        assert.deepEqual(buffer, Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF]));
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0xFF]));

        // Negative, other
        buffer = Buffer.from([0b10000000]);
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0b10000000]));

        buffer = Buffer.from([0b11111111, 0b00000000]);
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0b11111111, 0b00000000]));

        buffer = Buffer.from([0b11111111, 0b10000000]);
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0b10000000]));

        // Positive
        buffer = Buffer.alloc(1);
        buffer.writeInt8(127);
        assert.deepEqual(buffer, Buffer.from([0x7F]));
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(buffer), Buffer.from([0x7F]));

        assert.deepEqual(discardSuperfluousBytesInTwosComplement(Buffer.from([0x00, 0x00, 0xFF])), Buffer.from([0x00, 0xFF]));
        assert.deepEqual(discardSuperfluousBytesInTwosComplement(Buffer.from([0x00, 0x00, 0x7F])), Buffer.from([0x7F]));
    });
});
