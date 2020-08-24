// import * as assert from "assert";
// import { Account, AccountSigner } from "./account";
// import { Transaction, TransactionWatcher } from "./transaction";
// import { Provider } from "./interface";
// import { ElrondProxy } from "./elrondproxy";
// import { SmartContractCall } from "./smartcontracts/scCall";
// import { SmartContractDeploy } from "./smartcontracts/scDeploy";
// import { ElrondERC20Client } from "./smartcontracts/elrondERC20client";
// import * as fs from "fs";
// import { SmartContractBase } from "./smartcontracts/smartcontract";
// import { describe } from "mocha";

// import keccak from "keccak";

var DEFAULT_PROXY_ADDRESS = "http://localhost:7950";

// describe("Preliminary try-out code", async () => {
//     it("should throw exception for invalid BigInts", () => {
//         let testfunc = () => {
//             BigInt("oranges");
//         };
//         assert.throws(testfunc, SyntaxError);

//         testfunc = () => {
//             BigInt("112oranges");
//         };
//         assert.throws(testfunc, SyntaxError);

//         testfunc = () => {
//             BigInt("112oranges23");
//         };
//         assert.throws(testfunc, SyntaxError);
//     });

//     it("should make keccak hashing work", () => {
//         let hash = keccak('keccak256').update("albatrosses").digest();
//         assert.equal(32, hash.length);
//     });
// });

// describe.skip("SmartContractCalls", () => {
//     it("should add arguments properly", async () => {
//         let txgen = getTxGenConfiguration();
//         assert.ok(txgen.accounts.length >= 3, "not enough accounts in txgen");

//         const proxy: Provider = new ElrondProxy({
//             url: DEFAULT_PROXY_ADDRESS,
//             timeout: 1000
//         });

//         const sender = await proxy.getAccount(txgen.accounts[1].pubKey);
//         sender.setKeysFromRawData(txgen.accounts[1]);

//         const receiver = await proxy.getAccount(txgen.accounts[2].pubKey);
//         receiver.setKeysFromRawData(txgen.accounts[2]);
//     });
// });

// describe.skip("SmartContractDeployment", function() {
//     this.timeout(100000);
//     it("should deploy a SC", async () => {
//         let txgen = getTxGenConfiguration();
//         assert.ok(txgen.accounts.length >= 3, "not enough accounts in txgen");

//         const proxy: Provider = new ElrondProxy({
//             url: DEFAULT_PROXY_ADDRESS,
//             timeout: 1000
//         });

//         const user = await proxy.getAccount(txgen.accounts[1].pubKey);
//         user.setKeysFromRawData(txgen.accounts[1]);

//         // to run this test correct this path with your pc path
//         let codeFilename = "/home/work/elrond-sdk/demo-dapps/erc20/smartcontract/erc20.wasm";
//         let code = fs.readFileSync(codeFilename).toString('hex');

//         let deployment = new SmartContractDeploy();
//         deployment.setCode(code);
//         deployment.addBigIntArgument(BigInt(512));

//         let chainID = await proxy.getChainID();
//         let version = await proxy.getMinTransactionVersion()

//         let smartContract = new SmartContractBase(proxy, null, user, chainID, version);
//         smartContract.enableSigning(true);
//         smartContract.setGasPrice(100000000000000);
//         smartContract.setGasLimit(7e8);
//         await smartContract.performDeployment(deployment);
//         console.log(smartContract.getAddress());
//     });
// });

// describe.skip("ERC20 client", () => {
//     it("should transferToken", async () => {
//         let txgen = getTxGenConfiguration();
//         assert.ok(txgen.accounts.length >= 3, "not enough accounts in txgen");

//         const proxy: Provider = new ElrondProxy({
//             url: DEFAULT_PROXY_ADDRESS,
//             timeout: 1000
//         });

//         const user = await proxy.getAccount(txgen.accounts[1].pubKey);
//         const sender = user;
//         user.setKeysFromRawData(txgen.accounts[1]);

//         const receiver = await proxy.getAccount(txgen.accounts[2].pubKey);
//         receiver.setKeysFromRawData(txgen.accounts[2]);

//         let chainID = await proxy.getChainID();
//         let version = await proxy.getMinTransactionVersion()

//         let scAddress = new Address(txgen.scAddress);
//         let erc20 = new ElrondERC20Client(proxy, scAddress, user, chainID, version);
//         erc20.enableSigning(true);

//         erc20.setGasPrice(100000000000000);
//         erc20.setGasLimit(7e6);
//         let call = await erc20.transfer(receiver.getAddressObject().hex(), BigInt(25));
//         console.log("erc20 transfer status:", call.getStatus());
//     });

//     it("should interact with an ERC20 smartcontract properly", async () => {
//         let txgen = getTxGenConfiguration();
//         assert.ok(txgen.accounts.length >= 3, "not enough accounts in txgen");

