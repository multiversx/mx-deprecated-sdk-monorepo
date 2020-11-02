import { Buffer } from "buffer";
import  * as errors from "../errors";
import { Address } from "../address";

/**
 * The Argument abstraction allows one to prepare arguments for Smart Contract calls (and deployments).
 */
export class Argument {
    /**
     * The actual value of the argument (as a hex-encoded string).
     */
    public readonly value: string = "";

    /**
     * Creates an Argument object from the actual value (hex-encoded).
     * 
     * @param argumentValue The actual value of the argument
     */
    private constructor(argumentValue: string) {
        if (argumentValue.length == 0) {
            throw new errors.ErrInvalidArgument("argumentValue");
        }

        this.value = Argument.ensureEvenLength(argumentValue);
    }

    private static ensureEvenLength(argument: string): string {
        return argument.length % 2 == 0 ? argument : "0" + argument;
    }

    /**
     * Creates an Argument object given a buffer (a sequence of bytes).
     */
    static bytes(buffer: Buffer): Argument {
        let hex = buffer.toString("hex");
        return new Argument(hex);
    }

    /**
     * Creates an Argument object from a number.
     */
    static number(value: number): Argument {
        return Argument.bigInt(BigInt(value));
    }

    /**
     * Creates an Argument object from a big integer.
     */
    static bigInt(value: BigInt): Argument {
        let hex = value.toString(16);
        return new Argument(hex);
    }

    /**
     * Creates an Argument object from an already-encoded hex string.
     */
    static hex(value: string): Argument {
        return new Argument(value);
    }

    /**
     * Creates an Argument object from a utf-8 string.
     */
    static utf8(value: string): Argument {
        let buffer = Buffer.from(value, "utf-8");
        let hex = buffer.toString("hex");
        return new Argument(hex);
    }

    /**
     * Creates an Argument object, as the pubkey of an {@link Address}.
     */
    static pubkey(value: Address): Argument {
        return new Argument(value.hex());
    }
}

/**
 * Appends Argument objects to a given string. 
 * The resulted string is to be used for preparing Smart Contract calls (or deployments).
 * In general, this function should not be used directly. 
 * It is used by {@link TransactionPayload} builders (such as {@link ContractCallPayloadBuilder}), under the hood.
 * 
 * ```
 * let data = appendArguments("transferToken", [Argument.pubkey(alice), Argument.number(42)]);
 * let payload = new TransactionPayload(data);
 * ```
 * 
 * @param to 
 * @param args 
 */
export function appendArguments(to: string, args: Argument[]): string {
    if (args.length == 0) {
        return to;
    }

    args.forEach(arg => {
        to += "@" + arg.value;
    });

    return to;
}