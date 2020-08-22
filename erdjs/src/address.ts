import * as valid from "./validation";
import * as bech32 from "bech32";
import * as errors from "./errors";

export class Address {
    private buffer: Buffer = Buffer.from("");
    private prefix: string = "";

    public constructor(address?: string) {
        if (address) {
            this.set(address);
        }
    }

    public set(address: string) {
        let decodedAddress = bech32.decode(address);
        if (decodedAddress.prefix != valid.ADDRESS_PREFIX) {
            throw errors.ErrInvalidAddressPrefix;
        }

        let addressBytes = Buffer.from(bech32.fromWords(decodedAddress.words));
        if (addressBytes.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }

        this.buffer = addressBytes;
        this.prefix = decodedAddress.prefix;
    }

    public setHex(addressHex: string): Address {
        var addressBytes = Buffer.from(addressHex, 'hex');
        if (addressBytes.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }

        this.buffer = addressBytes;
        return this;
    }

    public setBytes(bytes: Buffer): Address {
        if (bytes.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }

        this.buffer = bytes;
        return this;
    }

    public getPrefix(): string {
        return this.prefix;
    }

    public bytes(): Buffer {
        return this.buffer;
    }

    public hex(): string {
        return this.buffer.toString('hex');
    }

    public equals(other: Address | null): boolean {
        if (!other) {
            return false;
        }

        return this.hex() == other.hex();
    }

    public toString(): string {
        if (this.buffer.length != valid.ADDRESS_LENGTH) {
            throw errors.ErrWrongAddressLength;
        }

        let words = bech32.toWords(this.buffer);
        let address = bech32.encode(valid.ADDRESS_PREFIX, words);
        return address;
    }
}
