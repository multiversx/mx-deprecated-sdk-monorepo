import { Address } from "../address";
import { guardLength } from "../utils";

export class PublicKey {
    private readonly buffer: Buffer;

    constructor(buffer: Buffer) {
        guardLength(buffer, 32);
        
        this.buffer = buffer;
    }

    toString(): string {
        return this.buffer.toString("hex");
    }

    toAddress(): Address {
        return new Address(this.buffer);
    }
}
