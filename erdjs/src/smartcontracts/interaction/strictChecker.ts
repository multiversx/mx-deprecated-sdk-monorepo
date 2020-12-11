import { SmartContractAbi } from "../abi";
import { IInteractionChecker } from "./interface";
import { PreparedInteraction } from "./preparedInteraction";

export class StrictChecker implements IInteractionChecker {
    private readonly abi: SmartContractAbi;

    constructor(abi: SmartContractAbi) {
        this.abi = abi;
    }

    checkInteraction(interaction: PreparedInteraction): void {
        let functionName = interaction.func.name;
        let functionDefinition = this.abi.findFunction(functionName);
    }
}
