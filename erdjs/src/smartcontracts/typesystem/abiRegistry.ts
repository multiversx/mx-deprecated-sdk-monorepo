import * as fs from "fs";
import * as errors from "../../errors";
import axios, { AxiosResponse } from "axios";
import { guardValueIsSetWithMessage } from "../../utils";
import { StructType } from "./struct";
import { ContractInterface } from "./contractInterface";
import { CustomType } from "./types";
import { EnumType } from "./enum";

export class AbiRegistry {
    readonly interfaces: ContractInterface[] = [];
    readonly customTypes: CustomType[] = [];

    async extendFromFile(file: string): Promise<AbiRegistry> {
        let jsonContent: string = await fs.promises.readFile(file, { encoding: "utf8" });
        let json = JSON.parse(jsonContent);
        
        return this.extend(json);
    }

    async extendFromUrl(url: string): Promise<AbiRegistry> {
        let response: AxiosResponse = await axios.get(url);
        let json = response.data;
        return this.extend(json);
    }

    extend(json: { name: string, endpoints: any[], types: any[] }): AbiRegistry {
        json.types = json.types || {};

        // The "endpoints" collection is interpreted by "ContractInterface".
        let iface = ContractInterface.fromJSON(json);
        this.interfaces.push(iface);

        for (const customTypeName in json.types) {
            let itemJson = json.types[customTypeName];
            let typeDiscriminant = itemJson.type;

            // Workaround: set the "name" field, as required by "fromJSON()" below.
            itemJson.name = customTypeName;

            let customType = this.createCustomType(typeDiscriminant, itemJson);
            this.customTypes.push(customType);
        }

        return this;
    }

    private createCustomType(typeDiscriminant: string, json: any): CustomType {
        if (typeDiscriminant == "struct") {
            return StructType.fromJSON(json);
        }
        if (typeDiscriminant == "enum") {
            return EnumType.fromJSON(json);
        }

        throw new errors.ErrTypingSystem(`Unknown type discriminant: ${typeDiscriminant}`);
    }

    findInterface(name: string): ContractInterface {
        let result = this.interfaces.find(e => e.name == name);
        guardValueIsSetWithMessage(`interface [${name}] not found`, result);
        return result!;
    }

    findInterfaces(names: string[]): ContractInterface[] {
        return names.map(name => this.findInterface(name));
    }
    
    findStructure(name: string): StructType {
        let result = this.customTypes.find(e => e.getName() == name && e instanceof StructType);
        guardValueIsSetWithMessage(`structure [${name}] not found`, result);
        return <StructType>result!;
    }

    findStructures(names: string[]): StructType[] {
        return names.map(name => this.findStructure(name));
    }  

    findEnum(name: string): EnumType {
        let result = this.customTypes.find(e => e.getName() == name && e instanceof EnumType);
        guardValueIsSetWithMessage(`enum [${name}] not found`, result);
        return <EnumType>result!;
    }

    findEnums(names: string[]): EnumType[] {
        return names.map(name => this.findEnum(name));
    }  
}
