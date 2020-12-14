import * as errors from "../../errors";
import { SmartContractAbi } from "../abi";
import { EndpointDefinition } from "../typesystem";
import { Interaction } from "./interaction";
import { IInteractionChecker } from "./interface";

export class StrictChecker implements IInteractionChecker {
    private readonly abi: SmartContractAbi;

    constructor(abi: SmartContractAbi) {
        this.abi = abi;
    }

    checkInteraction(interaction: Interaction): void {
        let name = interaction.getFunction().name;
        let definition = this.abi.findEndpoint(name);

        this.checkPayable(interaction, definition);
        this.checkArguments(interaction, definition);
    }

    private checkPayable(interaction: Interaction, definition: EndpointDefinition) {
        let hasValue = interaction.getValue().isSet();
        let isPayableInEGLD = definition.modifiers.isPayableInEGLD();

        if (hasValue && !isPayableInEGLD) {
            throw new errors.ErrContractInteraction("cannot send eGLD value to non-payable");
        }
    }

    private checkArguments(interaction: Interaction, definition: EndpointDefinition) {
        let numFormalArguments = definition.input.length;
        let numActualArguments = interaction.getArguments();

        for (const parameterDefinition of definition.input) {
            let typeDescriptor = parameterDefinition.getTypeDescriptor();
        }
    }
}
