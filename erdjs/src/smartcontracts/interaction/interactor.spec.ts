import { SmartContractInteractor } from "./interactor";
import { StrictChecker as StrictInteractionChecker } from "./strictChecker"
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "../smartContract";
import { AbiRegistry, NumericalValue } from "../typesystem";
import { MockProvider, TestWallets } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { Address } from "../../address";
import { assert } from "chai";
import { Interaction } from "./interaction";
import { GasLimit } from "../../networkParams";
import { ContractFunction } from "../function";
import { QueryResponse } from "../query";

describe("test smart contract interactor", function () {
    let wallets = new TestWallets();
    let dummyAddress = new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");

    it("should interact with 'answer': prepare", async function () {
        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/answer.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["answer"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let checker = new StrictInteractionChecker();
        let signer = wallets.alice.signer;
        let provider = new MockProvider();
        let runner = new DefaultInteractionRunner(checker, signer, provider);
        let interactor = new SmartContractInteractor(contract, runner);

        let interaction = <Interaction>interactor.prepare().getUltimateAnswer().withGasLimit(543210);
        assert.equal(interaction.getContract().getAddress(), dummyAddress);
        assert.deepEqual(interaction.getFunction(), new ContractFunction("getUltimateAnswer"));
        assert.lengthOf(interaction.getArguments(), 0);
        assert.equal(interaction.getGasLimit(), new GasLimit(543210));

        provider.mockQueryResponseOnFunction("getUltimateAnswer", new QueryResponse({ returnData: ["Kg=="] }));

        // Query
        let queryResponse = await interaction.query();
        assert.lengthOf(queryResponse.outcome().values(), 1);
        assert.equal(queryResponse.outcome().firstValue().valueOf(), BigInt(42));

        // Execute, do not wait for execution
        let transaction = await interaction.broadcast();
        assert.equal(transaction.nonce.valueOf(), 0);
        assert.equal(transaction.data.toString(), "getUltimateAnswer");
        assert.equal(transaction.hash.toString(), "56fcf6984611afb8855f65f1ce40d86b5f62840a257b19f4a2a2c1620dd6a351");
        transaction = await interaction.broadcast();
        assert.equal(transaction.nonce.valueOf(), 1);
        assert.equal(transaction.hash.toString(), "be876a69a990b820d8992f566924222cecce9c180999d20d1d211a0f42165b9d");

        // Execute, and wait for execution
        let transactionOnNetwork = await interaction.broadcastAwaitExecution();
    });

    it("should interact with 'counter': prepare", async function () {

    });

    it("should interact with 'lottery-egld': prepare", async function () {

    });
});
