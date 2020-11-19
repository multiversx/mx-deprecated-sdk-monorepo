import { describe } from "mocha";
import * as errors from "../errors";
import { assert } from "chai";
import { discardSuperfluousBytesInTwosComplement, discardSuperfluousZeroBytes, IntegerValue, isMostSignificantBitSet, PrimitiveType } from "./types";

describe("test types", () => {
    it("should create integer values, then encode and decode", async () => {
        let value: IntegerValue;

        value = IntegerValue.create(42, PrimitiveType.U8);
        assert.deepEqual(value.encodeBinaryNested(), Buffer.from([0x2A]));
        assert.deepEqual(value.encodeBinaryTopLevel(), Buffer.from([0x2A]));

        value = IntegerValue.create(42, PrimitiveType.U16);
        assert.deepEqual(value.encodeBinaryNested(), Buffer.from([0x00, 0x2A]));
        assert.deepEqual(value.encodeBinaryTopLevel(), Buffer.from([0x2A]));

        value = IntegerValue.create(-10, PrimitiveType.I8);
        assert.deepEqual(value.encodeBinaryNested(), Buffer.from([0xF6]));
        assert.deepEqual(value.encodeBinaryTopLevel(), Buffer.from([0xF6]));

        value = IntegerValue.create(-10, PrimitiveType.I16);
        assert.deepEqual(value.encodeBinaryNested(), Buffer.from([0xFF, 0xF6]));
        assert.deepEqual(value.encodeBinaryTopLevel(), Buffer.from([0xF6]));
    });

    it("for integer values, should throw error when invalid input", () => {
        assert.throw(() => IntegerValue.create(42, PrimitiveType.Address), errors.ErrInvalidArgument);
        assert.throw(() => IntegerValue.create(-42, PrimitiveType.U32), errors.ErrInvalidArgument);
        assert.throw(() => IntegerValue.create(<any>BigInt(42), PrimitiveType.U16), errors.ErrInvalidArgument);
    });
});

describe("test helper functions for types", () => {
    it("should check whether isMostSignificantBitSet", async () => {
        assert.isTrue(isMostSignificantBitSet(Buffer.from([0xFF]), 0));
        assert.isTrue(isMostSignificantBitSet(Buffer.from([0x00, 0xFF]), 1));
        assert.isTrue(isMostSignificantBitSet(Buffer.from([0x00, 0xFF, 0xFF]), 2));

        assert.isFalse(isMostSignificantBitSet(Buffer.from([1])));
        assert.isFalse(isMostSignificantBitSet(Buffer.from([2])));
        assert.isFalse(isMostSignificantBitSet(Buffer.from([3])));
        assert.isFalse(isMostSignificantBitSet(Buffer.from([127])));
        assert.isTrue(isMostSignificantBitSet(Buffer.from([128])));
        assert.isTrue(isMostSignificantBitSet(Buffer.from([255])));

        assert.isTrue(isMostSignificantBitSet(Buffer.from([0b10001000]), 0));
        assert.isFalse(isMostSignificantBitSet(Buffer.from([0b01001000]), 0));
        assert.isTrue(isMostSignificantBitSet(Buffer.from([0b00000000, 0b10000000]), 1));
        assert.isFalse(isMostSignificantBitSet(Buffer.from([0b00000000, 0b01000000]), 1));

        let buffer: Buffer;

        buffer = Buffer.alloc(2);
        buffer.writeUInt16BE(65535);
        assert.isTrue(isMostSignificantBitSet(buffer));
        buffer.writeInt16BE(-32768);
        assert.isTrue(isMostSignificantBitSet(buffer));
        buffer.writeInt16BE(32767);
        assert.isFalse(isMostSignificantBitSet(buffer));

        buffer = Buffer.alloc(8);
        buffer.writeBigUInt64BE(BigInt("18446744073709551615"));
        assert.isTrue(isMostSignificantBitSet(buffer));
        buffer.writeBigInt64BE(BigInt("-9223372036854775808"));
        assert.isTrue(isMostSignificantBitSet(buffer));
        buffer.writeBigInt64BE(BigInt("9223372036854775807"));
        assert.isFalse(isMostSignificantBitSet(buffer));
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
