import * as errors from "../errors";
import { guardLength } from "../utils";

export class PrivateKey {
    private readonly buffer: Buffer;

    constructor(value: Buffer) {
        guardLength(value, 32);
        
        this.buffer = value;
    }

    static fromString(value: string): PrivateKey {
        guardLength(value, 64);

        let buffer = Buffer.from(value, "hex");
        return new PrivateKey(buffer);
    }

    static fromKeyFileObject() {

    }

    static fromPEM() {
    }

    toPEM() {
    }

    toString(): string {
        return this.buffer.toString("hex");
    }

    valueOf(): Buffer {
        return this.buffer;
    }
}

