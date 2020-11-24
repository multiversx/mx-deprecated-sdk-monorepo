import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "../address";
import { AbiRegistry, StructureDefinition } from "./abi";
import { BinaryCodec, discardSuperfluousBytesInTwosComplement, discardSuperfluousZeroBytes, isMbsOne } from "./codecs";
import { BooleanValue, NumericalValue, PrimitiveType } from "./types";

describe("test binary codec (basic)", () => {
    let abiRegistry = new AbiRegistry();
    let codec = new BinaryCodec(abiRegistry);

    it("should create boolean values, encode and decode", async () => {
        check(true, [0x01], [0x01]);
        check(false, [0x00], []);

        function check(asBoolean: boolean, nested: number[], topLevel: number[]) {
            let value = new BooleanValue(asBoolean);

            codec.

            assert.deepEqual(value.encodeBinaryNested(), Buffer.from(nested));
            assert.deepEqual(value.encodeBinaryTopLevel(), Buffer.from(topLevel));

            let [decodedNested, nestedLength] = BooleanValue.decodeNested(Buffer.from(nested));
            assert.isTrue(decodedNested.equals(value));
            assert.equal(nestedLength, 1);

            let decodedTop = BooleanValue.decodeTopLevel(Buffer.from(topLevel));
            assert.isTrue(decodedTop.equals(value));
        }
    });

    it("should create numeric values, encode and decode", async () => {
        let value: NumericalValue;

        // Small int

        check(BigInt(42), PrimitiveType.U8, [0x2A], [0x2A]);
        check(BigInt(42), PrimitiveType.U16, [0x00, 0x2A], [0x2A]);
        check(BigInt(-10), PrimitiveType.I8, [0xF6], [0xF6]);
        check(BigInt(-10), PrimitiveType.I16, [0xFF, 0xF6], [0xF6]);

        // BigInt

        check(BigInt(0), PrimitiveType.BigInt, [0, 0, 0, 0], []);
        check(BigInt(1), PrimitiveType.BigInt, [0, 0, 0, 1, 0x01], [0x01]);
        check(BigInt(-1), PrimitiveType.BigInt, [0, 0, 0, 1, 0xFF], [0xFF]);
        check(BigInt(-2), PrimitiveType.BigInt, [0, 0, 0, 1, 0xFE], [0xFE]);
        check(BigInt(127), PrimitiveType.BigInt, [0, 0, 0, 1, 0x7F], [0x7F]);
        check(BigInt(128), PrimitiveType.BigInt, [0, 0, 0, 2, 0x00, 0x80], [0x00, 0x80]);
        check(BigInt(255), PrimitiveType.BigInt, [0, 0, 0, 2, 0x00, 0xFF], [0x00, 0xFF]);
        check(BigInt(256), PrimitiveType.BigInt, [0, 0, 0, 2, 0x01, 0x00], [0x01, 0x00]);
        check(BigInt(-255), PrimitiveType.BigInt, [0, 0, 0, 2, 0xFF, 0x01], [0xFF, 0x01]);
        check(BigInt(-257), PrimitiveType.BigInt, [0, 0, 0, 2, 0xFE, 0xFF], [0xFE, 0xFF]);

        // Zero, fixed-size

        PrimitiveType.numericTypes().filter(type => type.hasFixedSize()).forEach(type => {
            check(BigInt(0), type, Array(type.sizeInBytes!).fill(0), []);
        });

        // Zero, arbitrary-size (big)

        PrimitiveType.numericTypes().filter(type => type.hasArbitrarySize()).forEach(type => {
            check(BigInt(0), type, [0, 0, 0, 0], []);
        });

        function check(asBigInt: bigint, type: PrimitiveType, nested: number[], topLevel: number[]) {
            let value = new NumericalValue(asBigInt, type);

            assert.deepEqual(value.encodeBinaryNested(), Buffer.from(nested));
            assert.deepEqual(value.encodeBinaryTopLevel(), Buffer.from(topLevel));

            let [decodedNested, nestedLength] = NumericalValue.decodeNested(Buffer.from(nested), type);
            assert.isTrue(decodedNested.equals(value));
            assert.equal(nestedLength, nested.length);

            let decodedTop = NumericalValue.decodeTopLevel(Buffer.from(topLevel), type);
            assert.isTrue(decodedTop.equals(value));
        }
    });
});


