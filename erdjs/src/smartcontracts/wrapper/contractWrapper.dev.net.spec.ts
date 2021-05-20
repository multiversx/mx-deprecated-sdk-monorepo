import { getLocalTestnetProvider, loadAndSyncTestWallets, TestWallet } from "../../testutils";
import { assert } from "chai";
import { Balance } from "../../balance";
import BigNumber from "bignumber.js";
import { ContractWrapper } from "./contractWrapper";


describe("test smart contract interactor", function () {
    let provider = getLocalTestnetProvider();
    let alice: TestWallet;

    before(async function () {
        ({ alice } = await loadAndSyncTestWallets(provider));
    });

    it("should interact with 'answer' (local testnet)", async function () {
        // Currently, this has to be called before creating any Interaction objects, 
        // because the Transaction objects created under the hood point to the "default" NetworkConfig.
        this.timeout(60000);

        let answer = await ContractWrapper.loadAbi(provider, "src/testdata/answer.abi.json", "src/testdata/answer.wasm");

        await answer.sender(alice).gas(3_000_000).deploy();

        // Query
        let queryResponse = await answer.query.getUltimateAnswer();
        assert.deepEqual(queryResponse, new BigNumber(42));

        // Call
        let callResponse = await answer.getUltimateAnswer();
        assert.deepEqual(callResponse, new BigNumber(42));
    });

    it("should interact with 'counter' (local testnet)", async function () {
        this.timeout(120000);

        let counter = await ContractWrapper.loadAbi(provider, "src/testdata/counter.abi.json", "src/testdata/counter.wasm");

        await counter.sender(alice).gas(3_000_000);
        await counter.deploy();
        assert.deepEqual(await counter.query.get(), new BigNumber(1));
        assert.deepEqual(await counter.increment(), new BigNumber(2));
        assert.deepEqual(await counter.decrement(), new BigNumber(1));
        assert.deepEqual(await counter.decrement(), new BigNumber(0));
    });

    it("should interact with 'lottery_egld' (local testnet)", async function () {
        this.timeout(120000);

        let lottery = await ContractWrapper.loadAbi(provider, "src/testdata/lottery_egld.abi.json", "src/testdata/lottery_egld.wasm");

        await lottery.sender(alice).gas(100_000_000).deploy();

        lottery.gas(15_000_000);
        await lottery.start("lucky", Balance.egld(1), null, null, 1, null, null);

        let status = await lottery.status("lucky");
        assert.equal(status.valueOf(), "Running");

        let info = await lottery.lotteryInfo("lucky");
        // Ignore "deadline" field in our test
        delete info.deadline;

        assert.deepEqual(info, {
            ticket_price: new BigNumber("1000000000000000000"),
            tickets_left: new BigNumber(800),
            max_entries_per_user: new BigNumber(1),
            prize_distribution: Buffer.from([0x64]),
            whitelist: [],
            current_ticket_number: new BigNumber(0),
            prize_pool: new BigNumber("0")
        });
    });
});
