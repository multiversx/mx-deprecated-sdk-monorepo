import { SmartContractAbi } from "../abi";
import { loadESDTAbi } from "./esdt";
import { formatEndpoint, FormattedCall } from "./formattedCall";
import { generateMethods, Methods } from "./generateMethods";

/**
 * ABI-based interface where a method wraps its arguments in a FormattedCall instance.
 */
export type AbiFormatter = Methods<FormattedCall>;

export function createAbiFormatter(abi: SmartContractAbi): AbiFormatter {
    return generateMethods(null, abi, formatEndpoint)
}

export async function loadESDTAbiFormatter(): Promise<AbiFormatter> {
    return createAbiFormatter(await loadESDTAbi());
}
