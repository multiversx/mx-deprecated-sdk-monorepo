import { SmartContractInteractor } from "./interactor";
import { StrictChecker as StrictInteractionChecker } from "./strictChecker"
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "../smartContract";
import { AbiRegistry } from "../typesystem";
import { MockProvider, TestWallets } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { Address } from "../../address";

describe("test smart contract interactor", function () {
    let wallets = new TestWallets();

    it("should interact with 'answer': prepare", async function () {
        let contract = new SmartContract({ address: new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3") });
        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/answer.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["answer"]);
        let checker = new StrictInteractionChecker(abi);
        let signer = wallets.alice.signer;
        let provider = new MockProvider();
        let runner = new DefaultInteractionRunner(checker, signer, provider);
        let interactor = new SmartContractInteractor(contract, abi, runner);

        interactor.prepare().getUltimateAnswer();
    });

    it("should interact with 'counter': prepare", async function () {

    });

    it("should interact with 'lottery-egld': prepare", async function () {

    });
});
