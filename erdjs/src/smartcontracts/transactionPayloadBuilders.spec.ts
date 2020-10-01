import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "../address";
import { TransactionPayload } from "../transactionPayload";
import { Argument } from "./argument";
import { ContractFunction } from "./function";


describe("test contract payload builders", () => {
    let aliceBech32 = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz";

    it("should prepare call correctly", async () => {
        let alice = new Address(aliceBech32);
        let payload = TransactionPayload
            .contractCall()
            .setFunction(new ContractFunction("transferToken"))
            .addArgument(Argument.pubkey(alice))
            .addArgument(Argument.number(1024))
            .build();

        assert.equal(payload.decoded(), "transferToken@fd691bb5e85d102687d81079dffce842d4dc328276d2d4c60d8fd1c3433c3293@0400");
    });
});



