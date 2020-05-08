"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const erdjs = require("erdjs");
var Accounts = null;
var ERC20Address = "";
var CallbackURL = "";
const Proxy = new erdjs.ElrondProxy({
    url: "http://zirconium:7950",
    timeout: 1000
});
$(document).ready(() => __awaiter(void 0, void 0, void 0, function* () {
    yield initialize();
    $('#Sign').click(() => {
        if (CallbackURL != "") {
            window.location.href = CallbackURL;
        }
    });
    let txArgs = parseTxArgsFromUrl();
    let sender = yield Proxy.getAccount(txArgs.sender);
    let transaction = yield prepareTx(sender, txArgs);
    txArgs.nonce = transaction.getNonce();
    let account = getAccount(sender.getAddress());
    console.log('account', account);
    sender.setKeysFromRawData(account);
    let signer = new erdjs.AccountSigner(sender);
    signer.sign(transaction);
    console.log(transaction);
    txArgs.txHash = "";
    console.log('send tx');
    try {
        txArgs.txHash = yield Proxy.sendTransaction(transaction);
        console.log('transaction hash', txArgs.txHash);
    }
    catch (err) {
        console.error(err);
    }
    console.log(txArgs.txHash);
    CallbackURL = prepareCallbackUrl(txArgs, true);
    console.log(CallbackURL);
}));
function getAccount(publicKey) {
    console.log(Accounts);
    if (Accounts == null) {
        return null;
    }
    for (let account of Accounts) {
        if (account.pubKey == publicKey) {
            return account;
        }
    }
    return null;
}
function getAccounts() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            $.ajax({
                'url': '/static/accounts.json',
                'dataType': 'json',
                'cache': false,
                'success': function (accountsData) {
                    let accounts = [];
                    for (let shard in accountsData) {
                        accounts = accounts.concat(accountsData[shard]);
                    }
                    resolve(accounts);
                },
                'error': function (request, text, err) {
                    console.log(request);
                    console.log(text);
                    console.log(err);
                    reject(err);
                }
            });
        });
    });
}
function getERC20Address() {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            $.ajax({
                'url': '/static/deployedSCAddress.txt',
                'dataType': 'text',
                'cache': false,
                'success': function (scAddress) {
                    resolve(scAddress);
                },
                'error': function (request, text, err) {
                    console.log(request);
                    console.log(text);
                    console.log(err);
                    reject(err);
                }
            });
        });
    });
}
function initialize() {
    return __awaiter(this, void 0, void 0, function* () {
        Accounts = yield getAccounts();
        ERC20Address = yield getERC20Address();
    });
}
function parseTxArgsFromUrl() {
    var url = new URL(window.location.href);
    var txArgs = {};
    url.searchParams.forEach((value, key) => {
        txArgs[key.trim()] = value.trim();
    });
    return txArgs;
}
function prepareTx(sender, txArgs) {
    return __awaiter(this, void 0, void 0, function* () {
        txArgs.nonce = sender.getNonce();
        txArgs.gasPrice = 100000000000000;
        return new erdjs.Transaction(txArgs);
    });
}
function prepareCallbackUrl(txArgs, success) {
    let url = new URL(txArgs.callbackUrl);
    url.searchParams.set("success", success.toString());
    url.searchParams.set("txHash", txArgs.txHash);
    url.searchParams.set("nonce", txArgs.nonce);
    return url.toString();
}
//# sourceMappingURL=main.js.map