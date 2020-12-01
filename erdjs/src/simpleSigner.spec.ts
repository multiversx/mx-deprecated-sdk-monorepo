import { Address } from "./address";
import { SimpleSigner } from "./simpleSigner";
import { Nonce } from "./nonce";
import { Balance } from "./balance";
import { GasPrice, GasLimit, ChainID, TransactionVersion } from "./networkParams";
import { assert } from "chai";
import { TransactionPayload } from "./transactionPayload";
import { Transaction } from "./transaction";


describe("test simpleSigner", () => {
    it("should sign", async () => {
        let signer = new SimpleSigner("1a927e2af5306a9bb2ea777f73e06ecc0ac9aaa72fb4ea3fecf659451394cccf");
        let sender = new Address("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz");
        let receiver = new Address("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r");

        let transaction = new Transaction({
            nonce: new Nonce(0),
            value: Balance.Zero(),
            receiver: receiver,
            gasPrice: new GasPrice(1000000000),
            gasLimit: new GasLimit(50000),
            data: new TransactionPayload("foo"),
            chainID: new ChainID("1"),
            version: new TransactionVersion(1)
        });

        let serialized = transaction.serializeForSigning(sender).toString();
        await signer.sign(transaction);

        assert.equal(serialized, `{"nonce":0,"value":"0","receiver":"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r","sender":"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz","gasPrice":1000000000,"gasLimit":50000,"data":"Zm9v","chainID":"1","version":1}`);
        assert.equal(transaction.signature.hex(), "b5fddb8c16fa7f6123cb32edc854f1e760a3eb62c6dc420b5a4c0473c58befd45b621b31a448c5b59e21428f2bc128c80d0ee1caa4f2bf05a12be857ad451b00");
    });
});
