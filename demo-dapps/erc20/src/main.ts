import * as erc20 from "./erc20";
import * as erdjs from "erdjs";

declare var $: any;
var UserAddress: any = null;
var TransferTokenForm: any = null;
var TransferTokenReceiver: any = null;
var TransferTokenAmount: any = null;
var TransferTokenSubmit: any = null;
var RecentTransactionsList: any = null;


$(document).ready(async function() {
    UserAddress = $('#UserAddress');
    TransferTokenReceiver = $('#TransferTokenReceiver');
    TransferTokenAmount = $('#TransferTokenAmount');
    TransferTokenSubmit = $('#TransferTokenSubmit');
    TransferTokenForm = $('#TransferTokenForm');
    RecentTransactionsList = $('#RecentTransactionsList');

    let erc20address = await getERC20Address();
    erc20.SetERC20Address(erc20address);

    setKeydownEnter(UserAddress, function() {
        initialize("");
    });

    UserAddress.on('blur', function() {
        /* initialize(); */
    });

    setKeydownEnter(TransferTokenReceiver, function() {
        TransferTokenAmount.focus();
    });

    TransferTokenForm.on('submit', async function(ev: Event) {
        ev.preventDefault();
        await performTransfer();
        return false;
    });

    setKeydownEnter(TransferTokenAmount, function() {
        TransferTokenForm.submit();
    });

    initializeFromUrl();
});


async function performTransfer() {
    var receiver = TransferTokenReceiver.val();
    var amount = BigInt(TransferTokenAmount.val());
    let call = await erc20.CreateERC20Transfer(receiver, amount);
    let walletUrl = erc20.CreateWalletURL(call);
    console.log(walletUrl);
    erc20.persistTransaction(call.getPlain());
    window.location.href = walletUrl;
}



function initialize(userAddress: string) {
    if (userAddress == "") {
        userAddress = UserAddress.val();
    }
    console.log("user address", userAddress);
    erc20.SetUserAddress(userAddress);
    updateUserAccountInfo().then(info => {
        updateUserTokenBalance();
        updateTotalSupply();
        setTransferFormStatus(true);
        renderRecentTransactions();
    });
}

function initializeFromUrl() {
    console.log(window.location);
    console.log(window.location.href);
    let url = new URL(window.location.href);

    var sender = "";
    var urlSender = url.searchParams.get('sender');
    if (urlSender != null) {
        sender = urlSender
        console.log('sender from url', sender);
        UserAddress.val(sender);
        erc20.SetUserAddress(sender);
        updateTransactionFromUrl();
    }

    initialize(sender);
}


function updateTransactionFromUrl() {
    let url = new URL(window.location.href);
    if (!url.searchParams.has('txHash')) {
        return null;
    }
    let txHash = url.searchParams.get('txHash');
    let nonce = Number(url.searchParams.get('nonce')) - 1;
    let success = url.searchParams.get('success');
    
    console.log('nonce', nonce);
    let transaction = erc20.retrieveTransaction(nonce);
    transaction.hash = txHash;
    erc20.persistTransaction(transaction);
}

function updateUserAccountInfo(): Promise<any> {
    return erc20.UpdateUserAccount().then(info => {
        console.log(info);
        $('#UserBalance').text(info.balance.toString());
        $('#UserNonce').text(info.nonce);
        return info;
    });
}

function updateUserTokenBalance() {
    erc20.GetUserTokenBalance().then(tokenBalance => {
        console.log('token balance:', tokenBalance);
        $('#UserTokenBalance').text(tokenBalance.toString());
    });
}


function updateTotalSupply() {
        erc20.GetERC20TotalSupply().then(totalSupply => {
            $('#ERC20TotalSupply').text(totalSupply.toString());
        });
}


function setTransferFormStatus(status: boolean) {
    TransferTokenReceiver.prop('disabled', !status);
    TransferTokenAmount.prop('disabled', !status);
    TransferTokenSubmit.prop('disabled', !status);
}


function setKeydownEnter(element: any, callback: any) {
    element.on('keydown', function(ev: any) {
        if (ev.key == "Enter") {
            ev.preventDefault();
            callback();
        }
    });
}


function renderRecentTransactions() {
    RecentTransactionsList.empty();
    let transactionsStore = erc20.retrieveUserTransactionsStore(null);
    let transactionsList: any[] = Object.keys(transactionsStore).map(key => {
        return transactionsStore[key];
    });
    console.log(transactionsList);

    for (let transaction of transactionsList) {
        RecentTransactionsList.append(renderTransaction(transaction));
    }
}

function renderTransaction(transaction: any): any {
    let args = (transaction.data as string).split("@");
    var funcName = args[0];
    var erc20receiver = new erdjs.Address("");
    erc20receiver.fromHex(args[1]);
    var erc20value = BigInt('0x' + args[2]);

    var cell: any; 
    var row1 = $('<div class="row"/>');
    var row2 = $('<div class="row"/>');

    cell = $('<div class="col"/>').text('Nonce ' + transaction.nonce + ', hash ' + transaction.hash);
    row1.append(cell);

    cell = $('<div class="col-md-6"/>').text('To ' + erc20receiver.toString());
    row2.append(cell);

    cell = $('<div class="col-md-3"/>').text(erc20value.toString() + ' tokens');
    row2.append(cell);

    cell = $('<div class="col-md-3"/>').text('[' + funcName + ']');
    row2.append(cell);

    var renderedTx = $('<li class="transaction mb-3"/>');
    renderedTx.append(row1);
    renderedTx.append(row2);

    return renderedTx;
}


async function getERC20Address(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        $.ajax({
            'url': '/static/deployedSCAddress.txt',
            'dataType': 'text',
            'cache': false,
            'success': function(scAddress: string) {
                resolve(scAddress.replace(/^\s+|\s+$/g, ''));
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
