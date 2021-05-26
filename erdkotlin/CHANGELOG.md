Changelog
============

## [0.3.0] - 15.05.2021
Add several fields to `NetworkConfig`  
Add `code` and `username` fields to `Account`  
Add `option` field to Transaction  
The OkHttpClient internally used by the SDK is now configurable from the host App through its builder  
Crash fix when address/:bech32Address/transactions would return no data.  
Update Kotlin version to 1.4.31  

## [0.2.0] - 03.02.2021

Add a `.pom` file for `.jar` building. (more infos in the readme)  
Add support for Dns username: `Transaction.senderUsername` and `Transaction.receiverUsername`  

Implement the following endpoints through usecases
- GetAddressNonceUsecase - GET address/:bech32Address/nonce
- GetAddressBalanceUsecase - GET address/:bech32Address/balance
- GetAddressTransactionsUsecase - GET address/:bech32Address/transactions
- EstimateCostOfTransactionUsecase - POST transaction/cost
- GetTransactionInfoUsecase - GET transaction/:txHash
- GetTransactionStatusUsecase - GET transaction/:txHash/status
- QuerySmartContractUsecase - POST vm-values/query (Compute Output of Pure Function)

Add the folowing usecases :  
- RegisterDnsUsecase // equivalent to `erdpy dns register`
- GetDnsRegistrationCostUsecase // equivalent to `erdpy dns registration-cost`

## [0.1.0] - 26.01.2021

Initial version allowing to import a wallet and send transaction.  

Usecases:
- GetAccountUsecase
- GetNetworkConfigUsecase
- SendTransactionUsecase
