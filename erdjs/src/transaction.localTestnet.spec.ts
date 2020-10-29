import { Transaction } from "./transaction";
import { GasLimit } from "./networkParams";
import { Account } from "./account";
import { TransactionPayload } from "./transactionPayload";
import { ProxyProvider } from "./proxyProvider";
import { NetworkConfig } from "./networkConfig";
import { Balance } from "./balance";
import { TestWallets } from "./testutils/wallets";
import { describeOnlyIf } from "./testutils/utils";

describeOnlyIf("localTestnet")("test transaction", () => {
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;

    it("should simulate transactions", async () => {
        let localTestnet = new ProxyProvider("http://localhost:7950");

        await NetworkConfig.getDefault().sync(localTestnet);
        await alice.sync(localTestnet);

        let transactionOne = new Transaction({
            data: new TransactionPayload("helloWorld"),
            gasLimit: new GasLimit(70000),
            receiver: alice.address,
            value: Balance.eGLD(1000)
        });

        let transactionTwo = new Transaction({
            data: new TransactionPayload("helloWorld"),
            gasLimit: new GasLimit(70000),
            receiver: alice.address,
            value: Balance.eGLD(1000000)
        });

        transactionOne.setNonce(alice.nonce);
        transactionTwo.setNonce(alice.nonce);

        await aliceSigner.sign(transactionOne);
        await aliceSigner.sign(transactionTwo);

        console.log(JSON.stringify(await transactionOne.simulate(localTestnet), null, 4));
        console.log(JSON.stringify(await transactionTwo.simulate(localTestnet), null, 4));
    });
});
