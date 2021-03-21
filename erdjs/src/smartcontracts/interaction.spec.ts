import { StrictChecker } from "./strictChecker";
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "./smartContract";
import { missingOption, providedOption, typedBigInt, typedUTF8, U32Value } from "./typesystem";
import { AddImmediateResult, loadAbiRegistry, MarkNotarized, MockProvider, setupUnitTestWatcherTimeouts, TestWallets } from "../testutils";
import { SmartContractAbi } from "./abi";
import { Address } from "../address";
import { assert } from "chai";
import { Interaction } from "./interaction";
import { GasLimit } from "../networkParams";
import { ContractFunction } from "./function";
import { QueryResponse } from "./queryResponse";
import { Nonce } from "../nonce";
import { TransactionStatus } from "../transaction";
import { ReturnCode } from "./returnCode";
import { Balance } from "../balance";
import BigNumber from "bignumber.js";

describe("test smart contract interactor", function () {
    let wallets = new TestWallets();
    let dummyAddress = new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");
    let checker = new StrictChecker();
    let provider = new MockProvider();
    let signer = wallets.alice.signer;
    let runner = new DefaultInteractionRunner(checker, signer, provider);

    it("should interact with 'answer'", async function () {
        setupUnitTestWatcherTimeouts();

        let abiRegistry = await loadAbiRegistry(["src/testdata/answer.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["answer"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });

        let interaction = <Interaction>contract.methods.getUltimateAnswer().withGasLimit(new GasLimit(543210));
        assert.equal(interaction.getContract().getAddress(), dummyAddress);
        assert.deepEqual(interaction.getFunction(), new ContractFunction("getUltimateAnswer"));
        assert.lengthOf(interaction.getArguments(), 0);
        assert.deepEqual(interaction.getGasLimit(), new GasLimit(543210));

        provider.mockQueryResponseOnFunction("getUltimateAnswer", new QueryResponse({ returnData: ["Kg=="], returnCode: ReturnCode.Ok }));

        // Query
        let { values: queryValues, firstValue: queryAnwser, returnCode: queryCode } = await runner.runQuery(interaction);
        assert.lengthOf(queryValues, 1);
        assert.deepEqual(queryAnwser.valueOf(), new BigNumber(42));
        assert.isTrue(queryCode.equals(ReturnCode.Ok));

        // Execute, do not wait for execution
        let transaction = await runner.run(interaction.withNonce(new Nonce(0)));
        assert.equal(transaction.getNonce().valueOf(), 0);
        assert.equal(transaction.getData().toString(), "getUltimateAnswer");
        assert.equal(transaction.getHash().toString(), "60d0956a8902c1179dce92d91bd9670e31b9a9cd07c1d620edb7754a315b4818");

        transaction = await runner.run(interaction.withNonce(new Nonce(1)));
        assert.equal(transaction.getNonce().valueOf(), 1);
        assert.equal(transaction.getHash().toString(), "acd207c38f6c3341b18d8ef331fa07ba49615fa12d7610aad5d8495293049f24");

        // Execute, and wait for execution
        let [, { values: executionValues, firstValue: executionAnswer, returnCode: executionCode }] = await Promise.all([
            provider.mockNextTransactionTimeline([new TransactionStatus("executed"), new AddImmediateResult("@6f6b@2b"), new MarkNotarized()]),
            runner.runAwaitExecution(interaction.withNonce(new Nonce(2)))
        ]);

        assert.lengthOf(executionValues, 1);
        assert.deepEqual(executionAnswer.valueOf(), new BigNumber(43));
        assert.isTrue(executionCode.equals(ReturnCode.Ok));
    });

    it("should interact with 'counter'", async function () {
        setupUnitTestWatcherTimeouts();

        let abiRegistry = await loadAbiRegistry(["src/testdata/counter.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["counter"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });

        let getInteraction = <Interaction>contract.methods.get();
        let incrementInteraction = (<Interaction>contract.methods.increment()).withGasLimit(new GasLimit(543210));
        let decrementInteraction = (<Interaction>contract.methods.decrement()).withGasLimit(new GasLimit(987654));

        // For "get()", return fake 7
        provider.mockQueryResponseOnFunction("get", new QueryResponse({ returnData: ["Bw=="], returnCode: ReturnCode.Ok }));

        // Query "get()"
        let { firstValue: counterValue } = await runner.runQuery(getInteraction);

        assert.deepEqual(counterValue.valueOf(), new BigNumber(7));

        // Increment, wait for execution. Return fake 8
        let [, { firstValue: valueAfterIncrement }] = await Promise.all([
            provider.mockNextTransactionTimeline([new TransactionStatus("executed"), new AddImmediateResult("@6f6b@08"), new MarkNotarized()]),
            runner.runAwaitExecution(incrementInteraction.withNonce(new Nonce(14)))
        ]);

        assert.deepEqual(valueAfterIncrement.valueOf(), new BigNumber(8));

        // Decrement three times (simulate three parallel broadcasts). Wait for execution of the latter (third transaction). Return fake "5".
        await runner.run(decrementInteraction.withNonce(new Nonce(15)));
        await runner.run(decrementInteraction.withNonce(new Nonce(16)));

        let [, { firstValue: valueAfterDecrement }] = await Promise.all([
            provider.mockNextTransactionTimeline([new TransactionStatus("executed"), new AddImmediateResult("@6f6b@05"), new MarkNotarized()]),
            runner.runAwaitExecution(decrementInteraction.withNonce(new Nonce(17)))
        ]);

        assert.deepEqual(valueAfterDecrement.valueOf(), new BigNumber(5));
    });

    it("should interact with 'lottery_egld'", async function () {
        setupUnitTestWatcherTimeouts();

        let abiRegistry = await loadAbiRegistry(["src/testdata/lottery_egld.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["Lottery"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });

        let startInteraction = <Interaction>contract.methods.start([
            typedUTF8("lucky"),
            typedBigInt(Balance.egld(1).valueOf()),
            missingOption(),
            missingOption(),
            providedOption(new U32Value(1)),
            missingOption(),
            missingOption()
        ]).withGasLimit(new GasLimit(5000000));

        let lotteryStatusInteraction = <Interaction>contract.methods.status([
            typedUTF8("lucky")
        ]).withGasLimit(new GasLimit(5000000));

        let getLotteryInfoInteraction = <Interaction>contract.methods.lotteryInfo([
            typedUTF8("lucky")
        ]).withGasLimit(new GasLimit(5000000));

        // start()
        let [, { returnCode: startReturnCode, values: startReturnvalues }] = await Promise.all([
            provider.mockNextTransactionTimeline([new TransactionStatus("executed"), new AddImmediateResult("@6f6b"), new MarkNotarized()]),
            runner.runAwaitExecution(startInteraction.withNonce(new Nonce(14)))
        ]);

        assert.equal(startInteraction.buildTransaction().getData().toString(), "start@6c75636b79@0de0b6b3a7640000@@@0100000001@@");
        assert.isTrue(startReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(startReturnvalues, 0);

        // lotteryExists() (this is a view function, but for the sake of the test, we'll execute it)
        let [, { returnCode: statusReturnCode, values: statusReturnvalues, firstValue: statusFirstValue }] = await Promise.all([
            provider.mockNextTransactionTimeline([new TransactionStatus("executed"), new AddImmediateResult("@6f6b@01"), new MarkNotarized()]),
            runner.runAwaitExecution(lotteryStatusInteraction.withNonce(new Nonce(15)))
        ]);

        assert.equal(lotteryStatusInteraction.buildTransaction().getData().toString(), "status@6c75636b79");
        assert.isTrue(statusReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(statusReturnvalues, 1);
        assert.equal(statusFirstValue.valueOf(), "Running");

        // lotteryInfo() (this is a view function, but for the sake of the test, we'll execute it)
        let [, { returnCode: infoReturnCode, values: infoReturnvalues, firstValue: infoFirstValue }] = await Promise.all([
            provider.mockNextTransactionTimeline([new TransactionStatus("executed"), new AddImmediateResult("@6f6b@000000080de0b6b3a764000000000320000000006012a806000000010000000164000000000000000000000000"), new MarkNotarized()]),
            runner.runAwaitExecution(getLotteryInfoInteraction.withNonce(new Nonce(16)))
        ]);

        assert.equal(getLotteryInfoInteraction.buildTransaction().getData().toString(), "lotteryInfo@6c75636b79");
        assert.isTrue(infoReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(infoReturnvalues, 1);

        assert.deepEqual(infoFirstValue.valueOf(), {
            ticket_price: new BigNumber("1000000000000000000"),
            tickets_left: new BigNumber(800),
            deadline: new BigNumber("1611835398"),
            max_entries_per_user: new BigNumber(1),
            prize_distribution: Buffer.from([0x64]),
            whitelist: [],
            current_ticket_number: new BigNumber(0),
            prize_pool: new BigNumber("0")
        });
    });
});
