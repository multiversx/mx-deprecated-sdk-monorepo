import { guardTrue, guardValueIsSet } from "../../utils";
import { CustomType, TypedValue } from "./types";

const SimpleEnumMaxDiscriminant = 256;

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

    getVariantByDiscriminant(discriminant: number): EnumVariantDefinition {
        let result = this.variants.find(e => e.discriminant == discriminant);
        guardValueIsSet("result", result);
        return result!;
    }

    getVariantByName(name: string): EnumVariantDefinition {
        let result = this.variants.find(e => e.name == name);
        guardValueIsSet("result", result);
        return result!;
    }
}

export class EnumVariantDefinition {
    readonly name: string;
    readonly discriminant: number;

    constructor(name: string, discriminant: number) {
        guardTrue(discriminant < SimpleEnumMaxDiscriminant, `discriminant for simple enum should be less than ${SimpleEnumMaxDiscriminant}`);

        this.name = name;
        this.discriminant = discriminant;
    }

    static fromJSON(json: { name: string, discriminant: number }): EnumVariantDefinition {
        return new EnumVariantDefinition(json.name, json.discriminant);
    }
}

export class EnumValue extends TypedValue {
    readonly name: string;
    readonly discriminant: number;

    private constructor(type: EnumType, variant: EnumVariantDefinition) {
        super(type);
        this.name = variant.name;
        this.discriminant = variant.discriminant;
    }

    static fromName(type: EnumType, name: string): EnumValue {
        let variant = type.getVariantByName(name);
        return new EnumValue(type, variant);
    }

    static fromDiscriminant(type: EnumType, discriminant: number): EnumValue {
        let variant = type.getVariantByDiscriminant(discriminant);
        return new EnumValue(type, variant);
    }

    equals(other: EnumValue): boolean {
        if (!this.getType().equals(other.getType())) {
            return false;
        }

        return this.name == other.name && this.discriminant == other.discriminant;
    }

    valueOf() {
        return this.name;
    }
}
