import { describe } from "mocha";
import { assert } from "chai";
import { Transaction } from "./transaction";
import * as errors from "./errors";
import { Nonce } from "./nonce";
import { GasLimit, GasPrice } from "./networkParams";
import { Account } from "./account";
import { TransactionPayload } from "./transactionPayload";
import { ProxyProvider } from "./proxyProvider";
import { NetworkConfig } from "./networkConfig";
import { Balance } from "./balance";
import { TestWallets } from "./testutils/wallets";


describe("test transaction", () => {
    let wallets = new TestWallets();
    let aliceWallet = wallets.alice;
    let alice = new Account(aliceWallet.address);
    let aliceSigner = aliceWallet.signer;
    
    let nonce: any = 42;
    let gasLimit: any = 42;
    let gasPrice: any = 42;

    it("should throw error when bad types", () => {
        assert.throw(() => new Transaction({ nonce: nonce }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasLimit: gasLimit }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasPrice: gasPrice }), errors.ErrBadType);

        assert.doesNotThrow(() => new Transaction({}));
        assert.doesNotThrow(() => new Transaction({ nonce: new Nonce(42), gasLimit: new GasLimit(42), gasPrice: new GasPrice(42) }));
        assert.doesNotThrow(() => new Transaction({ nonce: undefined, gasLimit: undefined, gasPrice: undefined }));
    });

    it.skip("should simulate transactions", async () => {
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
