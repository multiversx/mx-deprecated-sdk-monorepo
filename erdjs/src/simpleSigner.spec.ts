import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "./address";
import * as errors from "./errors";


describe("test simpleSigner", () => {
    it("should sign", async () => {
        let alice = new Address(aliceBech32);
        let bob = new Address(bobBech32);

        assert.equal(alice.hex(), aliceHex);
        assert.equal(bob.hex(), bobHex);
    });
});



// def test_sign_transaction_trust_wallet_scenario(self):
// # With data
// transaction = Transaction()
// transaction.nonce = 0
// transaction.value = "0"
// transaction.sender = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"
// transaction.receiver = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"
// transaction.gasPrice = 1000000000
// transaction.gasLimit = 50000
// transaction.data = "foo"
// transaction.chainID = "1"
// transaction.version = 1
// transaction.sign(self.alice)
// serialized = transaction.serialize().decode()

// self.assertEqual("""{"nonce":0,"value":"0","receiver":"erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r","sender":"erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz","gasPrice":1000000000,"gasLimit":50000,"data":"Zm9v","chainID":"1","version":1,"signature":"b5fddb8c16fa7f6123cb32edc854f1e760a3eb62c6dc420b5a4c0473c58befd45b621b31a448c5b59e21428f2bc128c80d0ee1caa4f2bf05a12be857ad451b00"}""", serialized)
// self.assertEqual("b5fddb8c16fa7f6123cb32edc854f1e760a3eb62c6dc420b5a4c0473c58befd45b621b31a448c5b59e21428f2bc128c80d0ee1caa4f2bf05a12be857ad451b00", transaction.signature)