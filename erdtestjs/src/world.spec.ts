import { describe } from "mocha";
import { StorageValue, World } from "./world";
import { assert } from "chai";
import { Address, Nonce, Code, GasLimit, ContractFunction } from "@elrondnetwork/erdjs";

describe("test world", () => {
    let aliceBech32 = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz";
    let bobBech32 = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r";
    let alice = new Address(aliceBech32);
    let bob = new Address(bobBech32);

    it("should create account", async () => {
        let world = new World("foo");
        let result = await world.createAccount({ address: alice, nonce: new Nonce(42) });
        assert.equal(result.account.nonce.value, 42);
        assert.equal(result.account.balance.raw(), "0");
        assert.equal(result.account.address.bech32(), aliceBech32);
    });

    it("should interact well with the [counter]", async () => {
        let world = new World("foo");
        await world.createAccount({ address: alice, nonce: new Nonce(42) });
        await world.createAccount({ address: bob, nonce: new Nonce(7) });

        let contract = new CounterContract(world);
        await contract.deploy(alice, new GasLimit(500000));
        assert.equal(await contract.get(alice, new GasLimit(500000)), 1);

        await contract.increment(alice, new GasLimit(500000));
        assert.equal(await contract.get(alice, new GasLimit(500000)), 2);

        await contract.increment(bob, new GasLimit(500000));
        assert.equal(await contract.get(alice, new GasLimit(500000)), 3);

        let entry = contract.getStorageEntry("COUNTER");
        assert.equal(entry!.asNumber(), 3);
    });

    it("should be able to increment and decrement the [counter]", async () => {
        let world = new World("foo");
        await world.createAccount({ address: alice, nonce: new Nonce(42) });

        let contract = new CounterContract(world);
        await contract.deploy(alice, new GasLimit(500000));

        for (let i = 0; i < 10; i++) {
            await contract.increment(alice, new GasLimit(500000));
        }

        for (let i = 0; i < 5; i++) {
            await contract.decrement(alice, new GasLimit(500000));
        }

        assert.equal(await contract.get(alice, new GasLimit(500000)), 6);
    });
});

class CounterContract {
    private readonly world: World;
    private readonly code: Code;
    private address: Address = new Address();

    constructor(world: World) {
        this.world = world;
        this.code = Code.fromFile("./src/testdata/counter.wasm");
    }

    async deploy(caller: Address, gasLimit: GasLimit): Promise<void> {
        let response = await this.world.deployContract({ impersonated: caller, code: this.code, gasLimit: gasLimit });
        response.throwIfError();
        
        this.address = response.getContractAddress();
    }
    
    async increment(caller: Address, gasLimit: GasLimit): Promise<void> {
        let response = await this.world.runContract({
            contract: this.address,
            impersonated: caller,
            func: new ContractFunction("increment"),
            gasLimit: gasLimit
        });

        response.throwIfError();
    }

    async decrement(caller: Address, gasLimit: GasLimit): Promise<void> {
        let response = await this.world.runContract({
            contract: this.address,
            impersonated: caller,
            func: new ContractFunction("decrement"),
            gasLimit: gasLimit
        });

        response.throwIfError();
    }

    async get(caller: Address, gasLimit: GasLimit): Promise<number> {
        let response = await this.world.queryContract({
            contract: this.address,
            impersonated: caller,
            func: new ContractFunction("get"),
            gasLimit: gasLimit
        });

        return response.firstResult().asNumber;
    }

    getStorageEntry(key: string): StorageValue | null {
        let storage = this.world.getAccountStorage(this.address);
        let value = storage!.byString(key);
        return value;
    }
}