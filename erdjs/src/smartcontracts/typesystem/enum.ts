import { CustomType } from "./types";

export class EnumType extends CustomType {
    readonly variants: EnumVariantDefinition[] = [];

    constructor(name: string, variants: EnumVariantDefinition[]) {
        super(name);
        this.variants = variants;
    }

    static fromJSON(json: { name: string, variants: any[] }): EnumType {
        let variants = (json.variants || []).map(variant => EnumVariantDefinition.fromJSON(variant));
        return new EnumType(json.name, variants);
    }
}

export class EnumVariantDefinition {
    readonly name: string;
    readonly discriminant: number;

    constructor(name: string, discriminant: number) {
        this.name = name;
        this.discriminant = discriminant;
    }

    static fromJSON(json: { name: string, discriminant: number }): EnumVariantDefinition {
        return new EnumVariantDefinition(json.name, json.discriminant);
    }
}
