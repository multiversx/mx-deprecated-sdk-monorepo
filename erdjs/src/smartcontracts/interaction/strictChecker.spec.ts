import * as errors from "../../errors";
import { SmartContractInteractor } from "./interactor";
import { StrictChecker as StrictInteractionChecker } from "./strictChecker";
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "../smartContract";
import { AbiRegistry, missingOption, providedOption, typedBigInt, typedBytesFromHex, typedUTF8, U64Value } from "../typesystem";
import { MockProvider, TestWallets } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { Address } from "../../address";
import { assert } from "chai";
import { Interaction } from "./interaction";
import { Balance } from "../../balance";

describe("integration tests: test checker within interactor", function () {
    let wallets = new TestWallets();
    let dummyAddress = new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");
    let checker = new StrictInteractionChecker();
    let provider = new MockProvider();
    let signer = wallets.alice.signer;
    let runner = new DefaultInteractionRunner(checker, signer, provider);

    it("should detect errors for 'ultimate answer'", async function () {
        let abiRegistry = await AbiRegistry.load({files: ["src/testdata/answer.abi.json"]});
        let abi = new SmartContractAbi(abiRegistry, ["answer"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let interactor = new SmartContractInteractor(contract, runner);

        // Send value to non-payable
        assert.throw(() => (<Interaction>interactor.prepare().getUltimateAnswer()).withValue(Balance.eGLD(1)), errors.ErrContractInteraction, "cannot send eGLD value to non-payable");

        // Bad arguments
        assert.throw(() => (<Interaction>interactor.prepare().getUltimateAnswer([typedBytesFromHex("abba")])), errors.ErrContractInteraction, "bad arguments, expected: 0, got: 1");
    });

    it("should detect errors for 'lottery'", async function () {
        let abiRegistry = await AbiRegistry.load({files: ["src/testdata/lottery_egld.abi.json"]});
        let abi = new SmartContractAbi(abiRegistry, ["Lottery"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let interactor = new SmartContractInteractor(contract, runner);

        // Bad number of arguments
        assert.throw(() => interactor.prepare().start([
            typedUTF8("lucky"),
            typedBigInt(Balance.eGLD(1).valueOf()),
            missingOption(),
        ]), errors.ErrContractInteraction, "bad arguments, expected: 7, got: 3");

        // Bad types (U64 instead of U32)
        assert.throw(() => interactor.prepare().start([
            typedUTF8("lucky"),
            typedBigInt(Balance.eGLD(1).valueOf()),
            missingOption(),
            missingOption(),
            providedOption(new U64Value(BigInt(1))),
            missingOption(),
            missingOption()
        ]), errors.ErrContractInteraction, "type mismatch at index 4, expected: Option<u32>, got: Option<u64>");
    });
});
