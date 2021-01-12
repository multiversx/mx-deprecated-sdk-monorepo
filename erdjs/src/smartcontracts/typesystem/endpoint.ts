import { TypeExpressionParser } from "./typeExpressionParser";
import { BetterType } from "./types";

export class EndpointDefinition {
    readonly name: string;
    readonly input: EndpointParameterDefinition[] = [];
    readonly output: EndpointParameterDefinition[] = [];
    readonly modifiers: EndpointModifiers;

    constructor(name: string, input: EndpointParameterDefinition[], output: EndpointParameterDefinition[], modifiers: EndpointModifiers) {
        this.name = name;
        this.input = input || [];
        this.output = output || [];
        this.modifiers = modifiers;
    }

    static fromJSON(json: {
        name: string,
        storageModifier: string,
        payableInTokens: string[],
        input: any[],
        output: []
    }): EndpointDefinition {
        let input = json.input.map(param => EndpointParameterDefinition.fromJSON(param));
        let output = json.output.map(param => EndpointParameterDefinition.fromJSON(param));
        let modifiers = new EndpointModifiers(json.storageModifier, json.payableInTokens);

        return new EndpointDefinition(json.name, input, output, modifiers);
    }
}

export class EndpointModifiers {
    readonly storageModifier: string;
    readonly payableInTokens: string[];

    constructor(storageModifier: string, payableInTokens: string[]) {
        this.storageModifier = storageModifier || "";
        this.payableInTokens = payableInTokens || [];
    }

    isPayableInEGLD(): boolean {
        return this.isPayableInToken("eGLD");
    }

    isPayableInToken(token: string) {
        if (this.payableInTokens.includes(token)) {
            return true;
        }

        if (this.payableInTokens.includes(`!${token}`)) {
            return false;
        }

        if (this.payableInTokens.includes("*")) {
            return true;
        }

        return false;
    }

    isReadonly() {
        return this.storageModifier == "readonly";
    }
}

export class EndpointParameterDefinition {
    readonly name: string;
    readonly description: string;
    readonly type: BetterType;

    constructor(name: string, description: string, type: BetterType) {
        this.name = name;
        this.description = description;
        this.type = type;
    }

    static fromJSON(json: { name: string, description: string, type: string }): EndpointParameterDefinition {
        let parsedType = new TypeExpressionParser().parse(json.type);
        return new EndpointParameterDefinition(json.name, json.description, parsedType);
    }
}
