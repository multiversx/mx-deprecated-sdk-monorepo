import { readBinaryFileAsHex } from "./ioutils"

export function loadContractCode(filePath: string) {
    return readBinaryFileAsHex(filePath);
}
