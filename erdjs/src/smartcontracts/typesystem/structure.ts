import { Namespace } from "./namespace";
import { TypeDescriptor } from "./typeDescriptor";
import { Type, TypedValue } from "./types";

export class StructureType extends Type {
    readonly definition: StructureDefinition;

    constructor(definition: StructureDefinition) {
        super(definition.name);
        this.definition = definition;
    }
}

export class Structure extends TypedValue {
    private readonly type: StructureType;

    constructor(type: StructureType) {
        super();
        this.type = type;
    }

    getType(): StructureType {
        return this.type;
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
    readonly scopedTypeNames: string[];

    constructor(namespace: Namespace, init: { description: string, type: string[] }) {
        this.namespace = namespace;
        this.description = init.description;
        this.scopedTypeNames = init.type;
    }

    getTypeDescriptor(): TypeDescriptor {
    }
}
