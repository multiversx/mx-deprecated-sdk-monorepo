import * as bech32 from "bech32";
import * as errors from "./errors";


const HRP = "erd";
const PUBKEY_LENGTH = 32;

/**
 * An Elrond Address, as an immutable object.
 */
export class Address {
    // We keep a hex-encoded string as the "backing" value
    private valueHex: string = "";

    public constructor(value?: Address | Buffer | string) {
        if (!value) {
            return;
        }
        if (value instanceof Address) {
            return Address.fromAddress(value);
        }
        if (value instanceof Buffer) {
            return Address.fromBuffer(value);
        }
        if (typeof value === "string") {
            return Address.fromString(value);
        }

        throw new errors.ErrAddressCannotCreate(value);
    }

    /**
     * Creates an address object from another address object
     */
    static fromAddress(address: Address): Address {
        return Address.fromValidHex(address.valueHex);
    }

    private static fromValidHex(value: string): Address {
        let result = new Address();
        result.valueHex = value;
        return result;
    }

    /**
     * Creates an address object from a Buffer
     */
    static fromBuffer(buffer: Buffer): Address {
        if (buffer.length != PUBKEY_LENGTH) {
            throw new errors.ErrAddressCannotCreate(buffer);
        }

        return Address.fromValidHex(buffer.toString("hex"));
    }

    /**
     * Creates an address object from a string (hex or bech32)
     */
    static fromString(value: string): Address {
        if (Address.isValidHex(value)) {
            return Address.fromValidHex(value);
        }

        return Address.fromBech32(value);
    }

    private static isValidHex(value: string) {
        return Buffer.from(value, "hex").length == PUBKEY_LENGTH;
    }

    /**
     * Creates an address object from a hex-encoded string
     */
    static fromHex(value: string): Address {
        if (!Address.isValidHex(value)) {
            throw new errors.ErrAddressCannotCreate(value);
        }

        return Address.fromValidHex(value);
    }

    /**
     * Creates an address object from a bech32-encoded string
     */
    static fromBech32(value: string): Address {
        let decoded;

        try {
            decoded = bech32.decode(value);
        } catch (err) {
            throw new errors.ErrAddressCannotCreate(value, err);
        }

        let prefix = decoded.prefix;
        if (prefix != HRP) {
            throw new errors.ErrAddressBadHrp(HRP, prefix);
        }

        let pubkey = Buffer.from(bech32.fromWords(decoded.words));
        if (pubkey.length != PUBKEY_LENGTH) {
            throw new errors.ErrAddressCannotCreate(value);
        }

        return Address.fromValidHex(pubkey.toString("hex"));
    }

    /**
     * Returns the hex representation of the address (pubkey)
     */
    hex(): string {
        this.assertNotEmpty();

        return this.valueHex;
    }

    /**
     * Returns the bech32 representation of the address
     */
    bech32(): string {
        this.assertNotEmpty();

        let words = bech32.toWords(this.pubkey());
        let address = bech32.encode(HRP, words);
        return address;
    }

    /**
     * Returns the pubkey as raw bytes (buffer)
     */
    pubkey(): Buffer {
        this.assertNotEmpty();

        return Buffer.from(this.valueHex, "hex");
    }

    private assertNotEmpty() {
        if (!this.valueHex) {
            throw new errors.ErrAddressEmpty();
        }
    }

    /**
     * Compares the address to another address
     */
    equals(other: Address | null): boolean {
        if (!other) {
            return false;
        }

        return this.valueHex == other.valueHex;
    }

    /**
     * Returns the bech32 representation of the address
     */
    toString(): string {
        return this.bech32();
    }

    /**
     * Creates the Zero address (the one that should be used when deploying smart contracts)
     */
    static Zero(): Address {
        return new Address("0".repeat(64));
    }
}
