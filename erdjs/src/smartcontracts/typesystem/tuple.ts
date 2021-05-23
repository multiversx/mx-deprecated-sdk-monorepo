import * as errors from "../../errors";
import { Struct, StructField, StructFieldDefinition } from "./struct";
import { Type, TypedValue } from "./types";
import { StructType } from "./struct";

export class TupleType extends StructType {
    constructor(...typeParameters: Type[]) {
        super(TupleType.prepareName(typeParameters), TupleType.prepareFieldDefinitions(typeParameters));
    }

    private static prepareName(typeParameters: Type[]): string {
        let fields: string = typeParameters.map(type => type.toString()).join(", ");
        let result = `tuple${fields.length}<${fields}>`;
        return result;
    }

    private static prepareFieldDefinitions(typeParameters: Type[]): StructFieldDefinition[] {
        let result = typeParameters.map((type, i) => new StructFieldDefinition(prepareFieldName(i), "anonymous tuple field", type));
        return result;
    }
}

function prepareFieldName(fieldIndex: number) {
    return `field${fieldIndex}`;
}

// TODO: Perhaps add a common base class for Struct and Tuple, called FieldsHolder?
// Or let Tuple be the base class, but have Struct as a specialization of it, "named tuple"?
// Or leave as it is?
export class Tuple extends Struct {
    constructor(type: TupleType, fields: StructField[]) {
        super(type, fields);
    }

    static fromItems(items: TypedValue[]): Tuple {
        if (items.length < 1) {
            // TODO: Define a better error.
            throw new errors.ErrTypingSystem("bad tuple items");
        }
        
        let fieldsTypes = items.map(item => item.getType());
        let tupleType = new TupleType(...fieldsTypes);
        let fields = items.map((item, i) => new StructField(item, prepareFieldName(i)));
        
        return new Tuple(tupleType, fields);
    }
}
