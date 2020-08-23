import * as bech32 from "bech32";
import * as errors from "./errors";


const HRP = "erd";
const PUBKEY_LENGTH = 32;
const PUBKEY_STRING_LENGTH = PUBKEY_LENGTH * 2;

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

        // Copy-constructor
        if (value instanceof Address) {
            this.valueHex = value.valueHex;
            return;
        }

        // From buffer (bytes)
        if (value instanceof Buffer) {
            let buffer = value as Buffer;
            let length = buffer.length;
            if (length != PUBKEY_LENGTH) {
                throw new errors.ErrAddressWrongLength(PUBKEY_LENGTH, length);
            }

            this.valueHex = buffer.toString("hex");
            return;
        }

        // From string
        if (typeof value === "string") {
            let asString = (value as string).toLowerCase();
            let length = asString.length;

            // From HEX
            if (length == PUBKEY_STRING_LENGTH) {
                let isValidHex = Buffer.from(asString, "hex").length == PUBKEY_LENGTH;
                if (isValidHex) {
                    this.valueHex = asString;
                    return;
                }
            }

            // From BECH32
            this.valueHex = decodeBech32(asString);
            return;
        }

        throw new errors.ErrAddressCannotCreate(value);
    }

    public hex(): string {
        this.assertNotEmpty();

        return this.valueHex;
    }

    public bech32(): string {
        this.assertNotEmpty();

        let words = bech32.toWords(this.pubkey());
        let address = bech32.encode(HRP, words);
        return address;
    }

    public pubkey(): Buffer {
        this.assertNotEmpty();

        return Buffer.from(this.valueHex, "hex");
    }

    private assertNotEmpty() {
        if (!this.valueHex) {
            throw new errors.ErrAddressEmpty();
        }
    }

    public equals(other: Address | null): boolean {
        if (!other) {
            return false;
        }

        return this.valueHex == other.valueHex;
    }

    public toString(): string {
        return this.bech32();
    }

    public static Zero(): Address {
        return new Address("0".repeat(64));
    }
}

function decodeBech32(value: string): string {
    let decoded = bech32.decode(value);
    let prefix = decoded.prefix;
    if (prefix != HRP) {
        throw new errors.ErrAddressBadHrp(HRP, prefix);
    }

    let pubkey = Buffer.from(bech32.fromWords(decoded.words));
    let length = pubkey.length;
    if (length != PUBKEY_LENGTH) {
        throw new errors.ErrAddressWrongLength(PUBKEY_LENGTH, length);
    }

    return pubkey.toString("hex");
}
