import { Address } from "../address";
import { StructDefinition } from "./abi";
import { PrimitiveType } from "./types";
import * as errors from "../errors";

export class BinarySerializer {
    deserialize(buffer: Buffer, into: any, structDefinition: StructDefinition): any {
        let fields = structDefinition.getFields();
        let reader = new BinaryReader(buffer);

        fields.forEach(field => {
            into[field.name] = reader.readPrimitive(field.type, field.asArray);
        });
    }

    // serialize(obj: Any, struct: StructDefinition) {
    //     //TODO: implement
    // }
}

export class BinaryReader {
    private readonly buffer: Buffer;
    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    readPrimitive(type: PrimitiveType, asArray: boolean): any {
        let self: any = this;
        let typeName = type.name;
        let readerFunctionName: string = asArray ? `read${typeName}Array` : `read${typeName}`;
        let readerFunction = <Function>self[readerFunctionName];
        if (!readerFunction) {
            throw new errors.ErrSerializationCannotRead(`Unknown reader function: ${readerFunctionName}`);
        }

        let result = readerFunction.call(this, this.buffer);
        return result;
    }

    readBigUInt(): BigInt {
        let length = this.readLength();
        let slice = this.readSlice(length);
        let hex = slice.toString("hex");
        let result = BigInt(`0x${hex}`);
        return result;
    }

    readU32(): number {
        let result = this.buffer.readUInt32BE(this.offset);
        this.incrementOffset(4);
        return result;
    }

    readU64(): bigint {
        let result = this.buffer.readBigUInt64BE(this.offset);
        this.incrementOffset(8);
        return result;
    }

    readU8Array(): number[] {
        let result = [];
        let length = this.readLength();

        for (let i = 0; i < length; i++) {
            let value = this.buffer.readUInt8(this.offset);
            this.incrementOffset(1);

            result.push(value);
        }

        return result;
    }

    readAddressArray(): Address[] {
        let result = [];
        let length = this.readLength();

        for (let i = 0; i < length; i++) {
            let slice = this.readSlice(32);
            let address = new Address(slice);
            result.push(address);
        }

        return result;
    }

    private readLength(): number {
        let length = this.buffer.readUInt32BE(this.offset);
        this.incrementOffset(4);
        return length;
    }

    private readSlice(length: number): Buffer {
        let slice = this.buffer.slice(this.offset, this.offset + length);
        this.incrementOffset(length);
        return slice;
    }

    private incrementOffset(value: number) {
        this.offset += value;
    }
}