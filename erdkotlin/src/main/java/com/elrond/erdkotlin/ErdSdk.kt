package com.elrond.erdkotlin

import com.elrond.erdkotlin.data.ElrondClient
import com.elrond.erdkotlin.data.account.AccountRepositoryImpl
import com.elrond.erdkotlin.data.networkconfig.NetworkConfigRepositoryImpl
import com.elrond.erdkotlin.data.transaction.TransactionRepositoryImpl
import com.elrond.erdkotlin.domain.account.GetAccountUsecase
import com.elrond.erdkotlin.domain.networkconfig.GetNetworkConfigUsecase
import com.elrond.erdkotlin.domain.transaction.SendTransactionUsecase
import com.elrond.erdkotlin.domain.transaction.SignTransactionUsecase

// Implemented as an `object` because we are not using any dependency injection library
// We don't want to force the host app to use a specific library.
object ErdSdk {

    private val elrondClient = ElrondClient(ElrondNetwork.DevNet.url())

    fun getAccountUsecase() = GetAccountUsecase(AccountRepositoryImpl(elrondClient))
    fun getNetworkConfigUsecase() =
        GetNetworkConfigUsecase(NetworkConfigRepositoryImpl(elrondClient))

    fun sendTransactionUsecase() = SendTransactionUsecase(
        SignTransactionUsecase(),
        TransactionRepositoryImpl(elrondClient)
    )

    fun setNetwork(elrondNetwork: ElrondNetwork) {
        elrondClient.url = elrondNetwork.url()
    }

}

sealed class ElrondNetwork {
    object MainNet : ElrondNetwork()
    object DevNet : ElrondNetwork()
    object TestNet : ElrondNetwork()
    data class Custom(val url: String) : ElrondNetwork()

    fun url() = when (this) {
        MainNet -> "https://api.elrond.com"
        DevNet -> "https://devnet-api.elrond.com"
        TestNet -> "https://testnet-api.elrond.com"
        is Custom -> url
    }
}