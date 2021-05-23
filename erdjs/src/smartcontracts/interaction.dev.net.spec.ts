import { StrictChecker } from "./strictChecker";
import { DefaultInteractionRunner } from "./defaultRunner";
import { SmartContract } from "./smartContract";
import { BigUIntValue, OptionValue, TypedValue, U32Value } from "./typesystem";
import { getDevnetProvider, loadAbiRegistry, loadContractCode, TestWallets } from "../testutils";
import { SmartContractAbi } from "./abi";
import { assert } from "chai";
import { Interaction } from "./interaction";
import { GasLimit } from "../networkParams";
import { ReturnCode } from "./returnCode";
import { Balance } from "../balance";
import BigNumber from "bignumber.js";
import { NetworkConfig } from "../networkConfig";
import { Account } from "../account";
import { BytesValue } from "./typesystem/bytes";


describe("test smart contract interactor", function () {
    let wallets = new TestWallets();
    let checker = new StrictChecker();
    let provider = getDevnetProvider();
    let alice = new Account(wallets.alice.address);
    let aliceSigner = wallets.alice.signer;
    let runner = new DefaultInteractionRunner(checker, aliceSigner, provider);

    it("should interact with 'answer' (local testnet)", async function () {
        this.timeout(60000);

        let abiRegistry = await loadAbiRegistry(["src/testdata/answer.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["answer"]);
        let contract = new SmartContract({ abi: abi });

        // Currently, this has to be called before creating any Interaction objects, 
        // because the Transaction objects created under the hood point to the "default" NetworkConfig.
        await NetworkConfig.getDefault().sync(provider);
        await alice.sync(provider);
        await deploy(contract, "src/testdata/answer.wasm", new GasLimit(3000000), []);

        let interaction = <Interaction>contract.methods.getUltimateAnswer().withGasLimit(new GasLimit(3000000));

        // Query
        let queryResponseBundle = await runner.runQuery(interaction);
        assert.lengthOf(queryResponseBundle.values, 1);
        assert.deepEqual(queryResponseBundle.firstValue.valueOf(), new BigNumber(42));
        assert.isTrue(queryResponseBundle.returnCode.equals(ReturnCode.Ok));

        // Execute, do not wait for execution
        await runner.run(interaction.withNonce(alice.getNonceThenIncrement()));
        // Execute, and wait for execution
        let executionResultsBundle = await runner.runAwaitExecution(interaction.withNonce(alice.getNonceThenIncrement()));

        assert.lengthOf(executionResultsBundle.values, 1);
        assert.deepEqual(executionResultsBundle.firstValue.valueOf(), new BigNumber(42));
        assert.isTrue(executionResultsBundle.returnCode.equals(ReturnCode.Ok));
    });

    it("should interact with 'counter' (local testnet)", async function () {
        this.timeout(120000);

        let abiRegistry = await loadAbiRegistry(["src/testdata/counter.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["counter"]);
        let contract = new SmartContract({ abi: abi });

        // Currently, this has to be called before creating any Interaction objects, 
        // because the Transaction objects created under the hood point to the "default" NetworkConfig.
        await NetworkConfig.getDefault().sync(provider);
        await alice.sync(provider);
        await deploy(contract, "src/testdata/counter.wasm", new GasLimit(3000000), []);

        let getInteraction = <Interaction>contract.methods.get();
        let incrementInteraction = (<Interaction>contract.methods.increment()).withGasLimit(new GasLimit(3000000));
        let decrementInteraction = (<Interaction>contract.methods.decrement()).withGasLimit(new GasLimit(3000000));

        // Query "get()"
        let { firstValue: counterValue } = await runner.runQuery(getInteraction);
        assert.deepEqual(counterValue.valueOf(), new BigNumber(1));

        // Increment, wait for execution.
        let { firstValue: valueAfterIncrement } = await runner.runAwaitExecution(incrementInteraction.withNonce(alice.getNonceThenIncrement()));
        assert.deepEqual(valueAfterIncrement.valueOf(), new BigNumber(2));

        // Decrement. Wait for execution of the second transaction.
        await runner.run(decrementInteraction.withNonce(alice.getNonceThenIncrement()));
        let { firstValue: valueAfterDecrement } = await runner.runAwaitExecution(decrementInteraction.withNonce(alice.getNonceThenIncrement()))
        assert.deepEqual(valueAfterDecrement.valueOf(), new BigNumber(0));
    });

    it("should interact with 'lottery_egld' (local testnet)", async function () {
        this.timeout(120000);

        let abiRegistry = await loadAbiRegistry(["src/testdata/lottery_egld.abi.json"]);
        let abi = new SmartContractAbi(abiRegistry, ["Lottery"]);
        let contract = new SmartContract({ abi: abi });

        // Currently, this has to be called before creating any Interaction objects, 
        // because the Transaction objects created under the hood point to the "default" NetworkConfig.
        await NetworkConfig.getDefault().sync(provider);
        await alice.sync(provider);
        await deploy(contract, "src/testdata/lottery_egld.wasm", new GasLimit(100000000), []);

        let startInteraction = <Interaction>contract.methods.start([
            BytesValue.fromUTF8("lucky"),
            new BigUIntValue(Balance.egld(1).valueOf()),
            OptionValue.newMissing(),
            OptionValue.newMissing(),
            OptionValue.newProvided(new U32Value(1)),
            OptionValue.newMissing(),
            OptionValue.newMissing(),
        ]).withGasLimit(new GasLimit(15000000));

        let lotteryStatusInteraction = <Interaction>contract.methods.status([
            BytesValue.fromUTF8("lucky")
        ]).withGasLimit(new GasLimit(15000000));

        let getLotteryInfoInteraction = <Interaction>contract.methods.lotteryInfo([
            BytesValue.fromUTF8("lucky")
        ]).withGasLimit(new GasLimit(15000000));

        // start()
        let { returnCode: startReturnCode, values: startReturnvalues } = await runner.runAwaitExecution(startInteraction.withNonce(alice.getNonceThenIncrement()))
        assert.isTrue(startReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(startReturnvalues, 0);

        // status()
        let { returnCode: statusReturnCode, values: statusReturnValues, firstValue: statusFirstValue } = await runner.runAwaitExecution(lotteryStatusInteraction.withNonce(alice.getNonceThenIncrement()))
        assert.isTrue(statusReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(statusReturnValues, 1);
        assert.equal(statusFirstValue.valueOf(), "Running");

        // lotteryInfo() (this is a view function, but for the sake of the test, we'll execute it)
        let { returnCode: infoReturnCode, values: infoReturnValues, firstValue: infoFirstValue } = await runner.runAwaitExecution(getLotteryInfoInteraction.withNonce(alice.getNonceThenIncrement()))
        assert.isTrue(infoReturnCode.equals(ReturnCode.Ok));
        assert.lengthOf(infoReturnValues, 1);

        // Ignore "deadline" field in our test
        let info = infoFirstValue.valueOf();
        delete info.deadline;

        assert.deepEqual(info, {
            ticket_price: new BigNumber("1000000000000000000"),
            tickets_left: new BigNumber(800),
            max_entries_per_user: new BigNumber(1),
            prize_distribution: Buffer.from([0x64]),
            whitelist: [],
            current_ticket_number: new BigNumber(0),
            prize_pool: new BigNumber("0")
        });
    });

    /**
     * Deploy is not currently supported by interactors yet.
     * We will deploy the contracts using the existing approach.
     */
    async function deploy(contract: SmartContract, path: string, gasLimit: GasLimit, initArguments: TypedValue[]): Promise<void> {
        let transactionDeploy = contract.deploy({
            code: await loadContractCode(path),
            gasLimit: gasLimit,
            initArguments: initArguments
        });

        // In these tests, all contracts are deployed by Alice.
        transactionDeploy.setNonce(alice.getNonceThenIncrement());
        await aliceSigner.sign(transactionDeploy);
        await transactionDeploy.send(provider);
        await transactionDeploy.awaitExecuted(provider);
    }
});