//         const proxy: Provider = new ElrondProxy({
//             url: DEFAULT_PROXY_ADDRESS,
//             timeout: 1000
//         });

//         const user = await proxy.getAccount(txgen.accounts[1].pubKey);
//         const sender = user;
//         user.setKeysFromRawData(txgen.accounts[1]);

//         let chainID = await proxy.getChainID();
//         let version = await proxy.getMinTransactionVersion()

//         let scAddress = new Address(txgen.scAddress);
//         let erc20 = new ElrondERC20Client(proxy, scAddress, user, chainID, version);
//         erc20.enableSigning(true);

//         const receiver = await proxy.getAccount(txgen.accounts[2].pubKey);
//         receiver.setKeysFromRawData(txgen.accounts[2]);


//         // Query total supply
//         let totalSupply = await erc20.totalSupply();
//         console.log(totalSupply);

//         console.log("address of sender:\t", sender.getAddress());
//         console.log("address of receiver:\t", receiver.getAddress());

//         console.log("address (hex) of sender:\t", sender.getAddressObject().hex());
//         console.log("address (hex) of receiver:\t", receiver.getAddressObject().hex());

//         // Query the token balance of the accounts
//         let balanceOfSender = await erc20.balanceOf(sender.getAddressObject().hex());
//         console.log("balance of sender:\t", balanceOfSender);

//         let balanceOfReceiver = await erc20.balanceOf(receiver.getAddressObject().hex());
//         console.log("balance of receiver:\t", balanceOfReceiver);

//         // Send some tokens
//         console.log("performing ERC20 transfer");
//         let initialDiff = Math.abs(Number(balanceOfSender - balanceOfReceiver));
//         console.log('initialDiff:\t', initialDiff);

//         let transferValue = 25;
//         erc20.setGasPrice(100000000000000);
//         erc20.setGasLimit(7e6);
//         let call = await erc20.transfer(receiver.getAddressObject().hex(), BigInt(transferValue));
//         console.log("erc20 transfer status:", call.getStatus());

//         // Verify transfer
//         balanceOfSender = await erc20.balanceOf(sender.getAddressObject().hex());
//         balanceOfReceiver = await erc20.balanceOf(receiver.getAddressObject().hex());
//         let diff = Math.abs(Number(balanceOfSender - balanceOfReceiver));
//         console.log("balance of sender:\t", balanceOfSender);
//         console.log("balance of receiver:\t", balanceOfReceiver);
//         console.log("difference:\t", diff);
//         assert.equal(
//             Number(initialDiff + 2 * transferValue),
//             diff
//         );

//         // Send some tokens back
//         console.log("performing ERC20 transfer");
//         erc20 = new ElrondERC20Client(proxy, scAddress, receiver, chainID, version);
//         erc20.enableSigning(true);

//         erc20.setGasPrice(100000000000000);
//         erc20.setGasLimit(7e6);
//         call = await erc20.transfer(sender.getAddressObject().hex(), BigInt(transferValue));
//         console.log("erc20 transfer status:", call.getStatus());

//         // Verify transfer
//         balanceOfSender = await erc20.balanceOf(sender.getAddressObject().hex());
//         balanceOfReceiver = await erc20.balanceOf(receiver.getAddressObject().hex());
//         diff = Math.abs(Number(balanceOfSender - balanceOfReceiver));
//         console.log("balance of sender:\t", balanceOfSender);
//         console.log("balance of receiver:\t", balanceOfReceiver);
//         console.log("difference:\t", diff);
//         assert.equal(
//             Number(initialDiff),
//             Math.abs(Number(balanceOfSender - balanceOfReceiver))
//         );
//     });
// });

// describe.skip("Proxy", () => {
//     it("should retrieve nonce of account", async () => {
//         const proxy: Provider = new ElrondProxy({
//             url: DEFAULT_PROXY_ADDRESS,
//             timeout: 1000
//         });

//         let txgen = getTxGenConfiguration();
//         let nAccounts = txgen.accounts.length;

//         let minter = new Address(txgen.mintingAddress);
//         let minterNonce = await proxy.getNonce(minter.toString());
//         assert.deepStrictEqual(minterNonce, 2 * nAccounts + 2);
//     });

//     it("should retrieve VM values", async () => {
//         const proxy: Provider = new ElrondProxy({
//             url: DEFAULT_PROXY_ADDRESS,
//             timeout: 1000
//         });

//         let txgen = getTxGenConfiguration();

//         let address = new Address(txgen.accounts[2].pubKey);
//         let value = await proxy.getVMValueQuery(txgen.scAddress, "balanceOf", [address.hex()]);

//         assert.ok(value != null);
//     });

