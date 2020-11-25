import { TypeDescriptor } from "./typeDescriptor";

export class FunctionDefinition {
    readonly name: string;
    readonly input: FunctionParameterDefinition[] = [];
    readonly output: FunctionParameterDefinition[] = [];

    constructor(init: { name: string, input: any[], output: [] }) {
        this.name = init.name;

        for (let item of init.input || []) {
            this.input.push(new FunctionParameterDefinition(item));
        }

        for (let item of init.output || []) {
            this.output.push(new FunctionParameterDefinition(item));
        }
    }
}

export class FunctionParameterDefinition {
    readonly description: string;
    readonly scopedTypeNames: string[];

    constructor(init: { description: string, type: string[] }) {
        this.description = init.description;
        this.scopedTypeNames = init.type;
    }

    getTypeDescriptor(): TypeDescriptor {
        return TypeDescriptor.createFromTypeNames(this.scopedTypeNames);
    }
}