import { assert } from "chai";
import { ProtoSerializer } from "./serializer";
import { Nonce } from "../nonce";
import { Transaction,  } from "../transaction";
import { TestWallets } from "../testutils";
import { Signature } from "../signature";
import { Balance } from "../balance";
import { ChainID, GasLimit, GasPrice, TransactionVersion } from "../networkParams";
import { TransactionPayload } from "../transactionPayload";

describe("serialize transactions", () => {
    let wallets = new TestWallets();
    let serializer = new ProtoSerializer();

    it("with no data, no value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            sender: wallets.alice.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1),
            signature: new Signature("b56769014f2bdc5cf9fc4a05356807d71fcf8775c819b0f1b0964625b679c918ffa64862313bfef86f99b38cb84fcdb16fa33ad6eb565276616723405cd8f109")
        });

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "0859120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340d08603520d6c6f63616c2d746573746e657458016240b56769014f2bdc5cf9fc4a05356807d71fcf8775c819b0f1b0964625b679c918ffa64862313bfef86f99b38cb84fcdb16fa33ad6eb565276616723405cd8f109");
    });

    it("with data, no value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(90),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            sender: wallets.alice.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(80000),
            data: new TransactionPayload("hello"),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1),
            signature: new Signature("e47fd437fc17ac9a69f7bf5f85bafa9e7628d851c4f69bd9fedc7e36029708b2e6d168d5cd652ea78beedd06d4440974ca46c403b14071a1a148d4188f6f2c0d")
        });

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085a120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e657458016240e47fd437fc17ac9a69f7bf5f85bafa9e7628d851c4f69bd9fedc7e36029708b2e6d168d5cd652ea78beedd06d4440974ca46c403b14071a1a148d4188f6f2c0d");
    });

    it("with data, with value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(91),
            value: Balance.eGLD(10),
            receiver: wallets.bob.address,
            sender: wallets.alice.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(100000),
            data: new TransactionPayload("for the book"),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1),
            signature: new Signature("9074789e0b4f9b2ac24b1fd351a4dd840afcfeb427b0f93e2a2d429c28c65ee9f4c288ca4dbde79de0e5bcf8c1a5d26e1b1c86203faea923e0edefb0b5099b0c")
        });

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085b1209008ac7230489e800001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340a08d064a0c666f722074686520626f6f6b520d6c6f63616c2d746573746e6574580162409074789e0b4f9b2ac24b1fd351a4dd840afcfeb427b0f93e2a2d429c28c65ee9f4c288ca4dbde79de0e5bcf8c1a5d26e1b1c86203faea923e0edefb0b5099b0c");
    });

    it("with data, with large value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(92),
            value: Balance.fromString("123456789000000000000000000000"),
            receiver: wallets.bob.address,
            sender: wallets.alice.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(100000),
            data: new TransactionPayload("for the spaceship"),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1),
            signature: new Signature("39938d15812708475dfc8125b5d41dbcea0b2e3e7aabbbfceb6ce4f070de3033676a218b73facd88b1432d7d4accab89c6130b3abe5cc7bbbb5146e61d355b03")
        });

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "085c120e00018ee90ff6181f3761632000001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc0340a08d064a11666f722074686520737061636573686970520d6c6f63616c2d746573746e65745801624039938d15812708475dfc8125b5d41dbcea0b2e3e7aabbbfceb6ce4f070de3033676a218b73facd88b1432d7d4accab89c6130b3abe5cc7bbbb5146e61d355b03");
    });

    it("with nonce = 0", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(0),
            value: Balance.fromString("0"),
            receiver: wallets.bob.address,
            sender: wallets.alice.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(80000),
            data: new TransactionPayload("hello"),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1),
            signature: new Signature("dfa3e9f2fdec60dcb353bac3b3435b4a2ff251e7e98eaf8620f46c731fc70c8ba5615fd4e208b05e75fe0f7dc44b7a99567e29f94fcd91efac7e67b182cd2a04")
        });

        let buffer = serializer.serializeTransaction(transaction);
        assert.equal(buffer.toString("hex"), "120200001a208049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f82a200139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1388094ebdc034080f1044a0568656c6c6f520d6c6f63616c2d746573746e657458016240dfa3e9f2fdec60dcb353bac3b3435b4a2ff251e7e98eaf8620f46c731fc70c8ba5615fd4e208b05e75fe0f7dc44b7a99567e29f94fcd91efac7e67b182cd2a04");
    });
});
