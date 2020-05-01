import * as assert from "assert";
import { Address, Account, AccountSigner } from "./data/account";
import { Transaction, TransactionWatcher } from "./data/transaction";
import { SmartContractCall } from "./data/scCall";
import { Provider } from "./providers/interface";
import { ElrondProxy } from "./providers/elrondproxy";
import * as fs from "fs";

var ErrTestError1 = new Error("test error 1");
var ErrTestError2 = new Error("test error 1");

describe("Preliminary try-out code", async () => {
    it("should verify error equality", () => {
        let testfunc = () => {
            throw ErrTestError1;
        };

        assert.throws(testfunc, ErrTestError1);
    });
    it("should throw exception for invalid BigInts", () => {
        let testfunc = () => {
            let n = BigInt("oranges");
        };
        assert.throws(testfunc, SyntaxError);

        testfunc = () => {
            let n = BigInt("112oranges");
        };
        assert.throws(testfunc, SyntaxError);

        testfunc = () => {
            let n = BigInt("112oranges23");
        };
        assert.throws(testfunc, SyntaxError);
    });
});

describe("SmartContractCalls", () => {
    it("should add arguments properly", async () => {
        let txgen = getTxGenConfiguration();
        assert.ok(txgen.accounts.length >= 3, "not enough accounts in txgen");

        const proxy: Provider = new ElrondProxy({
            url: "http://zirconium:7950",
            timeout: 1000
        });
        const sender = await proxy.getAccount(txgen.accounts[1].pubKey);
        sender.setKeysFromRawData(txgen.accounts[1]);

        let scCall = new SmartContractCall(null);
        scCall.setFunctionName("transferToken");
        scCall.addRawArgument(sender.getAddressObject().hex());
        scCall.addBigIntArgument(BigInt(1024));

        console.log(scCall.getArguments());
    });
});

describe("Proxy", () => {
    it("should retrieve nonce of account", async () => {
        const proxy: Provider = new ElrondProxy({
            url: "http://zirconium:7950",
            timeout: 1000
        });

        let txgen = getTxGenConfiguration();
        let nAccounts = txgen.accounts.length;

        let minter = new Address(txgen.mintingAddress);
        let minterNonce = await proxy.getNonce(minter.toString());
        assert.deepStrictEqual(minterNonce, 2 * nAccounts + 1);
    });

    it("should retrieve VM values", async () => {
        const proxy: Provider = new ElrondProxy({
            url: "http://zirconium:7950",
            timeout: 1000
        });

        let txgen = getTxGenConfiguration();

        let address = new Address(txgen.accounts[2].pubKey);
        let value = await proxy.getVMValueQuery(txgen.scAddress, "balanceOf", [address.hex()]);

        assert.ok(value != null);
    });

    it("should transfer some ERD between accounts", async () => {
        const proxy: Provider = new ElrondProxy({
            url: "http://zirconium:7950",
            timeout: 1000
        });

        let txgen = getTxGenConfiguration();
        assert.ok(txgen.accounts.length >= 3, "not enough accounts in txgen");

        const sender = await proxy.getAccount(txgen.accounts[1].pubKey);
        sender.setKeysFromRawData(txgen.accounts[1]);

        const receiver = await proxy.getAccount(txgen.accounts[2].pubKey);
        receiver.setKeysFromRawData(txgen.accounts[2]);

        let senderBalanceBeforeTx = sender.getBalance();
        let receiverBalanceBeforeTx = receiver.getBalance()
        let initialDiff = senderBalanceBeforeTx - receiverBalanceBeforeTx;

        let transferValue = BigInt("25000000000000000000");
        let transactionCost = BigInt("5000000000000000000");

        // TODO this test requires tx status queries from the proxy, WIP

        // Send funds from sender to receiver
        let tx = new Transaction({
            sender: sender.getAddress(),
            receiver: receiver.getAddress(),
            value: transferValue.toString(),
            nonce: sender.getNonce(),
            gasPrice: "100000000000000",
            gasLimit: 50000,
            data: ""
        });

        let signer = new AccountSigner(sender);
        signer.sign(tx);
        
        let txHash = "";

        console.log('send tx');
        try {
            txHash = await proxy.sendTransaction(tx);
        } catch(err) {
            assert.fail(err);
        }

        let watcher = new TransactionWatcher(txHash, proxy);

        // Check transaction status
        console.log('check transaction status');
        try {
            let result = await watcher.awaitExecuted(2000, 20000);
            console.log('tx status executed:', result);
        } catch (err) {
            console.log(err);
            assert.fail(err);
        }

        console.log('update accounts');
        try {
            await sender.update();
            await receiver.update();
        } catch (err) {
            assert.fail(err);
        }

        console.log('before', senderBalanceBeforeTx);
        console.log('after', sender.getBalance());
        console.log('diff', sender.getBalance() - senderBalanceBeforeTx);
        assert.equal(
            (senderBalanceBeforeTx - transferValue - transactionCost).toString(), 
            sender.getBalance().toString()
        );

        assert.equal(
            (receiverBalanceBeforeTx + transferValue).toString(), 
            receiver.getBalance().toString()
        );

        // Send funds back, from receiver to sender, to bring their balances to
        // equal values
        tx = new Transaction({
            sender: receiver.getAddress(),
            receiver: sender.getAddress(),
            value: transferValue.toString(),
            nonce: receiver.getNonce(),
            gasPrice: 100000000000000,
            gasLimit: "50000",
            data: ""
        });

        signer = new AccountSigner(receiver);
        signer.sign(tx);

        console.log('send back transaction');
        try {
            txHash = await proxy.sendTransaction(tx);
        } catch(err) {
            assert.fail(err);
        }

        // Check transaction status
        watcher = new TransactionWatcher(txHash, proxy);
        console.log('check transaction status');
        try {
            let result = await watcher.awaitExecuted(2000, 20000);
            console.log('tx status executed:', result);
        } catch (err) {
            console.log(err);
            assert.fail(err);
        }

        // At the end, the sender and receiver should have equal balances 
        console.log('update accounts again');
        try {
            await sender.update();
            await receiver.update();
        } catch (err) {
            assert.fail(err);
        }
        
        let postDiff = sender.getBalance() - receiver.getBalance();
        assert.equal(initialDiff.toString(), postDiff.toString());
    });
});

function getTxGenConfiguration(): any {
    const txgenFolder = "/var/work/Elrond/testnet/txgen";

    const accountsDataFilename = txgenFolder + "/data/accounts.json";
    const scAddressFilename = txgenFolder + "/deployedSCAddress.txt";
    const minterAddressFilename = txgenFolder + "/minterAddress.txt";

    let accountsData = JSON.parse(fs.readFileSync(accountsDataFilename).toString());
    let accounts: any[] = [];
    for (let shard in accountsData) {
        accounts = accounts.concat(accountsData[shard]);
    }
    let scAddress = fs.readFileSync(scAddressFilename).toString();
    let mintingAddress = fs.readFileSync(minterAddressFilename).toString();

    let txgenConfig = {
        accounts: accounts,
        mintingAddress: mintingAddress,
        scAddress: scAddress
    };

    return txgenConfig;
}

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}
