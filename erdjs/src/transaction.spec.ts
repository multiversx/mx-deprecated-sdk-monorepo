import { assert } from "chai";
import { Transaction } from "./transaction";
import * as errors from "./errors";
import { Nonce } from "./nonce";
import { ChainID, GasLimit, GasPrice, GasPriceModifier, TransactionOptions, TransactionVersion } from "./networkParams";
import { TransactionPayload } from "./transactionPayload";
import { Balance } from "./balance";
import { TestWallets } from "./testutils";
import { NetworkConfig } from "./networkConfig";
import { Address } from "./address";

describe("test transaction", () => {
    it("should throw error when bad types", () => {
        assert.throw(() => new Transaction({ nonce: <any>42, receiver: new Address() }), errors.ErrBadType);
        assert.throw(() => new Transaction({ receiver: new Address(), gasLimit: <any>42 }), errors.ErrBadType);
        assert.throw(() => new Transaction({ receiver: new Address(), gasPrice: <any>42 }), errors.ErrBadType);

        assert.throw(() => new Transaction({ nonce: <any>7, receiver: new Address() }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasLimit: <any>8, receiver: new Address() }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasPrice: <any>9, receiver: new Address() }), errors.ErrBadType);

        assert.doesNotThrow(() => new Transaction({ receiver: new Address() }));
        assert.doesNotThrow(() => new Transaction({
            nonce: new Nonce(42),
            gasLimit: new GasLimit(42),
            gasPrice: new GasPrice(42),
            receiver: new Address()
        }));
        assert.doesNotThrow(() => new Transaction({ nonce: undefined, gasLimit: undefined, gasPrice: undefined, receiver: new Address() }));
    });
});

describe("test transaction construction", async () => {
    let wallets = new TestWallets();

    it("with no data, no value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("b56769014f2bdc5cf9fc4a05356807d71fcf8775c819b0f1b0964625b679c918ffa64862313bfef86f99b38cb84fcdb16fa33ad6eb565276616723405cd8f109", transaction.getSignature().hex());
        assert.equal(transaction.getHash().valueOf(), "eb30c50c8831885ebcfac986d27e949ec02cf25676e22a009b7a486e5431ec2e");
    });

    it("with data, no value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(90),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(80000),
            data: new TransactionPayload("hello"),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("e47fd437fc17ac9a69f7bf5f85bafa9e7628d851c4f69bd9fedc7e36029708b2e6d168d5cd652ea78beedd06d4440974ca46c403b14071a1a148d4188f6f2c0d", transaction.getSignature().hex());
        assert.equal(transaction.getHash().valueOf(), "95ed9ac933712d7d77721d75eecfc7896873bb0d746417153812132521636872");
    });

    it("with data, with opaque, unused options (the protocol ignores the options when version == 1)", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet"),
            version: new TransactionVersion(1),
            options: new TransactionOptions(1)
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("c83e69b853a891bf2130c1839362fe2a7a8db327dcc0c9f130497a4f24b0236140b394801bb2e04ce061a6f873cb432bf1bb1e6072e295610904662ac427a30a", transaction.getSignature().hex());
        assert.equal(transaction.getHash().valueOf(), "3e204088f93109ed855ffe1e5619c96c0c5f9ab7d75d3690c296792451b4d1ab");
    });

    it("with data, with value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(91),
            value: Balance.egld(10),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(100000),
            data: new TransactionPayload("for the book"),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("9074789e0b4f9b2ac24b1fd351a4dd840afcfeb427b0f93e2a2d429c28c65ee9f4c288ca4dbde79de0e5bcf8c1a5d26e1b1c86203faea923e0edefb0b5099b0c", transaction.getSignature().hex());
        assert.equal(transaction.getHash().valueOf(), "af53e0fc86612d5068862716b5169effdf554951ecc89849b0e836eb0b63fa3e");
    });

    it("with data, with large value", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(92),
            value: Balance.fromString("123456789000000000000000000000"),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: new GasLimit(100000),
            data: new TransactionPayload("for the spaceship"),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("39938d15812708475dfc8125b5d41dbcea0b2e3e7aabbbfceb6ce4f070de3033676a218b73facd88b1432d7d4accab89c6130b3abe5cc7bbbb5146e61d355b03", transaction.getSignature().hex());
        assert.equal(transaction.getHash().valueOf(), "e4a6048d92409cfe50f12e81218cb92f39966c618979a693b8d16320a06061c1");
    });

    it("without options field, should be omitted", async () => {
        let transaction = new Transaction({
            nonce: new Nonce(89),
            value: Balance.Zero(),
            receiver: wallets.bob.address,
            gasPrice: GasPrice.min(),
            gasLimit: GasLimit.min(),
            chainID: new ChainID("local-testnet")
        });

        await wallets.alice.signer.sign(transaction);
        assert.equal("b56769014f2bdc5cf9fc4a05356807d71fcf8775c819b0f1b0964625b679c918ffa64862313bfef86f99b38cb84fcdb16fa33ad6eb565276616723405cd8f109", transaction.getSignature().hex());
        assert.equal(transaction.getHash().valueOf(), "eb30c50c8831885ebcfac986d27e949ec02cf25676e22a009b7a486e5431ec2e");

        let result = transaction.serializeForSigning(wallets.alice.address);
        assert.isFalse(result.toString().includes("options"));
    });

    it("computes correct fee", () => {
        let transaction = new Transaction({
            nonce: new Nonce(92),
            value: Balance.fromString("123456789000000000000000000000"),
            receiver: wallets.bob.address,
            gasPrice: new GasPrice(500),
            gasLimit: new GasLimit(20),
            chainID: new ChainID("local-testnet")
        });

        let networkConfig = new NetworkConfig();
        networkConfig.MinGasLimit = new GasLimit(10);
        networkConfig.GasPriceModifier = new GasPriceModifier(0.01);

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "5050");
    });

    it("computes correct fee with data field", () => {
        let transaction = new Transaction({
            nonce: new Nonce(92),
            value: Balance.fromString("123456789000000000000000000000"),
            receiver: wallets.bob.address,
            data: new TransactionPayload("testdata"),
            gasPrice: new GasPrice(500),
            gasLimit: new GasLimit(12010),
            chainID: new ChainID("local-testnet")
        });

        let networkConfig = new NetworkConfig();
        networkConfig.MinGasLimit = new GasLimit(10);
        networkConfig.GasPriceModifier = new GasPriceModifier(0.01);

        let fee = transaction.computeFee(networkConfig);
        assert.equal(fee.toString(), "6005000");
    });
});
