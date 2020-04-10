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
        equal(43, model.Get());
    });
});

describe("Proxy tryout", () => {
    it("should get the balance of an address", () => {

    var account: string = "616fdac6b0d17053d077454ef3d5a563cb25ecdbbc4894a73806c3a39079b82a";
    var url: string = "http://zirconium:7959/address/{account}/balance";

    fetch(url)
        .then(res => res.json())
        .then(json => console.log(json));
    });
});
