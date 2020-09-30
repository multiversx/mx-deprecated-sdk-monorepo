import { Buffer } from "buffer";
import { errors } from "..";

export class Argument {
    private value: string = "";

    private constructor(argumentValue: string) {
        if (argumentValue.length == 0) {
            throw new errors.ErrInvalidArgument("argumentValue");
        }

        this.value = Argument.ensureEvenLength(argumentValue);
    }

    private static ensureEvenLength(argument: string): string {
        return argument.length % 2 == 0 ? argument : "0" + argument;
    }

    static bytes(buffer: Buffer): Argument {
        let hex = buffer.toString("hex");
        return new Argument(hex);
    }

    static number(value: number): Argument {
        return Argument.bigInt(BigInt(value));
    }

    static bigInt(value: BigInt): Argument {
        let hex = value.toString(16);
        return new Argument(hex);
    }

    static hex(value: string): Argument {
        return new Argument(value);
    }

    static utf8(value: string): Argument {
        let buffer = Buffer.from(value, "utf-8");
        let hex = buffer.toString("hex");
        return new Argument(hex);
    }
}