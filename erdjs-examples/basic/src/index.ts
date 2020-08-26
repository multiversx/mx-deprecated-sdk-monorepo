import { Address, Balance, TransactionPayload, ProxyProvider, NetworkConfig, Transaction, NullSigner, SimpleSigner, GasLimit } from "@elrondnetwork/erdjs";

declare var $: any;

$(async function () {
    let signer = new NullSigner();
    let provider = new ProxyProvider(getProxyUrl());
    let transaction = new Transaction();

    $("#PrepareButton").click(async function () {
        NetworkConfig.Default.sync(provider);

        let receiver = getReceiver();
        let value = getTransferValue();
        let memo = getTransferMemo();
        let gasLimit = GasLimit.forTransfer(memo);

        transaction = new Transaction({
            receiver: receiver,
            value: value,
            data: memo,
            gasLimit: gasLimit
        });

        displayObject("PreparedTransactionContainer", transaction.toPlainObject());
    });

    $("#SignButton").click(async function () {
        signer = new SimpleSigner(getPrivateKey());
        signer.sign(transaction);

        displayObject("SignedTransactionContainer", transaction.toPlainObject());
    });

    $("#BroadcastButton").click(async function () {
        let transactionHash = await transaction.send(provider);

        displayObject("BroadcastedTransactionContainer", transactionHash);
    });

    $("#QueryButton").click(async function () {
        let transactionOnNetwork = await provider.getTransaction();

        displayObject("QueriedTransactionContainer", transactionHash);
    });
});

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
    return $("#PrivateKeyTextArea").val().trim();
}

function displayObject(container: string, obj: any) {
    let json = JSON.stringify(obj, null, 4);
    $(`#${container}`).html(json);
}