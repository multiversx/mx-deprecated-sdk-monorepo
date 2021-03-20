import * as errors from "./errors";

export class Hash {
    /**
     * The hash, as a hex-encoded string.
     */
    readonly hash: Buffer = Buffer.from([]);

    /**
     * Creates a new Hash object.
     * 
     * @param hash The hash, as a Buffer or a hex-encoded string.
     */
    constructor(hash: Buffer | string) {
        if (hash instanceof Buffer) {
            this.hash = hash;
        } else if (typeof hash === "string") {
            this.hash = Buffer.from(hash, "hex");
        } else {
            throw new errors.ErrBadType("hash", "buffer | string", hash);
        }
    }

    static empty(): Hash {
        return new Hash(Buffer.from([]));
    }

    /**
     * Returns whether the hash is empty (not computed).
     */
    isEmpty(): boolean {
        return this.hash.length == 0;
    }

    toString(): string {
        return this.hash.toString("hex");
    }

    valueOf(): Buffer {
        return this.hash;
    }
}
