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

    constructor(type: StructureType, init: any) {
        super();
        this.type = type;

        Object.assign(this, init);
    }

    getType(): StructureType {
        return this.type;
    }
}

export class StructureDefinition {
    readonly name: string;
    readonly fields: StructureFieldDefinition[] = [];

    constructor(name: string, fields: StructureFieldDefinition[]) {
        this.name = name;
        this.fields = fields || [];
    }

    static fromJSON(json: { name: string, fields: any[] }): StructureDefinition {
        let fields = json.fields.map(field => StructureFieldDefinition.fromJSON(field));
        return new StructureDefinition(json.name, fields);
    }
}

export class StructureFieldDefinition {
    readonly name: string;
    readonly description: string;
    readonly scopedTypeNames: string[];

    constructor(name: string, description: string, type: string[]) {
        this.name = name;
        this.description = description;
        this.scopedTypeNames = type;
    }

    static fromJSON(json: { name: string, description: string, type: string[] }): StructureFieldDefinition {
        return new StructureFieldDefinition(json.name, json.description, json.type);
    }

    getTypeDescriptor(): TypeDescriptor {
        return TypeDescriptor.createFromTypeNames(this.scopedTypeNames);
    }
}
