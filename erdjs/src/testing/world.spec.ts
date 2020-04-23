import { describe } from "mocha"
import { World } from "./world"
import assert = require("assert");

describe.only("test world", () => {
    it("should create account", async () => {
        let world = new World("foo");
        let result = await world.createAccount("alice", "100", 42);
        assert.equal(result.Account?.Nonce, 42);
    });
});
