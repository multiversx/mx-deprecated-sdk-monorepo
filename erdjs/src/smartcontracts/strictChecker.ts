import * as errors from "../errors";
import { EndpointDefinition } from "./typesystem";
import { Interaction } from "./interaction";
import { IInteractionChecker } from "./interface";

/**
 * An interaction checker that aims to be as strict as possible.
 * It is designed to catch programmer errors such as:
 *  - incorrect types of contract call arguments
 *  - errors related to calling "non-payable" functions with some value provided
 *  - gas estimation errors (not yet implemented)
 */
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
            throw new errors.ErrContractInteraction("cannot send EGLD value to non-payable");
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
            let expectedType = formalArguments[i].type;
            let argument = actualArguments[i];
            let actualType = argument.getType();
            // isAssignableFrom() is responsible to handle covariance and contravariance (depending on the class that overrides it).
            let ok = expectedType.isAssignableFrom(actualType);
            
            if (!ok) {
                throw new errors.ErrContractInteraction(`type mismatch at index ${i}, expected: ${expectedType}, got: ${actualType}`);
            }
        }
    }
}
