import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "../address";
import { TransactionPayload } from "../transactionPayload";
import { Argument } from "./argument";
import { ContractFunction } from "./function";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import { Nonce } from "../nonce";
import { SmartContract } from "./smartContract";
import { GasLimit } from "../networkParams";
import { SimpleSigner } from "../simpleSigner";
import { MockProvider, Wait } from "../mockProvider";
import { TransactionWatcher } from "../transactionWatcher";
import { TransactionStatus } from "../transaction";


describe("test contract", () => {
    it("should compute contract address", async () => {
        let owner = new Address("93ee6143cdc10ce79f15b2a6c2ad38e9b6021c72a1779051f47154fd54cfbd5e");

        let firstContractAddress = SmartContract.computeAddress(owner, new Nonce(0));
        assert.equal(firstContractAddress.hex(), "00000000000000000500bb652200ed1f994200ab6699462cab4b1af7b11ebd5e");
        assert.equal(firstContractAddress.bech32(), "erd1qqqqqqqqqqqqqpgqhdjjyq8dr7v5yq9tv6v5vt9tfvd00vg7h40q6779zn");

        let secondContractAddress = SmartContract.computeAddress(owner, new Nonce(1));
        assert.equal(secondContractAddress.hex(), "000000000000000005006e4f90488e27342f9a46e1809452c85ee7186566bd5e");
        assert.equal(secondContractAddress.bech32(), "erd1qqqqqqqqqqqqqpgqde8eqjywyu6zlxjxuxqfg5kgtmn3setxh40qen8egy");
    });

    it("should deploy", async () => {
        let contract = new SmartContract();
        let deployTransaction = contract.deploy({
            code: Code.fromBuffer(Buffer.from([1, 2, 3, 4])),
            gasLimit: new GasLimit(1000000)
        });

        assert.equal(deployTransaction.data.decoded(), "01020304@0500@0000");
        assert.equal(deployTransaction.gasLimit.value, 1000000);

        // Sign transaction, then check contract address (should be computed upon signing)
        let aliceSigner = new SimpleSigner("413f42575f7f26fad3317a778771212fdb80245850981e48b58a4f25e344e8f9");
        let alice = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");

        aliceSigner.sign(deployTransaction);
        assert.equal(contract.getOwner().bech32(), alice.bech32());
        assert.equal(contract.getAddress().bech32(), "erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");

        // Now let's broadcast the deploy transaction, and wait for its execution.
        let provider = new MockProvider();
        let hash = await deployTransaction.send(provider);
        let watcher = new TransactionWatcher(deployTransaction.hash, provider, 42, 42 * 3);

        await Promise.all([
            provider.mockTransactionTimeline(hash, [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed")]),
            watcher.awaitExecuted(),
        ]);
    });
});



