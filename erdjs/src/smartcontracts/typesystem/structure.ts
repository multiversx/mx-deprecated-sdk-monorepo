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
    private readonly fields: StructureField[] = [];

    constructor(type: StructureType, fields: StructureField[]) {
        super();
        this.type = type;
        this.fields = fields;

        // TODO: Also check fields against structure definition.
    }

    // TODO: setField(), convenience method.

    getFields(): ReadonlyArray<StructureField> {
        return this.fields;
    }

    valueOf(): any {
        return {};
    }

    equals(other: Structure): boolean {
        if (!this.type.equals(other.type)) {
            return false;
        }

        let selfFields = this.getFields();
        let otherFields = other.getFields();
        
        if (selfFields.length != otherFields.length) {
            return false;
        }

        for (let i = 0; i < selfFields.length; i++) {
            let selfField = selfFields[i];
            let otherField = otherFields[i];

            if (!selfField.equals(otherField)) {
                return false;
            }
        }

        return true;
    }

    getType(): StructureType {
        return this.type;
    }
}

export class StructureField {
    readonly value: TypedValue;
    readonly name: string;

    constructor(value: TypedValue, name: string = "") {
        this.value = value;
        this.name = name;
    }

    equals(other: StructureField) {
        return this.name == other.name && this.value.equals(other.value);
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
