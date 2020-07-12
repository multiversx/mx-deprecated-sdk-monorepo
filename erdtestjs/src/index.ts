import { readBinaryFileAsHex } from "./ioutils";

export * from "./world";
export * from "./arwen";

export function loadContractCode(filePath: string) {
    return readBinaryFileAsHex(filePath);
}
