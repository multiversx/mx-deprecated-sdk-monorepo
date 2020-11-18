import { PrimitiveType } from "./types";

/**
 * Contract ABIs aren't yet implemented. A future release of `erdjs` will handle ABIs as well.
 */
export class Abi {   
    readonly structs: StructDefinition[] = [];

    // registerStructure(populatedPrototype: any) {
    //     let structureDefinition = new StructDefinition();
    //     let fieldNames = Object.getOwnPropertyDescriptors(populatedPrototype);
        
    //     fieldNames.forEach(fieldName => {
    //         let value = populatedPrototype[fieldName];

    //     });
    // }
}

export class StructDefinition {
    private readonly fields: StructFieldDefinition[] = [];

    constructor() {
    }

    addField(name: string, type: PrimitiveType, isVector: boolean = false) {
        let field = new StructFieldDefinition(name, type, isVector);
        this.fields.push(field);
    }

    getFields(): ReadonlyArray<StructFieldDefinition> {
        return this.fields;
    }
}

export class StructFieldDefinition {
    readonly name: string;
    readonly type: PrimitiveType;
    readonly asArray: boolean;


    constructor(name: string, type: PrimitiveType, asArray: boolean) {
        this.name = name;
        this.type = type;
        this.asArray = asArray;
    }
}

