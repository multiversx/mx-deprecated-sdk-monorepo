import * as assert from "assert";
import axios, { AxiosResponse } from "axios";
import * as core from "./core";
import { Account } from "./data/account";
import { Provider, ElrondProxy } from "./providers/elrondproxy";
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
    it("should retrieve accounts", async () => {
        const proxy: Provider = new ElrondProxy({
            url: "http://zirconium:7950",
            timeout: 1000
        });

        let account = await proxy.getAccount("new_account");

        // TODO this assertion is misleading, because both 'expected' and
        // 'actual' are produced by the same code (constructor of Account),
        // just the inputs have different sources (proxy response vs literal
        // object)
        let expectedAccount = new Account({
            address: "new_account",
            nonce: 5,
            balance: '12',
            code: "",
            codeHash: "",
            rootHash: "",
        });
        console.log(expectedAccount);
        console.log(account);
        assert.deepStrictEqual(account, expectedAccount);

        let balance = await proxy.getBalance("new_account");
        assert.deepStrictEqual(balance, BigInt(12));

        let nonce = await proxy.getNonce("new_account");
        assert.deepStrictEqual(nonce, 5);
    });

    it("should retrieve VM values", async () => {
        const proxy: Provider = new ElrondProxy({
            url: "http://zirconium:7950",
            timeout: 1000
        });

        let txgen = getTxGenConfiguration();

        let accountAddress = txgen.accounts[2].pubKey;
        let addressAsHex = core.erdAddressToHex(accountAddress);
        let value = await proxy.getVMValueQuery(txgen.scAddress, "balanceOf", [addressAsHex]);
        console.log(value);
    });
});

function getTxGenConfiguration(): any {
    const txgenFolder = "/var/work/Elrond/testnet/txgen";

    const accountsDataFilename = txgenFolder + "/data/accounts.json";
    const scAddressFilename = txgenFolder + "/deployedSCAddress.txt";

    let accountsData = JSON.parse(fs.readFileSync(accountsDataFilename).toString());
    let accounts = accountsData["0"];
    let mintingAccount = accounts[0];
    let scAddress = fs.readFileSync(scAddressFilename).toString();

    return {
        accounts: accounts,
        mintingAccount: mintingAccount,
        scAddress: scAddress
    };
}
