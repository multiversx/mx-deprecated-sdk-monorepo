import { describe, Test } from "mocha";
import { assert } from "chai";
import { ProtoSerializer } from "./serializer";
import { Nonce } from "../nonce";
import { Transaction,  } from "../transaction";
import { TestWallets } from "../testutils";
import { Signature } from "../signature";

describe("test serializer", () => {
    it("serialize / deserialize transactions", () => {
        let serializer = new ProtoSerializer();
        let wallets = new TestWallets();
        let buffer: Buffer;

        buffer = serializer.serializeTransaction(new Transaction({
            nonce: new Nonce(42),
            sender: wallets.alice.address,
            receiver: wallets.bob.address,
            signature: new Signature("abba")
        }));
    });
});
