import { Address, Balance } from "../..";
import { FormattedCall } from "./formattedCall";

/**
 * Keeps track of part of the context necessary for making a call to a smart contract method.
 */
export class PreparedCall {
    // Usually the address of the called smart contract, however, it sometimes may be the system contract address (eg. for ESDTNFTTransfer)
    destination: Address;

    // The EGLD amount to be transfered (if any)
    egldValue: Balance;

    // The function or method to be called and its arguments
    // Note: May contain NFT transfers on top of the usual smart contract method call
    formattedCall: FormattedCall;

    constructor(destination: Address, egldValue: Balance, formattedCall: FormattedCall) {
        this.destination = destination;
        this.egldValue = egldValue;
        this.formattedCall = formattedCall;
    }
}
