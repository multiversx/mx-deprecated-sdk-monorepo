import * as fs from "fs";
import axios, { AxiosResponse } from "axios";
import { guardValueIsSet } from "../../utils";
import { StructureDefinition, StructureType } from "./structure";
import { ContractInterface } from "./contractInterface";

export class AbiRegistry {
    readonly interfaces: ContractInterface[] = [];
    readonly structures: StructureType[] = [];

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

    extend(json: { name: string, endpoints: any[], structures: any[] }): AbiRegistry {
        // The "endpoints" collection is interpreted by "ContractInterface".
        let iface = ContractInterface.fromJSON(json);
        this.interfaces.push(iface);

        for (const item of json.structures) {
            let structureDefinition = StructureDefinition.fromJSON(item);
            let structureType = new StructureType(structureDefinition);
            this.structures.push(structureType);
        }

        return this;
    }

    findInterface(name: string): ContractInterface {
        let result = this.interfaces.find(e => e.name == name);
        guardValueIsSet("result", result);
        return result!;
    }

    findInterfaces(names: string[]): ContractInterface[] {
        return names.map(name => this.findInterface(name));
    }
    
    findStructure(name: string): StructureType {
        let result = this.structures.find(e => e.getName() == name);
        guardValueIsSet("result", result);
        return result!;
    }

    findStructures(names: string[]): StructureType[] {
        return names.map(name => this.findStructure(name));
    }  
}
