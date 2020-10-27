
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
