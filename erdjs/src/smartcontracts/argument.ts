import { Buffer } from "buffer";
import { Address } from "../address";
import { BinaryCodec } from "./codec";
import { OptionalValue, TypedValue } from "./typesystem";

/**
 * The Argument abstraction allows one to prepare arguments for Smart Contract calls (and deployments).
 */
export class Argument {
    /**
     * For the moment, this is the only codec used.
     */
    private static codec = new BinaryCodec();

    /**
     * The actual value of the argument, to be passed to the Protocol (as a hex-encoded string).
     */
    private readonly hexEncoded: string = "";

    /**
     * Creates an Argument object from the actual value (hex-encoded).
     * 
     * @param hexEncoded The actual value of the argument
     */
    private constructor(hexEncoded: string) {
        this.hexEncoded = Argument.ensureEvenLength(hexEncoded);
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

    /**
     * Creates an Argument object, as a missing optional argument.
     */
    static missingOptional(): Argument {
        return Argument.typed(new OptionalValue());
    }

    /**
     * Creates an Argument object, as a provided optional argument.
     */
    static providedOptional(typedValue: TypedValue): Argument {
        return Argument.typed(typedValue);
    }

    static typed(typedValue: TypedValue): Argument {
        let buffer = Argument.codec.encodeTopLevel(typedValue);
        let hexEncoded = buffer.toString("hex");
        return new Argument(hexEncoded);
    }

    valueOf(): string {
        return this.hexEncoded;
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
        to += "@" + arg.valueOf();
    });

    return to;
}
