import { Namespace } from "./namespace";
import { TypeDescriptor } from "./typeDescriptor";

export class FunctionDefinition {
    private readonly namespace: Namespace;
    readonly name: string;
    readonly input: FunctionParameterDefinition[] = [];
    readonly output: FunctionParameterDefinition[] = [];

    constructor(namespace: Namespace, init: { name: string, input: any[], output: [] }) {
        this.namespace = namespace;
        this.name = init.name;

        for (let item of init.input || []) {
            this.input.push(new FunctionParameterDefinition(namespace, item));
        }

        for (let item of init.output || []) {
            this.output.push(new FunctionParameterDefinition(namespace, item));
        }
    }
}

export class FunctionParameterDefinition {
    private readonly namespace: Namespace;
    readonly description: string;
    readonly scopedTypeNames: string[];

    constructor(namespace: Namespace, init: { description: string, type: string[] }) {
        this.namespace = namespace;
        this.description = init.description;
        this.scopedTypeNames = init.type;
    }

    getTypeDescriptor(): TypeDescriptor {
        
    }
}