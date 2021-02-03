Changelog
============

v0.2
=
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

v0.1
=
Initial version allowing to import a wallet and send transaction.
Usecases:
- GetAccountUsecase
- GetNetworkConfigUsecase
- SendTransactionUsecase


