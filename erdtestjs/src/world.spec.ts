import { describe } from "mocha";
import { World } from "./world";
import { loadContractCode } from "./index";
import { assert } from "chai";
import { Address } from "@elrondnetwork/erdjs";

describe("test world", () => {
    let aliceBech32 = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz";
    let bobBech32 = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r";
    let alice = new Address(aliceBech32);
    let bob = new Address(bobBech32);
    let GAS_LIMIT = 500000;

    it("should create account", async () => {
        let world = new World("foo");
        let result = await world.createAccount({ address: alice, nonce: 42 });
        assert.equal(result.Account?.Nonce, 42);
    });

    it("should interact well with contract [counter]", async () => {
        let code = loadContractCode("../examples/contracts/mycounter/counter.wasm");
        let world = new World("foo");
        await world.createAccount({ address: alice, nonce: 42 });
        await world.createAccount({ address: bob, nonce: 7 });

        let deployResponse = await world.deployContract({ impersonated: alice, code: code, gasLimit: GAS_LIMIT });
        let contract = deployResponse.ContractAddressHex;

        let runResponse = await world.runContract({ contract: contract, impersonated: alice, functionName: "increment", gasLimit: GAS_LIMIT });
        assert.isTrue(runResponse.isSuccess());
        runResponse = await world.runContract({ contract: contract, impersonated: bob, functionName: "increment", gasLimit: GAS_LIMIT });
        assert.isTrue(runResponse.isSuccess());

        let queryResponse = await world.queryContract({ contract: contract, impersonated: alice, functionName: "get", gasLimit: GAS_LIMIT });
        assert.equal(queryResponse.firstResult().asNumber, 2);
    });
});
