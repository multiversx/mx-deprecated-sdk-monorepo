import { equal } from "assert";
import { MyModel } from "./core";

import fetch, {
    Blob,
    Headers,
    Request,
    RequestInit,
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

        let addressHex: string = stringToHex(address);
        console.log(addressHex);

        let url: string = `http://zirconium:7950/address/${address}/balance`;
        fetch(url)
            .then(res => res.json())
            .then(json => console.log(json));
    });
});

function stringToHex(str: string): string {
    const chars = [...str];
    return chars.map(chr => chr.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

function bytesToHex(bytes: Array<number>): string {
    return bytes.map(byte => byte.toString(16).padStart(2, "0")).join("");
}
