import { DefaultInteractionRunner, SmartContractInteractor } from "./interactor";
import { SmartContract } from "./smartContract";
import { AbiRegistry } from "./typesystem";
import { MockProvider, TestWallets } from "../testutils";
import { SmartContractAbi } from "./abi";

describe("test smart contract interactor", function () {
    let wallets = new TestWallets();

    it("should interact with 'answer': prepare", async function () {
        let contract = new SmartContract({});
        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/answer.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["answer"]);
        let signer = wallets.alice.signer;
        let provider = new MockProvider();
        let runner = new DefaultInteractionRunner(signer, provider);
        let interactor = new SmartContractInteractor(contract, abi, runner);

        interactor.prepare().getUltimateAnswer();
    });

    it("should interact with 'counter': prepare", async function () {

    });

    it("should interact with 'lottery-egld': prepare", async function () {

    });
});
