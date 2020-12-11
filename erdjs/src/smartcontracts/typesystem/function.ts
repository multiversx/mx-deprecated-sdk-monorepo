import { TypeDescriptor } from "./typeDescriptor";

export class FunctionDefinition {
    readonly name: string;
    readonly input: FunctionParameterDefinition[] = [];
    readonly output: FunctionParameterDefinition[] = [];
    readonly modifiers: FunctionModifiers;

    constructor(name: string, input: FunctionParameterDefinition[], output: FunctionParameterDefinition[], modifiers: FunctionModifiers) {
        this.name = name;
        this.input = input || [];
        this.output = output || [];
        this.modifiers = modifiers;
    }

    static fromJSON(json: { name: string, isPure: boolean, isPayable: boolean, input: any[], output: [] }): FunctionDefinition {
        let input = json.input.map(param => FunctionParameterDefinition.fromJSON(param));
        let output = json.output.map(param => FunctionParameterDefinition.fromJSON(param));
        
        let modifiers = new FunctionModifiers();
        modifiers.isPure = json.isPure;
        modifiers.isPayable = json.isPayable;

        return new FunctionDefinition(json.name, input, output, modifiers);
    }
}

export class FunctionModifiers {
    isPure: boolean = false;
    isPayable: boolean = false;
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
