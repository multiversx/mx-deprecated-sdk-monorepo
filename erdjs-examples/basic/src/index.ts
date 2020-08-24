import { Address, Balance, TransactionPayload, ProxyProvider, NetworkConfig, Transaction, NullSigner } from "@elrondnetwork/erdjs";

declare var $: any;

$(async function () {
    let signer = new NullSigner();
    let provider = new ProxyProvider(getProxyUrl());
    let transaction = new Transaction();

    $("#PrepareButton").click(async function () {
        NetworkConfig.Default.sync(provider);

        transaction = new Transaction({
            receiver: getReceiver(),
            value: getTransferValue(),
            data: getTransferMemo()
        });

        let prepared = transaction.getAsSendable();
        displayObject("PreparedTransactionContainer", prepared);
    });

    $("#SignButton").click(async function () {

    });

    $("#BroadcastButton").click(async function () {

    });
});

function getProxyUrl(): string {
    return $("#ProxyInput").val();
}

function getSender(): Address {
   // let privateKey =
}

function getReceiver(): Address {
    let receiverInput = $("#ReceiverInput").val();
    return new Address(receiverInput);
}

function getTransferValue(): Balance {
    let valueInput = $("#ValueInput").val();
    return new Balance(valueInput);
}

function getTransferMemo(): TransactionPayload {
    let memoInput = $("#MemoInput").val();
    return new TransactionPayload(memoInput);
}

function getPrivateKey(): string {
    return $("#PrivateKeyInput").val();
}

function displayObject(container: string, obj: any) {
    let json = JSON.stringify(obj);
    $(`#${container}`).html(json);
}