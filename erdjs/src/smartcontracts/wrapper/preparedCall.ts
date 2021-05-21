import { Address, Balance } from "../..";
import { FormattedCall } from "./formattedCall";

/**
 * Keeps track of part of the context necessary for making a call to a smart contract method.
 */
export class PreparedCall {
    // Usually the address of the called smart contract, although not always (eg. it may be the system contract address for any ESDTNFTTransfer)
    receiver: Address;

    // The EGLD amount to be transfered (if any)
    egldValue: Balance;

    // The function or method to be called and its arguments
    // Note: May contain NFT transfers on top of the usual smart contract method call
    formattedCall: FormattedCall;

    constructor(receiver: Address, egldValue: Balance, formattedCall: FormattedCall) {
        this.receiver = receiver;
        this.egldValue = egldValue;
        this.formattedCall = formattedCall;
    }
}
