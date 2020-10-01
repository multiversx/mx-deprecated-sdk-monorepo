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
    });
});