// describe("test serialization", () => {
//     it("should deserialize struct", async () => {
//         let definition = new StructureDefinition();
//         definition.addField("ticket_price", PrimitiveType.BigUInt);
//         definition.addField("tickets_left", PrimitiveType.U32);
//         definition.addField("deadline", PrimitiveType.U64);
//         definition.addField("max_entries_per_user", PrimitiveType.U32);
//         definition.addField("prize_distribution", PrimitiveType.U8, true);
//         definition.addField("whitelist", PrimitiveType.Address, true);
//         definition.addField("current_ticket_number", PrimitiveType.U32);
//         definition.addField("prize_pool", PrimitiveType.BigUInt);

//         // TODO: this is user defined...
//         class Foo {
//             ticket_price: BigInt = BigInt(0);
//             tickets_left: number = 0;
//             deadline: BigInt = BigInt(0);
//             max_entries_per_user: number = 0;
//             prize_distribution: number[] = [];
//             whitelist: Address[] = [];
//             current_ticket_number: number = 0;
//             prize_pool: BigInt = BigInt(0);
//         }

//         let foo = new Foo();

//         let serializer = new BinarySerializer();
//         let data = serialized("[00000008|8ac7230489e80000] [00000000] [000000005fc2b9db] [ffffffff] [00000001|64] [00000000] [00002500] [0000000a|140ec80fa7ee88000000]");
//         serializer.deserialize(data, foo, definition);

//         assert.deepEqual(foo, {
//             ticket_price: BigInt("10000000000000000000"),
//             tickets_left: 0,
//             deadline: BigInt("0x000000005fc2b9db"),
//             max_entries_per_user: parseInt("ffffffff", 16),
//             prize_distribution: [100],
//             whitelist: [],
//             current_ticket_number: 9472,
//             prize_pool: BigInt("94720000000000000000000")
//         });
//     });
// });

// describe("test reader", () => {
//     it("should read big ints", async () => {
//         let data = serialized("00000008|8ac7230489e80000");
//         let reader = new BinaryReader(data);
//         let result = reader.readBigUInt();
//         assert.equal(result, BigInt("10000000000000000000"));

//         data = serialized("0000000a|140ec80fa7ee88000000");
//         reader = new BinaryReader(data);
//         result = reader.readBigUInt();
//         assert.equal(result, BigInt("94720000000000000000000"));

//         // Now read both
//         data = serialized("[00000008|8ac7230489e80000] [0000000a|140ec80fa7ee88000000]");
//         reader = new BinaryReader(data);
//         assert.equal(reader.readBigUInt(), BigInt("10000000000000000000"));
//         assert.equal(reader.readBigUInt(), BigInt("94720000000000000000000"));

//         // TODO: Also read signed big ints.
//     });
// });

describe("test codec utilities", () => {
    it("should check whether isMbsOne", async () => {
        assert.isTrue(isMbsOne(Buffer.from([0xFF]), 0));
        assert.isTrue(isMbsOne(Buffer.from([0x00, 0xFF]), 1));
        assert.isTrue(isMbsOne(Buffer.from([0x00, 0xFF, 0xFF]), 2));

        assert.isFalse(isMbsOne(Buffer.from([1])));
        assert.isFalse(isMbsOne(Buffer.from([2])));
        assert.isFalse(isMbsOne(Buffer.from([3])));
        assert.isFalse(isMbsOne(Buffer.from([127])));
        assert.isTrue(isMbsOne(Buffer.from([128])));
        assert.isTrue(isMbsOne(Buffer.from([255])));

        assert.isTrue(isMbsOne(Buffer.from([0b10001000]), 0));
        assert.isFalse(isMbsOne(Buffer.from([0b01001000]), 0));
        assert.isTrue(isMbsOne(Buffer.from([0b00000000, 0b10000000]), 1));
        assert.isFalse(isMbsOne(Buffer.from([0b00000000, 0b01000000]), 1));

        let buffer: Buffer;

        buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(65535);
        assert.isTrue(isMbsOne(buffer));
        buffer.writeInt16BE(-32768);
        assert.isTrue(isMbsOne(buffer));
        buffer.writeInt16BE(32767);
        assert.isFalse(isMbsOne(buffer));

        buffer = Buffer.alloc(8);
        buffer.writeBigUInt64BE(BigInt("18446744073709551615"));
        assert.isTrue(isMbsOne(buffer));
        buffer.writeBigInt64BE(BigInt("-9223372036854775808"));
        assert.isTrue(isMbsOne(buffer));
        buffer.writeBigInt64BE(BigInt("9223372036854775807"));
        assert.isFalse(isMbsOne(buffer));
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

function serialized(prettyHex: string): Buffer {
    let uglyHex = prettyHex.replace(/[\|\s\[\]]/gi, "");
    let buffer = Buffer.from(uglyHex, "hex");
    return buffer;
}
