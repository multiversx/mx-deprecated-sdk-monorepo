import * as errors from "../../errors";
import { TypeExpressionParser } from "./typeExpressionParser";
import { BetterType, TypedValue } from "./types";

export class StructureType extends BetterType {
    readonly definition: StructureDefinition;

    constructor(definition: StructureDefinition) {
        super(definition.name);
        this.definition = definition;
    }
}


// TODO: implement setField(), convenience method.
// TODO: Hold fields in a map (by name), and use the order within "field definitions" to perform codec operations.
export class Structure extends TypedValue {
    private readonly fields: StructureField[] = [];

    /**
     * Currently, one can only set fields at initialization time. Construction will be improved at a later time.
     */
    constructor(type: StructureType, fields: StructureField[]) {
        super(type);
        this.fields = fields;

        this.checkTyping();
    }

    private checkTyping() {
        let fields = this.fields;
        let type = <StructureType>this.getType();
        let definitions = type.definition.fields;

        if (fields.length != definitions.length) {
            throw new errors.ErrStructureTyping("fields length vs. field definitions length");
        }

        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            let definition = definitions[i];
            let fieldType = field.value.getType();
            let definitionType = definition.type;

            if (!fieldType.equals(definitionType)) {
                throw new errors.ErrStructureTyping(`check type of field "${definition.name}"`);
            }
            if (field.name != definition.name) {
                throw new errors.ErrStructureTyping(`check name of field "${definition.name}"`);
            }
        }
    }

    getFields(): ReadonlyArray<StructureField> {
        return this.fields;
    }

    valueOf(): any {
        let result: any = {};

        for (const field of this.fields) {
            result[field.name] = field.value.valueOf();
        }

        return result;
    }

    equals(other: Structure): boolean {
        if (!this.getType().equals(other.getType())) {
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
        let fields = (json.fields || []).map(field => StructureFieldDefinition.fromJSON(field));
        return new StructureDefinition(json.name, fields);
    }
}

export class StructureFieldDefinition {
    readonly name: string;
    readonly description: string;
    readonly type: BetterType;

    constructor(name: string, description: string, type: BetterType) {
        this.name = name;
        this.description = description;
        this.type = type;
    }

    static fromJSON(json: { name: string, description: string, type: string }): StructureFieldDefinition {
        let parsedType = new TypeExpressionParser().parse(json.type);
        return new StructureFieldDefinition(json.name, json.description, parsedType);
    }
}
