import { PathLike } from "fs";
import * as fs from "fs";

/**
 * Bytecode of a Smart Contract, as an abstraction.
 */
export class Code {
    private readonly hex: string;

    private constructor(hex: string) {
        this.hex = hex;
    }

    /**
     * Creates a Code object from a buffer (sequence of bytes).
     */
    static fromBuffer(code: Buffer): Code {
        return new Code(code.toString("hex"));
    }

    /**
     * Creates a Code object by loading the bytecode from a specified WASM file.
     */
    static fromFile(file: PathLike) {
        let buffer: Buffer = fs.readFileSync(file);
        return Code.fromBuffer(buffer);
    }

    /**
     * Null-object pattern: creates an empty Code object.
     */
    static nothing(): Code {
        return new Code("");
    }

    /**
     * Returns the bytecode as a hex-encoded string.
     */
    toString(): string {
        return this.hex;
    }
}