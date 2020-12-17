import { SmartContractInteractor } from "./interactor";
import { StrictChecker as StrictInteractionChecker } from "./strictChecker"
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "../smartContract";
import { AbiRegistry } from "../typesystem";
import { MockProvider, setupUnitTestWatcherTimeouts, TestWallets } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { Address } from "../../address";
import { assert } from "chai";
import { Interaction } from "./interaction";
import { GasLimit } from "../../networkParams";
import { ContractFunction } from "../function";
import { QueryResponse } from "../queryResponse";
import { Nonce } from "../../nonce";

describe("test smart contract interactor", function () {
    let wallets = new TestWallets();
    let dummyAddress = new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");

    it("should interact with 'answer': prepare", async function () {
        setupUnitTestWatcherTimeouts();

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
        assert.lengthOf(queryResponse.outputArguments().valuesTyped(), 1);
        assert.equal(queryResponse.outputArguments().valueTyped().valueOf(), BigInt(42));

        // Execute, do not wait for execution
        let transaction = await interaction.withNonce(new Nonce(0)).broadcast();
        assert.equal(transaction.getNonce().valueOf(), 0);
        assert.equal(transaction.getData().toString(), "getUltimateAnswer");
        assert.equal(transaction.getHash().toString(), "56fcf6984611afb8855f65f1ce40d86b5f62840a257b19f4a2a2c1620dd6a351");
        
        transaction = await interaction.withNonce(new Nonce(1)).broadcast();
        assert.equal(transaction.getNonce().valueOf(), 1);
        assert.equal(transaction.getHash().toString(), "acd207c38f6c3341b18d8ef331fa07ba49615fa12d7610aad5d8495293049f24");

        // Execute, and wait for execution
        // let [_, transactionOnNetwork] = await Promise.all([
        //     provider.mockTransactionTimeline(interaction.getTransaction(), [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed")]),
        //     await interaction.broadcastAwaitExecution()
        // ]);
        
    });

    it("should interact with 'counter': prepare", async function () {

    });

    it("should interact with 'lottery-egld': prepare", async function () {

    });
});
