import * as fs from "fs";
import axios, { AxiosResponse } from "axios";
import { guardValueIsSet, guardValueIsSetWithMessage } from "../../utils";
import { StructureDefinition, StructureType } from "./structure";
import { ContractInterface } from "./contractInterface";

export class AbiRegistry {
    readonly interfaces: ContractInterface[] = [];
    readonly customTypes: StructureType[] = [];

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
            // TODO: Handle both structures and enums!

            let item = json.types[customTypeName];

            // Workaround: set the "name" field, as required by "fromJSON()" below.
            item.name = customTypeName;
            
            let customTypeDefinition = StructureDefinition.fromJSON(item);
            let customType = new StructureType(customTypeDefinition);
            this.customTypes.push(customType);
        }

        return this;
    }

    findInterface(name: string): ContractInterface {
        let result = this.interfaces.find(e => e.name == name);
        guardValueIsSetWithMessage(`interface [${name}] not found`, result);
        return result!;
    }

    findInterfaces(names: string[]): ContractInterface[] {
        return names.map(name => this.findInterface(name));
    }
    
    findStructure(name: string): StructureType {
        // TODO: with getKind() == struct
        let result = this.customTypes.find(e => e.getName() == name);
        guardValueIsSetWithMessage(`structure [${name}] not found`, result);
        return result!;
    }

    findStructures(names: string[]): StructureType[] {
        return names.map(name => this.findStructure(name));
    }  

    // TODO:
    // findEnum()
    // findEnums()
}
