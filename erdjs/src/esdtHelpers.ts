import {ScArgumentsParser} from "./scArgumentsParser";
import {ErrInvalidEsdtTransferDataField} from "./errors";
import BigNumber from "bignumber.js";
import {ESDT_TRANSFER_FUNCTION_NAME, ESDT_TRANSFER_GAS_LIMIT, ESDT_TRANSFER_VALUE} from "./constants";

/**
 * This class exposes static methods that are useful for parsing ESDT transfer transactions
 */
export class EsdtHelpers {

    /**
     * This function will return the token identifier and the amount from a given data field for an ESDT transfer, or
     * an exception if something went wrong
     * @param dataField dataField represents the data filed to extract esdt transfer data from
     * @throws ErrInvalidEsdtTransferDataField this function throws an ErrInvalidEsdtTransferDataField if the provided data field isn't meant to be an ESDT transfer
     * @return {tokenIdentifier, amount} this function function returns a pair of token identifier and amount to transfer
     */
    public static extractFieldsFromEsdtTransferDataField(dataField: string): { tokenIdentifier: string, amount: string } {
        if (!dataField.startsWith(ESDT_TRANSFER_FUNCTION_NAME + "@")) {
            throw new ErrInvalidEsdtTransferDataField();
        }

        let {args} = ScArgumentsParser.parseSmartContractCallDataField(dataField);

        if (args.length != 2) {
            throw new ErrInvalidEsdtTransferDataField();
        }

        let tokenIdentifier = args[0];
        let amount = new BigNumber(args[1], 16).toString(10);

        return {
            tokenIdentifier: tokenIdentifier,
            amount: amount
        };
    }

    /**
     * This function checks if the data field represents a valid ESDT transfer call
     * @param dataField dataField represents the string to be checked if it would trigger an ESDT transfer call
     * @return true if the provided data field is meant to be an ESDT transfer
     */
    public static isEsdtTransferTransaction(dataField: string): Boolean {
        if (!dataField.includes(ESDT_TRANSFER_FUNCTION_NAME, 0)) {
            return false;
        }

        let args: string[];
        try {
            args = ScArgumentsParser.parseSmartContractCallDataField(dataField).args;
        } catch (e) {
            return false;
        }

        return args.length == 2;
    }

    /**
     * getTxFieldsForEsdtTransfer returns the needed value, gasLimit and data field (in string format) for sending an amount of ESDT token
     * @param tokenIdentifier tokenIdentifier represents the identifier of the token to transfer
     * @param amount amount represents the denominated amount of the token to send
     * @return {value, gasLimit, data} this function return the value, the gas limit and the data field to use
     */
    public static getTxFieldsForEsdtTransfer(tokenIdentifier: string, amount: string): { value: string, gasLimit: number, data: string } {
        const encodedAmount = new BigNumber(amount, 10).toString(16);
        const txDataField = [ESDT_TRANSFER_FUNCTION_NAME, tokenIdentifier, encodedAmount].join("@");

        return {
            value: ESDT_TRANSFER_VALUE,
            gasLimit: ESDT_TRANSFER_GAS_LIMIT,
            data: txDataField
        };
    }
}