//     it("should transfer some ERD between accounts", async () => {
//         const proxy: Provider = new ElrondProxy({
//             url: DEFAULT_PROXY_ADDRESS,
//             timeout: 1000
//         });

//         let txgen = getTxGenConfiguration();
//         assert.ok(txgen.accounts.length >= 3, "not enough accounts in txgen");

//         const sender = await proxy.getAccount(txgen.accounts[1].pubKey);
//         sender.setKeysFromRawData(txgen.accounts[1]);

//         const receiver = await proxy.getAccount(txgen.accounts[2].pubKey);
//         receiver.setKeysFromRawData(txgen.accounts[2]);

//         let senderBalanceBeforeTx = sender.getBalance();
//         let receiverBalanceBeforeTx = receiver.getBalance();
//         let initialDiff = senderBalanceBeforeTx - receiverBalanceBeforeTx;

//         let transferValue = BigInt("25000000000000000000");
//         let transactionCost = BigInt("5000000000000000000");

//         // TODO this test requires tx status queries from the proxy, WIP

//         // Send funds from sender to receiver
//         let tx = new Transaction({
//             sender: sender.getAddress(),
//             receiver: receiver.getAddress(),
//             value: transferValue.toString(),
//             nonce: sender.getNonce(),
//             gasPrice: "100000000000000",
//             gasLimit: 50000,
//             data: ""
//         });

//         let signer = new AccountSigner(sender);
//         signer.sign(tx);

//         let txHash = "";

//         console.log('send tx');
//         try {
//             txHash = await proxy.sendTransaction(tx);
//             console.log('transaction hash', txHash);
//         } catch (err) {
//             assert.fail(err);
//         }

//         let watcher = new TransactionWatcher(txHash, proxy);

//         // Check transaction status
//         console.log('check transaction status');
//         try {
//             await watcher.awaitExecuted(1000, 20000);
//             console.log('tx executed');
//         } catch (err) {
//             console.log(err);
//             assert.fail(err);
//         }

//         console.log('update accounts');
//         try {
//             await sender.update();
//             await receiver.update();
//         } catch (err) {
//             assert.fail(err);
//         }

//         console.log('before', senderBalanceBeforeTx);
//         console.log('after', sender.getBalance());
//         console.log('diff', sender.getBalance() - senderBalanceBeforeTx);
//         assert.equal(
//             (senderBalanceBeforeTx - transferValue - transactionCost).toString(),
//             sender.getBalance().toString()
//         );

//         assert.equal(
//             (receiverBalanceBeforeTx + transferValue).toString(),
//             receiver.getBalance().toString()
//         );

//         // Send funds back, from receiver to sender, to bring their balances to
//         // equal values
//         tx = new Transaction({
//             sender: receiver.getAddress(),
//             receiver: sender.getAddress(),
//             value: transferValue.toString(),
//             nonce: receiver.getNonce(),
//             gasPrice: 100000000000000,
//             gasLimit: "50000",
//             data: ""
//         });

//         signer = new AccountSigner(receiver);
//         signer.sign(tx);

//         console.log('send back transaction');
//         try {
//             txHash = await proxy.sendTransaction(tx);
//             console.log('transaction hash', txHash);
//         } catch (err) {
//             assert.fail(err);
//         }

//         // Check transaction status
//         watcher = new TransactionWatcher(txHash, proxy);
//         console.log('check transaction status');
//         try {
//             await watcher.awaitExecuted(1000, 20000);
//             console.log('tx executed');
//         } catch (err) {
//             console.log(err);
//             assert.fail(err);
//         }

//         // At the end, the sender and receiver should have equal balances 
//         console.log('update accounts again');
//         try {
//             await sender.update();
//             await receiver.update();
//         } catch (err) {
//             assert.fail(err);
//         }

//         let postDiff = sender.getBalance() - receiver.getBalance();
//         assert.equal(initialDiff.toString(), postDiff.toString());
//     });
// });


// function getTxGenConfiguration(): any {
//     const txgenFolder = "/home/work/ElrondNetwork/elrond-txgen-go/cmd/txgen/";

//     const accountsDataFilename = txgenFolder + "/data/accounts-basic.json";
//     const scAddressFilename = txgenFolder + "/deployedSCAddress.txt";
//     const minterAddressFilename = txgenFolder + "/minterAddress.txt";

//     let accountsData = JSON.parse(fs.readFileSync(accountsDataFilename).toString());
//     let accounts: any[] = [];
//     for (let shard in accountsData) {
//         accounts = accounts.concat(accountsData[shard]);
//     }
//     let scAddress = fs.readFileSync(scAddressFilename).toString();
//     let mintingAddress = fs.readFileSync(minterAddressFilename).toString();

//     let txgenConfig = {
//         accounts: accounts,
//         mintingAddress: mintingAddress,
//         scAddress: scAddress
//     };

//     return txgenConfig;
// }
