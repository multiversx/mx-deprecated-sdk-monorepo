export class Hash {
    /**
     * The hash, as a hex-encoded string.
     */
    readonly hash: string;

    /**
     * Creates a new Hash object.
     * 
     * @param hash The hash, as a hex-encoded string.
     */
    constructor(hash: string) {
        this.hash = hash;
    }

    static empty(): Hash {
        return new Hash("");
    }

    /**
     * Returns whether the hash is empty (not computed).
     */
    isEmpty(): boolean {
        return !this.hash;
    }

    toString(): string {
        return this.hash;
    }

    valueOf(): string {
        return this.hash;
    }
}
