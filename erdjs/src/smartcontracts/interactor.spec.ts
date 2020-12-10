import { SmartContractInteractor } from "./interactor";
import { SmartContract } from "./smartContract";
import { AbiRegistry } from "./typesystem";
import { GasEstimator } from "./gasEstimator";
import { TestWallets } from "../testutils";
import { SmartContractAbi } from "./abi";

describe("test smart contract interactor", function () {
    let wallets = new TestWallets();

    it("should interact with 'answer': prepare", async function () {
        let contract = new SmartContract({});
        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/answer.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["answer"]);
        let gasEstimator = new GasEstimator();
        let signer = wallets.alice.signer;
        let interactor = new SmartContractInteractor(contract, abi, gasEstimator, signer);

        interactor.query().getUltimateAnswer();
    });

    it("should interact with 'counter': prepare", async function () {

    });

    it("should interact with 'lottery-egld': prepare", async function () {

    });
});
