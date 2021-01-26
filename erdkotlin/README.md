

## Elrond Kotlin SDK

This is the kotlin implementation of Elrond SDK

This project was primarily designed for Android but is also compatible with any Kotlin-friendly app since it doesn't use the Android SDK

This is still a work in progress.

## Usage
This SDK is built with the clean architecture principles.
Interaction are done through usecases

Here is an example for sending a transaction.
```
// Create a wallet from mnemonics
val wallet = Wallet.createFromMnemonic(..., 0)

// Get informations related to this address (ie: balance and nonce)
val account = ErdSdk.getAccountUsecase().execute(Address.fromHex(wallet.publicKeyHex))

// Get the network informations
val networkConfig = ErdSdk.getNetworkConfigUsecase().execute()

// Create the transaction object
val transaction = Transaction(
    sender = account.address,
    receiver = Address.fromHex(...),
    value = 1000000000000000000.toBigInteger(), // 1 xEGLD
    data = "Elrond rocks !",
    chainID = networkConfig.chainID,
    gasPrice = networkConfig.minGasPrice,
    gasLimit = networkConfig.minGasLimit,
    nonce = account.nonce
)

// Send trasaction.
// Signature is handled internally
ErdSdk.sendTransactionUsecase().execute(transaction, wallet).also { sentTransaction ->
    Log.d("Transaction", "tx:${sentTransaction.txHash}")
}
```

In a real world example, the usescases would be injected
The sample application showcase how to do it on Android with Hilt framework (see the [Complete Example](#complete-example) section).


## Configuration
```
ErdSdk.setNetwork(ProviderUrl.MainNet) // default value is ProviderUrl.DevNet
```

## Complete Example
For a complete example you can checkout this [sample application](https://github.com/Alexandre-saddour/ElrondKotlinSampleApp)