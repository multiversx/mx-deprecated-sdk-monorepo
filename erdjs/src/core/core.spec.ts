import * as assert from "assert";
import axios, { AxiosResponse } from "axios";
import { Address, Account } from "./data/account";
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
});

describe("Proxy", () => {
    it("should retrieve nonce of account", async () => {
        const proxy: Provider = new ElrondProxy({
            url: "http://zirconium:7950",
            timeout: 1000
        });

        let txgen = getTxGenConfiguration();
        let nAccounts = txgen.accounts.length;
        console.log("txgen accounts: " + nAccounts.toString());

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

        const sender = new Address(txgen.accounts[1].pubKey);
        const receiver = new Address(txgen.accounts[2].pubKey);

        // At first, the sender and receiver have equal balances (due to txgen
        // minting)
        let senderBalance = await proxy.getBalance(sender.toString());
        let receiverBalance = await proxy.getBalance(receiver.toString());
        assert.equal(senderBalance, receiverBalance);
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
