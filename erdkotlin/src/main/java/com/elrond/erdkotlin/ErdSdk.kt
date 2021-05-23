package com.elrond.erdkotlin

import com.elrond.erdkotlin.data.account.AccountRepositoryImpl
import com.elrond.erdkotlin.data.api.ElrondProxy
import com.elrond.erdkotlin.data.networkconfig.NetworkConfigRepositoryImpl
import com.elrond.erdkotlin.data.transaction.TransactionRepositoryImpl
import com.elrond.erdkotlin.data.vm.VmRepositoryImpl
import com.elrond.erdkotlin.domain.account.GetAccountUsecase
import com.elrond.erdkotlin.domain.account.GetAddressBalanceUsecase
import com.elrond.erdkotlin.domain.account.GetAddressNonceUsecase
import com.elrond.erdkotlin.domain.dns.CheckUsernameUsecase
import com.elrond.erdkotlin.domain.dns.ComputeDnsAddressUsecase
import com.elrond.erdkotlin.domain.dns.RegisterDnsUsecase
import com.elrond.erdkotlin.domain.networkconfig.GetNetworkConfigUsecase
import com.elrond.erdkotlin.domain.transaction.*
import com.elrond.erdkotlin.domain.transaction.SignTransactionUsecase
import com.elrond.erdkotlin.domain.dns.GetDnsRegistrationCostUsecase
import com.elrond.erdkotlin.domain.vm.QuerySmartContractUsecase
import okhttp3.OkHttpClient

// Implemented as an `object` because we are not using any dependency injection library
// We don't want to force the host app to use a specific library.
object ErdSdk {

    fun setNetwork(elrondNetwork: ElrondNetwork) {
        elrondProxy.setUrl(elrondNetwork.url())
    }

    fun getAccountUsecase() = GetAccountUsecase(accountRepository)
    fun getAddressNonceUsecase() = GetAddressNonceUsecase(accountRepository)
    fun getAddressBalanceUsecase() = GetAddressBalanceUsecase(accountRepository)
    fun getNetworkConfigUsecase() = GetNetworkConfigUsecase(networkConfigRepository)
    fun sendTransactionUsecase() = SendTransactionUsecase(
        SignTransactionUsecase(),
        transactionRepository
    )

    fun getTransactionsUsecase() = GetAddressTransactionsUsecase(transactionRepository)
    fun getTransactionInfoUsecase() = GetTransactionInfoUsecase(transactionRepository)
    fun getTransactionStatusUsecase() = GetTransactionStatusUsecase(transactionRepository)
    fun estimateCostOfTransactionUsecase() = EstimateCostOfTransactionUsecase(transactionRepository)
    fun querySmartContractUsecase() = QuerySmartContractUsecase(vmRepository)
    fun getDnsRegistrationCostUsecase() = GetDnsRegistrationCostUsecase(
        querySmartContractUsecase(),
        computeDnsAddressUsecase()
    )

    fun registerDnsUsecase() = RegisterDnsUsecase(
        sendTransactionUsecase(),
        computeDnsAddressUsecase(),
        getDnsRegistrationCostUsecase()
    )

    fun checkUsernameUsecase() = CheckUsernameUsecase()

    internal fun computeDnsAddressUsecase() = ComputeDnsAddressUsecase(checkUsernameUsecase())

    val elrondHttpClientBuilder = OkHttpClient.Builder()
    private val elrondProxy = ElrondProxy(ElrondNetwork.DevNet.url(), elrondHttpClientBuilder)
    private val networkConfigRepository = NetworkConfigRepositoryImpl(elrondProxy)
    private val accountRepository = AccountRepositoryImpl(elrondProxy)
    private val transactionRepository = TransactionRepositoryImpl(elrondProxy)
    private val vmRepository = VmRepositoryImpl(elrondProxy)
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
