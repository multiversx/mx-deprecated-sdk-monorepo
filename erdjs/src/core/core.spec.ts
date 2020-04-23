import * as assert from "assert";
import axios, { AxiosResponse } from "axios";
import { Address, Account, AccountSigner } from "./data/account";
import { Transaction } from "./data/transaction";
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

        // TODO this test requires tx status queries from the proxy, WIP

        // At first, the sender and receiver have equal balances (due to txgen
        // minting)
        console.log(senderBalanceBeforeTx, receiverBalanceBeforeTx);
        assert.equal(senderBalanceBeforeTx, receiverBalanceBeforeTx);

        // Send funds from sender to receiver
        let tx = new Transaction({
            sender: sender.getAddress(),
            receiver: receiver.getAddress(),
            value: "25",
            nonce: sender.getNonce(),
            gasPrice: "100000000000000",
            gasLimit: 50001,
            data: ""
        });

        console.log('signing tx...');

        let signer = new AccountSigner(sender);
        signer.sign(tx);

        console.log('sending tx...');
        try {
            let response = await proxy.sendTransaction(tx);
            console.log(response);
        } catch(err) {
            console.log(err);
            assert.fail(err);
        }

        try {
            await sender.update();
            await receiver.update();
        } catch (err) {
            assert.fail(err);
        }

        // Send funds back, from receiver to sender, to bring their balances to
        // equal values
        tx = new Transaction({
            sender: receiver.getAddress(),
            receiver: sender.getAddress(),
            value: "25",
            nonce: receiver.getNonce(),
            gasPrice: 100000000000000,
            gasLimit: "50001",
            data: ""
        });

        signer = new AccountSigner(receiver);
        signer.sign(tx);

        try {
            let response = await proxy.sendTransaction(tx);
            console.log(response);
        } catch(err) {
            console.log(err);
            assert.fail(err);
        }

        // At the end, the sender and receiver should have equal balances 
        try {
            await sender.update();
            await receiver.update();
        } catch (err) {
            assert.fail(err);
        }
        console.log(sender.getBalance(), receiver.getBalance());
        assert.equal(sender.getBalance(), receiver.getBalance());
    });
});

function getTxGenConfiguration(): any {
    const txgenFolder = "/var/work/Elrond/testnet/txgen";

    const accountsDataFilename = txgenFolder + "/data/accounts.json";
    const scAddressFilename = txgenFolder + "/deployedSCAddress.txt";
    const minterAddressFilename = txgenFolder + "/minterAddress.txt";

    let accountsData = JSON.parse(fs.readFileSync(accountsDataFilename).toString());
    let accounts = accountsData["0"];
    let scAddress = fs.readFileSync(scAddressFilename).toString();
    let mintingAddress = fs.readFileSync(minterAddressFilename).toString();

    return {
        accounts: accounts,
        mintingAddress: mintingAddress,
        scAddress: scAddress
    };
}
