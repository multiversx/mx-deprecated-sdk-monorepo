import { equal } from "assert";
import { MyModel } from "./core";

import fetch, {
    Blob,
    Headers,
    Request,
    RequestInit,
    RequestInfo,
    Response,
    FetchError
} from "node-fetch";

describe("Typescript usage suite", () => {
    it("should be able to execute a test", () => {
        let model = new MyModel()
        equal(42, model.Get());
    });
});

describe("Proxy try-out", () => {
    it("should get the balance of an address", () => {
        let address: string = "14dcb8b9aaa0069fc600f08938a130ebba4a9b691dfbd6775bd59cbd052c94ca";
        console.log(address);

        let url: string = `http://zirconium:7950/address/${address}/balance`;
        fetchWithTimeout(url, 1000)
            .then((response: Response) => response.json())
            .then((json: string) => console.log(json))
            .catch((err: Error) => console.log(err));
    });
});

function stringToHex(str: string): string {
    const chars = [...str];
    return chars.map(chr => chr.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

function bytesToHex(bytes: Array<number>): string {
    return bytes.map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function fetchWithTimeout(resource: RequestInfo, timeout: number, init?: RequestInit): Promise<Response> {
    return new Promise<Response>((resolve, reject) => {
        const timeoutID = setTimeout(
            () => reject(new Error('Request timed out')),
            timeout
        );

        fetch(resource)
            .then(
                (response: Response) =>  resolve(response),
                (err: Error) => reject(err)
            )
            .finally(() => clearTimeout(timeoutID));
    });
}
