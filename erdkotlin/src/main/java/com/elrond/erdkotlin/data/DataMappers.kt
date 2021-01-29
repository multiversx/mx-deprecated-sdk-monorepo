package com.elrond.erdkotlin.data

import com.elrond.erdkotlin.data.account.GetAccountResponse
import com.elrond.erdkotlin.data.networkconfig.GetNetworkConfigResponse
import com.elrond.erdkotlin.domain.networkconfig.NetworkConfig
import com.elrond.erdkotlin.domain.account.Account
import com.elrond.erdkotlin.domain.wallet.Address

internal fun GetAccountResponse.AccountData.toDomain(address: Address) = Account(
    address = address,
    nonce = nonce,
    balance = balance,
)

internal fun NetworkConfig.Companion.fromProviderPayload(
    response: GetNetworkConfigResponse.NetworkConfigData
) = NetworkConfig(
    chainID = response.chainID,
    gasPerDataByte = response.gasPerDataByte,
    minGasLimit = response.minGasLimit,
    minGasPrice = response.minGasPrice,
    minTransactionVersion = response.minTransactionVersion
)
