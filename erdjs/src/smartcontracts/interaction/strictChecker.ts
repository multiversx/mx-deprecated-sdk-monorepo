import * as errors from "../../errors";
import { SmartContractAbi } from "../abi";
import { EndpointDefinition } from "../typesystem";
import { IInteractionChecker } from "./interface";
import { PreparedInteraction } from "./preparedInteraction";

export class StrictChecker implements IInteractionChecker {
    private readonly abi: SmartContractAbi;

    constructor(abi: SmartContractAbi) {
        this.abi = abi;
    }

    checkInteraction(interaction: PreparedInteraction): void {
        let name = interaction.func.name;
        let definition = this.abi.findEndpoint(name);

        this.checkPayable(interaction, definition);
        this.checkArguments(interaction, definition);
    }

    private checkPayable(interaction: PreparedInteraction, definition: EndpointDefinition) {
        let hasValue = interaction.transaction.value.isSet();
        let isPayableInEGLD = definition.modifiers.isPayableInEGLD();

        if (hasValue && !isPayableInEGLD) {
            throw new errors.ErrContractInteraction("cannot send eGLD value to non-payable");
        }
    }

    private checkArguments(interaction: PreparedInteraction, definition: EndpointDefinition) {
        let numFormalArguments = definition.input.length;
        let numActualArguments = interaction.query.args;

        for (const parameterDefinition of definition.input) {
            let typeDescriptor = parameterDefinition.getTypeDescriptor();
        }
    }
}
