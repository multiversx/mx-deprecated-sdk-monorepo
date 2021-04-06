import * as errors from "../../errors";
import { Struct, StructField, StructFieldDefinition } from ".";
import { Type, CustomType, TypedValue } from "./types";
import { StructType } from "./struct";

export class TupleType extends CustomType {
    readonly fields: StructFieldDefinition[] = [];

    constructor(name: string, fields: StructFieldDefinition[]) {
        super(name);
        this.fields = fields;
    }

    static fromJSON(json: { name: string; fields: any[] }): TupleType {
        let fields = (json.fields || []).map((field) => StructFieldDefinition.fromJSON(field));
        return new TupleType(json.name, fields);
    }
}
export class Tuple extends Struct {
    /**
     * Currently, one can only set fields at initialization time. Construction will be improved at a later time.
     */
    constructor(type: TupleType, fields: StructField[]) {
        super(type, fields);
    }
}
