import { describe } from "mocha"
import { World } from "./world"
import { loadContractCode } from "./testing"
import { assert } from "chai";

describe.only("test world", () => {
    it("should create account", async () => {
        let world = new World("foo");
        let result = await world.createAccount({ address: "alice", nonce: 42 });
        assert.equal(result.Account?.Nonce, 42);
    });

    it.only("should interact well with contract [counter]", async () => {
        let code = loadContractCode("../examples/contracts/mycounter/counter.wasm");
        let world = new World("foo");
        await world.createAccount({ address: "alice", nonce: 42 });
        await world.createAccount({ address: "bob", nonce: 7 });

        let deployResponse = await world.deployContract({ impersonated: "alice", code: code });
        let contract = deployResponse.ContractAddress;
        
        let runResponse = await world.runContract({ impersonated: "alice", contract: contract, functionName: "increment" });
        assert.isTrue(runResponse.isSuccess())
        runResponse = await world.runContract({ impersonated: "bob", contract: contract, functionName: "increment" });
        assert.isTrue(runResponse.isSuccess())
    });
});
