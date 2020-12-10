import * as fs from "fs";
import axios, { AxiosResponse } from "axios";
import { guardValueIsSet } from "../../utils";
import { Namespace } from "./namespace";
import { StructureDefinition, StructureType } from "./structure";
import { Endpoint } from "./endpoint";

const NamespacedExtension = ".namespaced.json";
const DefaultNamespace = "default";

/**
 * Contract ABIs aren't yet fully implemented. This is just a prototype.
 * A future release of `erdjs` will handle ABIs properly.
 */
export class AbiRegistry {
    readonly namespaces: Namespace[] = [];

    async extendFromFile(file: string): Promise<void> {
        let jsonContent: string = await fs.promises.readFile(file, { encoding: "utf8" });
        let json = JSON.parse(jsonContent);
        
        AbiRegistry.isNamespaced(file) ? this.extendNamespaced(json) : this.extend(json);
    }

    private static isNamespaced(urlOrFile: string): boolean {
        return urlOrFile.endsWith(NamespacedExtension);
    }

    async extendFromUrl(url: string): Promise<void> {
        let response: AxiosResponse<ArrayBuffer> = await axios.get(url);
        let json = response.data;
        AbiRegistry.isNamespaced(url) ? this.extendNamespaced(json) : this.extend(json);
    }

    extend(json: any) {
        let defaultNamespace = this.getDefaultNamespace();
        let endpoint = Endpoint.fromJSON(json);
        let structures = (<any[]>(json.structures || [])).map(item => StructureDefinition.fromJSON(item));
        
        defaultNamespace.endpoints.push(endpoint);

        for (const definition of structures) {
            defaultNamespace.structures.push(definition);

            new StructureType(definition);
        }
    }

    extendNamespaced(json: any) {
        for (let item of json || []) {
            let namespace = Namespace.fromJSON(item);
            this.namespaces.push(namespace);

            for (const definition of namespace.structures) {
                new StructureType(definition);
            }
        }
    }

    getDefaultNamespace(): Namespace {
        let defaultNamespace = this.namespaces.find(e => e.namespace == DefaultNamespace);

        if (!defaultNamespace) {
            defaultNamespace = new Namespace(DefaultNamespace, [], []);
            this.namespaces.push(defaultNamespace);
        }

        return defaultNamespace;
    }

    findNamespace(namespace: string): Namespace {
        let result = this.namespaces.find(e => e.namespace == namespace);
        guardValueIsSet("result", result);
        return result!;
    }
}
