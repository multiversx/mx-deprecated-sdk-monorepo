import { SmartContractInteractor } from "./interactor";
import { StrictChecker as StrictInteractionChecker } from "./strictChecker"
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "../smartContract";
import { AbiRegistry } from "../typesystem";
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
        let contract = new SmartContract({ address: dummyAddress });
        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/answer.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["answer"]);
        let checker = new StrictInteractionChecker(abi);
        let signer = wallets.alice.signer;
        let provider = new MockProvider();
        let runner = new DefaultInteractionRunner(checker, signer, provider);
        let interactor = new SmartContractInteractor(contract, abi, runner);

        let interaction = <Interaction>interactor.prepare().getUltimateAnswer().withGasLimit(543210);
        assert.equal(interaction.getContract().getAddress(), dummyAddress);
        assert.deepEqual(interaction.getFunction(), new ContractFunction("getUltimateAnswer"));
        assert.lengthOf(interaction.getArguments(), 0);
        assert.equal(interaction.getGasLimit(), new GasLimit(543210));

        provider.mockQueryResponse(query => query.func.name == "getUltimateAnswer", new QueryResponse());

        let result = await interaction.query();
    });

    it("should interact with 'counter': prepare", async function () {

    });

    it("should interact with 'lottery-egld': prepare", async function () {

    });
});
