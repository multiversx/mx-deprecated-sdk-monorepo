import * as erdjs from "erdjs";
declare var $: any;


var Accounts: any = null;
var ERC20Address: string = "";


var CallbackURL: string = "";

var DEFAULT_PROXY_ADDRESS =  "http://localhost:7950"

const Proxy = new erdjs.ElrondProxy({
    url: DEFAULT_PROXY_ADDRESS,
    timeout: 1000
});

$(document).ready(async () => {
    await initialize();

    $('#Sign').click(() => {
        if (CallbackURL != "") {
            window.location.href = CallbackURL;
        }
    });

    let txArgs = parseTxArgsFromUrl();
    let sender = await Proxy.getAccount(txArgs.sender);
    let transaction = await prepareTx(sender, txArgs);
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
        txArgs.txHash = await Proxy.sendTransaction(transaction);
        console.log('transaction hash', txArgs.txHash);
    } catch(err) {
        console.error(err);
    }

    console.log(txArgs.txHash);

    CallbackURL = prepareCallbackUrl(txArgs, true);
    console.log(CallbackURL);
});


function getAccount(publicKey: string): any {
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


async function getAccounts(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        $.ajax({
            'url': '/static/accounts.json',
            'dataType': 'json',
            'cache': false,
            'success': function(accountsData: any) {
                let accounts: any[] = [];
                for (let shard in accountsData) {
                    accounts = accounts.concat(accountsData[shard]);
                }

                resolve(accounts);
            },
            'error': function(request: any, text: string, err: any) {
                console.log(request);
                console.log(text);
                console.log(err);
                reject(err);
            }
        });
    });
}


async function getERC20Address(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        $.ajax({
            'url': '/static/deployedSCAddress.txt',
            'dataType': 'text',
            'cache': false,
            'success': function(scAddress: string) {
                resolve(scAddress);
            },
            'error': function(request: any, text: string, err: any) {
                console.log(request);
                console.log(text);
                console.log(err);
                reject(err);
            }
        });
    });
}


async function initialize(): Promise<void> {
    Accounts = await getAccounts();
    ERC20Address = await getERC20Address();
}


function parseTxArgsFromUrl(): any {
    var url = new URL(window.location.href);
    var txArgs: any = {};
    url.searchParams.forEach((value, key) => {
        txArgs[key.trim()] = value.trim();
    });
    return txArgs;
}


async function prepareTx(sender: erdjs.Account, txArgs: any): Promise<erdjs.Transaction> {
    txArgs.nonce = sender.getNonce();
    txArgs.gasPrice = 100000000000000;
    return new erdjs.Transaction(txArgs);
}


function prepareCallbackUrl(txArgs: any, success: boolean): string {
    let url = new URL(txArgs.callbackUrl);
    url.searchParams.set("success", success.toString());
    url.searchParams.set("txHash", txArgs.txHash);
    url.searchParams.set("nonce", txArgs.nonce);
    return url.toString();
}


