import * as errors from "../../errors";
import { TypeExpressionParser } from "./typeExpressionParser";
import { Type, CustomType, TypedValue } from "./types";

export class StructType extends CustomType {
    readonly fields: StructFieldDefinition[] = [];

    constructor(name: string, fields: StructFieldDefinition[]) {
        super(name);
        this.fields = fields;
    }

    static fromJSON(json: { name: string, fields: any[] }): StructType {
        let fields = (json.fields || []).map(field => StructFieldDefinition.fromJSON(field));
        return new StructType(json.name, fields);
    }
}

// TODO: Perhaps rename to FieldDefinition and extract to separate file, fields.ts?
export class StructFieldDefinition {
    readonly name: string;
    readonly description: string;
    readonly type: Type;

    constructor(name: string, description: string, type: Type) {
        this.name = name;
        this.description = description;
        this.type = type;
    }

    static fromJSON(json: { name: string, description: string, type: string }): StructFieldDefinition {
        let parsedType = new TypeExpressionParser().parse(json.type);
        return new StructFieldDefinition(json.name, json.description, parsedType);
    }
}

// TODO: implement setField(), convenience method.
// TODO: Hold fields in a map (by name), and use the order within "field definitions" to perform codec operations.
export class Struct extends TypedValue {
    private readonly fields: StructField[] = [];

    /**
     * Currently, one can only set fields at initialization time. Construction will be improved at a later time.
     */
    constructor(type: StructType, fields: StructField[]) {
        super(type);
        this.fields = fields;

        this.checkTyping();
    }

    private checkTyping() {
        let fields = this.fields;
        let type = <StructType>this.getType();
        let definitions = type.fields;

        if (fields.length != definitions.length) {
            throw new errors.ErrStructTyping("fields length vs. field definitions length");
        }

        for (let i = 0; i < fields.length; i++) {
            let field = fields[i];
            let definition = definitions[i];
            let fieldType = field.value.getType();
            let definitionType = definition.type;

            if (!fieldType.equals(definitionType)) {
                throw new errors.ErrStructTyping(`check type of field "${definition.name}; expected: ${definitionType}, actual: ${fieldType}"`);
            }
            if (field.name != definition.name) {
                throw new errors.ErrStructTyping(`check name of field "${definition.name}"`);
            }
        }
    }

    getFields(): ReadonlyArray<StructField> {
        return this.fields;
    }

    valueOf(): any {
        let result: any = {};

        for (const field of this.fields) {
            result[field.name] = field.value.valueOf();
        }

        return result;
    }

    equals(other: Struct): boolean {
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


// TODO: Perhaps rename to Field and extract to separate file, fields.ts?
export class StructField {
    readonly value: TypedValue;
    readonly name: string;

    constructor(value: TypedValue, name: string = "") {
        this.value = value;
        this.name = name;
    }

    equals(other: StructField) {
        return this.name == other.name && this.value.equals(other.value);
    }
}
