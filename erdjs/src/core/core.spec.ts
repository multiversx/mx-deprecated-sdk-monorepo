import { equal } from "assert";
import { fetchWithTimeout } from "./core";
import { Response } from "node-fetch";

describe("Proxy try-out", () => {
    it("should get the balance of an address", () => {
        let address: string = "18df0234a57bf1ce145eb7f4924b065643de7e9adb5895651abf0b83295930f1";
        console.log(address);

        let url: string = `http://zirconium:7950/address/${address}`;
        fetchWithTimeout(url, 1000)
            .then((response: Response) => response.json())
            .then((json: string) => console.log(json))
            .catch((err: Error) => console.log(err));
    });
});
