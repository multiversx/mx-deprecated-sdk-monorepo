import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "../data/account";
import { SmartContractCall } from "./scCall";


describe.only("test address", () => {
    let aliceBech32 = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz";

    it("should prepare call correctly", async () => {
        let alice = new Address(aliceBech32);
        let scCall = new SmartContractCall();
        scCall.setFunctionName("transferToken");
        scCall.addRawArgument(alice.hex());
        scCall.addBigIntArgument(BigInt(1024));

        scCall.prepareData();
        assert.equal(scCall.getData(), "transferToken@fd691bb5e85d102687d81079dffce842d4dc328276d2d4c60d8fd1c3433c3293@0400");
    });
});



