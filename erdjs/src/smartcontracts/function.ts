import  * as errors from "../errors";

/**
 * A function of a Smart Contract, as an abstraction.
 */
export class ContractFunction {
    /**
     * The name of the function.
     */
    readonly name: string;

    /**
     * Creates a ContractFunction object, given its name.
     * 
     * @param name the name of the function
     */
    constructor(name: string) {
        this.name = name;

        if (name.length == 0) {
            throw new errors.ErrInvalidFunctionName();
        }
    }

    /**
     * Null-object pattern: creates an empty ContractFunction object.
     */
    static none(): ContractFunction {
        return new ContractFunction("untitled");
    }

    /**
     * Returns the name of the function.
     */
    toString() {
        return this.name;
    }

    valueOf(): string {
        return this.name;
    }

    equals(other: ContractFunction | null): boolean {
        if (!other) {
            return false;
        }

        return this.name == other.name;
    }
}
