import { PathLike } from "fs";
import * as fs from "fs";

export class Code {
    private readonly hex: string;

    private constructor(hex: string) {
        this.hex = hex;
    }

    static fromBuffer(code: Buffer): Code {
        return new Code(code.toString("hex"));
    }

    static fromFile(file: PathLike) {
        let buffer: Buffer = fs.readFileSync(file);
        return Code.fromBuffer(buffer);
    }

    toString(): string {
        return this.hex;
    }
}