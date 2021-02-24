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
        let formalArguments = definition.input;
        let actualArguments = interaction.getArguments();
        let numFormalArguments = formalArguments.length;
        let numActualArguments = actualArguments.length;

        if (numFormalArguments != numActualArguments) {
            throw new errors.ErrContractInteraction(`bad arguments, expected: ${numFormalArguments}, got: ${numActualArguments}`);
        }

        for (let i = 0; i < numFormalArguments; i++) {
            let type = formalArguments[i].type;
            let arg = actualArguments[i];

            // TODO: detect type mismatch.
            // throw new errors.ErrContractInteraction(`type mismatch at index ${i}`);
        }
    }
}
