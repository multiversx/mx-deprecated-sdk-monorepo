import { describe } from "mocha";
import { assert } from "chai";
import { Transaction } from "./transaction";
import * as errors from "./errors";
import { Nonce } from "./nonce";
import { GasLimit, GasPrice } from "./networkParams";
import { Account } from "./account";
import { MockProvider } from "./testutils/mockProvider";
import { SimpleSigner } from "./simpleSigner";
import { Address } from "./address";
import { TransactionPayload } from "./transactionPayload";
import { ProxyProvider } from "./proxyProvider";
import { NetworkConfig } from "./networkConfig";
import { Balance } from "./balance";


describe("test transaction", () => {
    let provider = new MockProvider();
    let aliceSigner = new SimpleSigner("413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9");
    let aliceAddress = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
    let alice = new Account(aliceAddress);
    
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
            receiver: aliceAddress
        });

        let transactionTwo = new Transaction({
            data: new TransactionPayload("helloWorld"),
            gasLimit: new GasLimit(70000),
            receiver: aliceAddress,
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
