import { equal } from "assert";
import { MyModel } from "./core";

describe("Typescript usage suite", () => {
    it("should be able to execute a test", () => {
        let model = new MyModel()
        equal(43, model.Get());
    });
});
