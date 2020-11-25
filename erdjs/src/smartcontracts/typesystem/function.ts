import { TypeDescriptor } from "./typeDescriptor";

export class FunctionDefinition {
    readonly name: string;
    readonly input: FunctionParameterDefinition[] = [];
    readonly output: FunctionParameterDefinition[] = [];

    constructor(name: string, input: FunctionParameterDefinition[], output: FunctionParameterDefinition[]) {
        this.name = name;
        this.input = input || [];
        this.output = output || [];
    }

    static fromJSON(json: { name: string, input: any[], output: [] }): FunctionDefinition {
        let input = json.input.map(param => FunctionParameterDefinition.fromJSON(param));
        let output = json.output.map(param => FunctionParameterDefinition.fromJSON(param));
        return new FunctionDefinition(json.name, input, output);
    }
}

export class FunctionParameterDefinition {
    readonly name: string;
    readonly description: string;
    readonly scopedTypeNames: string[];

    constructor(name: string, description: string, type: string[]) {
        this.name = name;
        this.description = description;
        this.scopedTypeNames = type;
    }

    static fromJSON(json: { name: string, description: string, type: string[] }): FunctionParameterDefinition {
        return new FunctionParameterDefinition(json.name, json.description, json.type);
    }

    getTypeDescriptor(): TypeDescriptor {
        return TypeDescriptor.createFromTypeNames(this.scopedTypeNames);
    }
}