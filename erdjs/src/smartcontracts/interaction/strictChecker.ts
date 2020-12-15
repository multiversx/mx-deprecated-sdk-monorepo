import * as errors from "../../errors";
import { EndpointDefinition } from "../typesystem";
import { Interaction } from "./interaction";
import { IInteractionChecker } from "./interface";

export class StrictChecker implements IInteractionChecker {
    checkInteraction(interaction: Interaction): void {
        let definition = interaction.getEndpointDefinition();

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
