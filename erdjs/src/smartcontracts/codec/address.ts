import { Address } from "../../address";
import { AddressValue } from "../typesystem";

export class AddressBinaryCodec {
    /**
     * Reads and decodes an AddressValue from a given buffer.
     * 
     * @param buffer the input buffer
     */
    decodeNested(buffer: Buffer): [AddressValue, number] {
        // We don't check the size of the buffer, we just read 32 bytes.

        let slice = buffer.slice(0, 32);
        let value = new Address(slice);
        return [new AddressValue(value), 32];
    }

    /**
     * Reads and decodes an AddressValue from a given buffer.
     * 
     * @param buffer the input buffer
     */
    decodeTopLevel(buffer: Buffer): AddressValue {
        let [decoded, length] = this.decodeNested(buffer);
        return decoded;
    }

    /**
     * Encodes an AddressValue to a buffer.
     */
    encodeNested(primitive: AddressValue): Buffer {
        return primitive.valueOf().pubkey();
    }

    /**
     * Encodes an AddressValue to a buffer.
     */
    encodeTopLevel(primitive: AddressValue): Buffer {
        return primitive.valueOf().pubkey();
    }
}
