import { PrimitiveType } from "./types";

/**
 * Contract ABIs aren't yet fully implemented. This is just a prototype.
 * A future release of `erdjs` will handle ABIs properly.
 */
export class AbiRegistry {
    readonly namespaces: Namespace[] = [];

    extend(obj: any) {
        for (let item of obj.namespaces || []) {
            this.namespaces.push(new Namespace(item));
        }
    }
}

export class Namespace {
    readonly namespace: string;
    readonly functions: FunctionDefinition[] = [];
    readonly structures: StructureDefinition[] = [];

    constructor(init: { namespace: string, functions: any[], structures: any[] }) {
        this.namespace = init.namespace;

        for (let item of init.functions || []) {
            this.functions.push(new FunctionDefinition(this, item));
        }

        for (let item of init.structures || []) {
            this.structures.push(new StructureDefinition(this, item));
        }
    }
}

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
    readonly isArray: boolean;
    readonly isOptional: boolean;
    readonly primitiveType: PrimitiveType | undefined;
    private readonly customTypeName: string | undefined;

    constructor(namespace: Namespace, init: { description: string, isArray: boolean, isOptional: boolean, primitiveType: string, customType: string }) {
        this.namespace = namespace;
        this.description = init.description;
        this.isArray = init.isArray;
        this.isOptional = init.isOptional;
        this.customTypeName = init.customType;

        if (init.primitiveType) {
            this.primitiveType = PrimitiveType.getByName(init.primitiveType);
        }
    }

    getCustomType(): StructureDefinition | undefined {
        return this.namespace.structures.find(item => item.name == this.customTypeName);
    }
}

export class StructureDefinition {
    private readonly namespace: Namespace;

    readonly name: string;
    readonly fields: StructureFieldDefinition[] = [];

    constructor(namespace: Namespace, init: { name: string, fields: any[] }) {
        this.namespace = namespace;
        this.name = init.name;

        for (let item of init.fields || []) {
            this.fields.push(new StructureFieldDefinition(namespace, item));
        }
    }
}

export class StructureFieldDefinition {
    private readonly namespace: Namespace;

    readonly description: string;
    readonly isArray: boolean;
    readonly isOptional: boolean;
    readonly primitiveType: PrimitiveType | undefined;
    private readonly customTypeName: string | undefined;

    constructor(namespace: Namespace, init: { description: string, isArray: boolean, isOptional: boolean, primitiveType: string, customType: string }) {
        this.namespace = namespace;
        this.description = init.description;
        this.isArray = init.isArray;
        this.isOptional = init.isOptional;
        this.customTypeName = init.customType;

        if (init.primitiveType) {
            this.primitiveType = PrimitiveType.getByName(init.primitiveType);
        }
    }

    getCustomType(): StructureDefinition | undefined {
        return this.namespace.structures.find(item => item.name == this.customTypeName);
    }
}

