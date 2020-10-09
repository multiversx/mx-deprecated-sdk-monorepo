import { Address, Balance, TransactionPayload, ProxyProvider, NetworkConfig, Transaction, NullSigner, SimpleSigner, GasLimit, Account } from "@elrondnetwork/erdjs";
import { Err } from "@elrondnetwork/erdjs/out/errors";

declare var $: any;

$(async function () {
    let signer = new NullSigner();
    let provider = new ProxyProvider(getProxyUrl());
    let account = new Account(new Address());
    let transaction = new Transaction();

    try {
        NetworkConfig.getDefault().sync(provider);
    } catch (error) {
        onError(error);
    }

    $("#LoadAccountButton").click(async function () {
        try {
            signer = new SimpleSigner(getPrivateKey());
            account = new Account(signer.getAddress());
            await account.sync(provider);

            $("#AccountAddress").text(account.address.bech32());
            $("#AccountNonce").text(account.nonce.value);
            $("#AccountBalance").text(account.balance.formatted());
        } catch (error) {
            onError(error);
        }
    });

    $("#PrepareButton").click(async function () {
        let receiver = getReceiver();
        let value = getTransferValue();
        let memo = getTransferMemo();
        let gasLimit = GasLimit.forTransfer(memo);

        transaction = new Transaction({
            nonce: account.nonce,
            receiver: receiver,
            value: value,
            data: memo,
            gasLimit: gasLimit
        });

        displayObject("PreparedTransactionContainer", transaction.toPlainObject());
    });

    $("#SignButton").click(async function () {
        try {
            signer = new SimpleSigner(getPrivateKey());
            signer.sign(transaction);
            displayObject("SignedTransactionContainer", transaction.toPlainObject());
        } catch (error) {
            onError(error);
        }
    });

    $("#BroadcastButton").click(async function () {
        try {
            let transactionHash = await transaction.send(provider);
            displayObject("BroadcastedTransactionContainer", transactionHash);
        } catch (error) {
            onError(error);
        }
    });

    $("#QueryButton").click(async function () {
        try {
            await transaction.query(provider);
            displayObject("QueriedTransactionContainer", transaction.queryLocally());
        } catch (error) {
            onError(error);
        }
    });
});

function onError(error: Error) {
    let html = Err.html(error);
    $("#ErrorModal .error-text").html(html);
    $("#ErrorModal").modal("show");
}

function getProxyUrl(): string {
    return $("#ProxyInput").val();
}

function getReceiver(): Address {
    let receiverInput = $("#ReceiverInput").val();
    return new Address(receiverInput);
}

function getTransferValue(): Balance {
    let valueInput = Number($("#ValueInput").val());
    let balance = Balance.eGLD(valueInput);
    return balance;
}

function getTransferMemo(): TransactionPayload {
    let memoInput = $("#MemoInput").val();
    return new TransactionPayload(memoInput);
}

function getPrivateKey(): string {
    return $("#PrivateKeyInput").val().trim();
}

function displayObject(container: string, obj: any) {
    let json = JSON.stringify(obj, null, 4);
    $(`#${container}`).html(json);
}