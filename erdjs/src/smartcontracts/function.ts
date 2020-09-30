export class ContractFunction {
    name: string;

    constructor(name: string) {
        this.name = name;
    }

    toString(): string {
        return this.name;
    }
}