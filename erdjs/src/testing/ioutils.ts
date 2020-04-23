import fs = require("fs");
import { MyError } from "./errors"

export function readTextFile(filePath: string) {
    if (!fs.existsSync(filePath)) {
        throw new MyError({ message: `Missing file: ${filePath}` });
    }

    let text: string = fs.readFileSync(filePath, { encoding: "utf8" });
    return text;
}

export function readJSONFile<T>(ctor: new () => T, filePath: string): T {
    let text = readTextFile(filePath);
    let plainObject = JSON.parse(text);
    let result = new ctor();
    Object.assign(result, plainObject);
    return result;
}
