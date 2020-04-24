import { describe } from "mocha"
import { World } from "./world"
import { loadContractCode } from "./testing"
import assert = require("assert");

describe.only("test world", () => {
    it("should create account", async () => {
        let world = new World("foo");
        let result = await world.createAccount({ address: "alice", nonce: 42 });
        assert.equal(result.Account?.Nonce, 42);
    });

    it("should interact well with contract [counter]", async () => {
        let code = loadContractCode("../examples/contracts/mycounter/counter.wasm");
        let world = new World("foo");
        let createAccountResponse = await world.createAccount({ address: "alice", nonce: 42 });
        let deployResponse = await world.deployContract({ impersonated: "alice", code: code });
        let runResponse = await world.runContract({ impersonated: "alice", contract: "contract4100000000000000000alice", functionName: "foo" });
        assert.equal(createAccountResponse.Account?.Nonce, 42);
    });
});
