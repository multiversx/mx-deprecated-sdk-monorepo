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
    readonly name: string;
    readonly fields: StructureFieldDefinition[] = [];

    constructor(init: { name: string, fields: any[] }) {
        this.name = init.name;

        for (let item of init.fields || []) {
            this.fields.push(new StructureFieldDefinition(item));
        }
    }
}

export class StructureFieldDefinition {
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
