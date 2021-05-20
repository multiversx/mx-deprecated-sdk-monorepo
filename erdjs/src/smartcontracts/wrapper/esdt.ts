import path from "path";
import { SmartContractAbi } from "../abi";

export async function loadESDTAbi(): Promise<SmartContractAbi> {
    let esdtAbiPath = path.join(__dirname, "..", "..", "..", "..", "abi", "esdt.abi.json");
    return await SmartContractAbi.loadSingleAbi(esdtAbiPath);
}
