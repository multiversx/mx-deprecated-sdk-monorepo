import { Transaction } from "./transaction";
import { GasLimit } from "./networkParams";
import { Account } from "./account";
import { TransactionPayload } from "./transactionPayload";
import { NetworkConfig } from "./networkConfig";
import { Balance } from "./balance";
import { getLocalTestnetProvider, loadTestWallets, TestWallet } from "./testutils";
import { Logger } from "./logger";
import { assert } from "chai";

describe("test transaction", function () {
    let alice: TestWallet, bob: TestWallet;
    before(async function () {
        ({ alice, bob } = await loadTestWallets());
    });

    it("should send transactions", async function () {
        this.timeout(20000);

        let devnet = getLocalTestnetProvider();

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        await bob.sync(devnet);
        let initialBalanceOfBob = bob.account.balance;

        let transactionOne = new Transaction({
            receiver: bob.address,
            value: Balance.egld(42)
        });

        let transactionTwo = new Transaction({
            receiver: bob.address,
            value: Balance.egld(43)
        });

        transactionOne.setNonce(alice.account.nonce);
        alice.account.incrementNonce();
        transactionTwo.setNonce(alice.account.nonce);

        await alice.signer.sign(transactionOne);
        await alice.signer.sign(transactionTwo);

        await transactionOne.send(devnet);
        await transactionTwo.send(devnet);

        await transactionOne.awaitExecuted(devnet);
        await transactionTwo.awaitExecuted(devnet);

        await bob.sync(devnet);
        let newBalanceOfBob = bob.account.balance;

        assert.deepEqual(Balance.egld(85).valueOf(), newBalanceOfBob.valueOf().minus(initialBalanceOfBob.valueOf()));
    });

    it("should simulate transactions", async function () {
        this.timeout(20000);

        let devnet = getLocalTestnetProvider();

        await NetworkConfig.getDefault().sync(devnet);
        await alice.sync(devnet);

        let transactionOne = new Transaction({
            data: new TransactionPayload("helloWorld"),
            gasLimit: new GasLimit(70000),
            receiver: alice.address,
            value: Balance.egld(1000)
        });

        let transactionTwo = new Transaction({
            data: new TransactionPayload("helloWorld"),
            gasLimit: new GasLimit(70000),
            receiver: alice.address,
            value: Balance.egld(1000000)
        });

        transactionOne.setNonce(alice.account.nonce);
        transactionTwo.setNonce(alice.account.nonce);

        await alice.signer.sign(transactionOne);
        await alice.signer.sign(transactionTwo);

        Logger.trace(JSON.stringify(await transactionOne.simulate(devnet), null, 4));
        Logger.trace(JSON.stringify(await transactionTwo.simulate(devnet), null, 4));
    });
});
