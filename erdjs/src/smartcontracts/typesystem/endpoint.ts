import { TypeDescriptor } from "./typeDescriptor";

export class EndpointDefinition {
    readonly name: string;
    readonly input: EndpointParameterDefinition[] = [];
    readonly output: EndpointParameterDefinition[] = [];
    readonly modifiers: EndpointModifiers;

    constructor(name: string, input: EndpointParameterDefinition[], output: EndpointParameterDefinition[], modifiers: EndpointModifiers) {
        this.name = name;
        this.input = input || [];
        this.output = output || [];
        this.modifiers = modifiers;
    }

    static fromJSON(json: { name: string, isPure: boolean, isPayable: boolean, input: any[], output: [] }): EndpointDefinition {
        let input = json.input.map(param => EndpointParameterDefinition.fromJSON(param));
        let output = json.output.map(param => EndpointParameterDefinition.fromJSON(param));
        
        let modifiers = new EndpointModifiers();
        modifiers.isPure = json.isPure;
        modifiers.isPayable = json.isPayable;

        return new EndpointDefinition(json.name, input, output, modifiers);
    }
}

export class EndpointModifiers {
    isPure: boolean = false;
    isPayable: boolean = false;
}

export class EndpointParameterDefinition {
    readonly name: string;
    readonly description: string;
    readonly scopedTypeNames: string[];

    constructor(name: string, description: string, type: string[]) {
        this.name = name;
        this.description = description;
        this.scopedTypeNames = type;
    }

    static fromJSON(json: { name: string, description: string, type: string[] }): EndpointParameterDefinition {
        return new EndpointParameterDefinition(json.name, json.description, json.type);
    }

    getTypeDescriptor(): TypeDescriptor {
        return TypeDescriptor.createFromTypeNames(this.scopedTypeNames);
    }
}
