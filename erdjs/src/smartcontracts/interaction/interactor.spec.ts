import { SmartContractInteractor } from "./interactor";
import { StrictChecker as StrictInteractionChecker } from "./strictChecker"
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "../smartContract";
import { AbiRegistry, TypedValue, U32Value } from "../typesystem";
import { AddImmediateResult, MarkNotarized, MockProvider, setupUnitTestWatcherTimeouts, TestWallets, Wait } from "../../testutils";
import { SmartContractAbi } from "../abi";
import { Address } from "../../address";
import { assert } from "chai";
import { Interaction } from "./interaction";
import { GasLimit } from "../../networkParams";
import { ContractFunction } from "../function";
import { QueryResponse } from "../queryResponse";
import { Nonce } from "../../nonce";
import { TransactionStatus } from "../../transaction";
import { ReturnCode } from "../returnCode";
import { Argument } from "../arguments";
import { Balance } from "../../balance";

describe.only("test smart contract interactor", function () {
    let wallets = new TestWallets();
    let dummyAddress = new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");
    let checker = new StrictInteractionChecker();
    let provider = new MockProvider();
    let signer = wallets.alice.signer;
    let runner = new DefaultInteractionRunner(checker, signer, provider);

    it("should interact with 'answer'", async function () {
        setupUnitTestWatcherTimeouts();

        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/answer.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["answer"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let interactor = new SmartContractInteractor(contract, runner);

        let interaction = <Interaction>interactor.prepare().getUltimateAnswer().withGasLimit(new GasLimit(543210));
        assert.equal(interaction.getContract().getAddress(), dummyAddress);
        assert.deepEqual(interaction.getFunction(), new ContractFunction("getUltimateAnswer"));
        assert.lengthOf(interaction.getArguments(), 0);
        assert.deepEqual(interaction.getGasLimit(), new GasLimit(543210));

        provider.mockQueryResponseOnFunction("getUltimateAnswer", new QueryResponse({ returnData: ["Kg=="], returnCode: ReturnCode.Ok }));

        // Query
        let { values: queryValues, firstValue: queryAnwser, returnCode: queryCode } = await interaction.query();
        assert.lengthOf(queryValues, 1);
        assert.equal(queryAnwser.valueOf(), BigInt(42));
        assert.isTrue(queryCode.equals(ReturnCode.Ok));

        // Execute, do not wait for execution
        let transaction = await interaction.withNonce(new Nonce(0)).broadcast();
        assert.equal(transaction.getNonce().valueOf(), 0);
        assert.equal(transaction.getData().toString(), "getUltimateAnswer");
        assert.equal(transaction.getHash().toString(), "56fcf6984611afb8855f65f1ce40d86b5f62840a257b19f4a2a2c1620dd6a351");

        transaction = await interaction.withNonce(new Nonce(1)).broadcast();
        assert.equal(transaction.getNonce().valueOf(), 1);
        assert.equal(transaction.getHash().toString(), "acd207c38f6c3341b18d8ef331fa07ba49615fa12d7610aad5d8495293049f24");

        // Execute, and wait for execution
        let [, { values: executionValues, firstValue: executionAnswer, returnCode: executionCode }] = await Promise.all([
            provider.mockTransactionTimeline(
                interaction.getTransaction(),
                [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed"), new Wait(40), new AddImmediateResult("@6f6b@2b"), new MarkNotarized()]
            ),
            await interaction.withNonce(new Nonce(2)).broadcastAwaitExecution()
        ]);

        assert.lengthOf(executionValues, 1);
        assert.equal(executionAnswer.valueOf(), BigInt(43));
        assert.isTrue(executionCode.equals(ReturnCode.Ok));
    });

    it("should interact with 'counter'", async function () {
        setupUnitTestWatcherTimeouts();

        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/counter.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["counter"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let interactor = new SmartContractInteractor(contract, runner);

        let getInteraction = <Interaction>interactor.prepare().get();
        let incrementInteraction = (<Interaction>interactor.prepare().increment()).withGasLimit(new GasLimit(543210));
        let decrementInteraction = (<Interaction>interactor.prepare().decrement()).withGasLimit(new GasLimit(987654));

        // For "get()", return fake 7
        provider.mockQueryResponseOnFunction("get", new QueryResponse({ returnData: ["Bw=="], returnCode: ReturnCode.Ok }));

        // Query "get()"
        let { firstValue: counterValue } = await getInteraction.query();

        assert.equal(counterValue.valueOf(), BigInt(7));

        // Increment, wait for execution. Return fake 8
        let [, { firstValue: valueAfterIncrement }] = await Promise.all([
            provider.mockTransactionTimeline(
                incrementInteraction.getTransaction(),
                [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed"), new Wait(40), new AddImmediateResult("@6f6b@08"), new MarkNotarized()]
            ),
            await incrementInteraction.withNonce(new Nonce(14)).broadcastAwaitExecution()
        ]);

        assert.equal(valueAfterIncrement.valueOf(), BigInt(8));

        // Decrement three times (simulate three parallel broadcasts). Wait for execution of the latter (third transaction). Return fake "5".
        await decrementInteraction.withNonce(new Nonce(15)).broadcast();
        await decrementInteraction.withNonce(new Nonce(16)).broadcast();

        let [, { firstValue: valueAfterDecrement }] = await Promise.all([
            provider.mockTransactionTimeline(
                decrementInteraction.getTransaction(),
                [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed"), new Wait(40), new AddImmediateResult("@6f6b@05"), new MarkNotarized()]
            ),
            async function () {
                return await decrementInteraction.withNonce(new Nonce(17)).broadcastAwaitExecution();
            }()
        ]);

        assert.equal(valueAfterDecrement.valueOf(), BigInt(5));
    });

    it.only("should interact with 'lottery-egld'", async function () {
        setupUnitTestWatcherTimeouts();

        let abiRegistry = await new AbiRegistry().extendFromFile("src/testdata/lottery-egld.json");
        let abi = new SmartContractAbi(abiRegistry, ["default"], ["lottery-egld"]);
        let contract = new SmartContract({ address: dummyAddress, abi: abi });
        let interactor = new SmartContractInteractor(contract, runner);

        let startInteraction = <Interaction>interactor.prepare().start([
            Argument.fromUTF8("lucky"),
            Argument.fromBigInt(Balance.eGLD(1).valueOf()),
            Argument.fromMissingOptional(),
            Argument.fromMissingOptional(),
            Argument.fromProvidedOptional(new U32Value(1)),
            Argument.fromMissingOptional(),
            Argument.fromMissingOptional()
        ]).withGasLimit(new GasLimit(5000000));

        let lotteryExistsInteraction = <Interaction>interactor.prepare().lotteryExists([
            Argument.fromUTF8("lucky")
        ]).withGasLimit(new GasLimit(5000000));

        let getLotteryInfoInteraction = <Interaction>interactor.prepare().lotteryInfo([
            Argument.fromUTF8("lucky")
        ]).withGasLimit(new GasLimit(5000000));

        // start()
        let [, { returnCode: startReturnCode, values: startReturnvalues }] = await Promise.all([
            provider.mockTransactionTimeline(
                startInteraction.getTransaction(),
                [new TransactionStatus("executed"), new AddImmediateResult("@6f6b"), new MarkNotarized()]
            ),
            await startInteraction.withNonce(new Nonce(14)).broadcastAwaitExecution()
        ]);

        assert.equal(startInteraction.getTransaction().getData().toString(), "start@6c75636b79@0de0b6b3a7640000@@@0100000001@@");
        assert.isTrue(startReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(startReturnvalues, 0);

        // lotteryExists() (this is a view function, but for the sake of the test, we'll execute it)
        let [, { returnCode: existsReturnCode, values: existsReturnvalues, firstValue: existsFirstValue }] = await Promise.all([
            provider.mockTransactionTimeline(
                lotteryExistsInteraction.getTransaction(),
                [new TransactionStatus("executed"), new AddImmediateResult("@6f6b@01"), new MarkNotarized()]
            ),
            await lotteryExistsInteraction.withNonce(new Nonce(15)).broadcastAwaitExecution()
        ]);

        assert.equal(lotteryExistsInteraction.getTransaction().getData().toString(), "lotteryExists@6c75636b79");
        assert.isTrue(existsReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(existsReturnvalues, 1);
        assert.equal(existsFirstValue.valueOf(), true);

        // lotteryInfo() (this is a view function, but for the sake of the test, we'll execute it)
        let [, { returnCode: infoReturnCode, values: infoReturnvalues, firstValue: infoFirstValue }] = await Promise.all([
            provider.mockTransactionTimeline(
                getLotteryInfoInteraction.getTransaction(),
                [new TransactionStatus("executed"), new AddImmediateResult("@6f6b@000000080de0b6b3a764000000000320000000006012a806000000010000000164000000000000000000000000"), new MarkNotarized()]
            ),
            await getLotteryInfoInteraction.withNonce(new Nonce(16)).broadcastAwaitExecution()
        ]);

        assert.equal(getLotteryInfoInteraction.getTransaction().getData().toString(), "lotteryInfo@6c75636b79");
        assert.isTrue(infoReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(infoReturnvalues, 1);

        assert.deepEqual(infoFirstValue.valueOf(), {
            ticket_price: BigInt("1000000000000000000"),
            tickets_left: BigInt(800),
            deadline: BigInt("1611835398"),
            max_entries_per_user: BigInt(1),
            prize_distribution: [BigInt(100)],
            whitelist: [],
            current_ticket_number: BigInt(0),
            prize_pool: BigInt("0")
        });

        // TODO: will throw if bad params at start()
    });
});
