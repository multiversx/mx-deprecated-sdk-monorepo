import { describe } from "mocha";
import { World } from "./world";
import { assert } from "chai";
import { Address, Nonce, Code, GasLimit, ContractFunction } from "@elrondnetwork/erdjs";

describe("test world", () => {
    let aliceBech32 = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz";
    let bobBech32 = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r";
    let alice = new Address(aliceBech32);
    let bob = new Address(bobBech32);
    let gasLimit = new GasLimit(500000);

    it("should create account", async () => {
        let world = new World("foo");
        let result = await world.createAccount({ address: alice, nonce: new Nonce(42) });
        assert.equal(result.account.nonce.value, 42);
        assert.equal(result.account.balance.raw(), "0");
        assert.equal(result.account.address.bech32(), aliceBech32);
    });

    it("should interact well with contract [counter]", async () => {
        let code = Code.fromFile("./src/testdata/counter.wasm");
        let world = new World("foo");
        await world.createAccount({ address: alice, nonce: new Nonce(42) });
        await world.createAccount({ address: bob, nonce: new Nonce(7) });

        let deployResponse = await world.deployContract({ impersonated: alice, code: code, gasLimit: gasLimit });
        let contract = deployResponse.getContractAddress();
        assert.equal(await getCounterValue(), 1);

        let runResponse = await world.runContract({ contract: contract, impersonated: alice, func: new ContractFunction("increment"), gasLimit: gasLimit });
        assert.isTrue(runResponse.isSuccess());
        assert.equal(await getCounterValue(), 2);

        runResponse = await world.runContract({ contract: contract, impersonated: bob, func: new ContractFunction("increment"), gasLimit: gasLimit });
        assert.isTrue(runResponse.isSuccess());
        assert.equal(await getCounterValue(), 3);

        let storage = world.getAccountStorage(contract);
        let value = storage?.byString("COUNTER");
        assert.equal(value?.asNumber(), 3);

        async function getCounterValue(): Promise<number> {
            let getResponse = await world.queryContract({ contract: contract, impersonated: alice, func: new ContractFunction("get"), gasLimit: gasLimit });
            return getResponse.firstResult().asNumber;
        }
    });
});
