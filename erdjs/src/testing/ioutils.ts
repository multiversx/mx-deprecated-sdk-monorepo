import fs = require("fs");
import { MyError } from "./errors"

export function readJSONFile<T>(ctor: new () => T, filePath: string): T {
    let text = readTextFile(filePath);
    let plainObject = JSON.parse(text);
    let result = new ctor();
    Object.assign(result, plainObject);
    return result;
}

export function readTextFile(filePath: string): string {
    guardFileExists(filePath);
    return fs.readFileSync(filePath, { encoding: "utf8" });
}

function guardFileExists(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new MyError({ message: `Missing file: ${filePath}` });
    }
}

export function readBinaryFileAsHex(filePath: string): string {
    let buffer = readBinaryFile(filePath);
    let hex = buffer.toString("hex");
    return hex;
}

export function readBinaryFile(filePath: string): Buffer {
    guardFileExists(filePath);
    return fs.readFileSync(filePath);
}
