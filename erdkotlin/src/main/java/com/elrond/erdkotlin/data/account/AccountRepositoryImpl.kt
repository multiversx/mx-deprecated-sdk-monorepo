package com.elrond.erdkotlin.data.account

import com.elrond.erdkotlin.data.ElrondClient
import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.data.toDomain
import com.elrond.erdkotlin.domain.wallet.Address
import com.elrond.erdkotlin.domain.account.Account
import com.elrond.erdkotlin.domain.account.AccountRepository
import java.io.IOException

internal class AccountRepositoryImpl internal constructor(
    private val elrondClient: ElrondClient
) : AccountRepository {

    @Throws(
        IOException::class,
        Exceptions.AddressException::class,
        Exceptions.ProxyRequestException::class
    )
    override fun getAccount(address: Address): Account {
        val response: ElrondClient.ResponseBase<GetAccountResponse> = elrondClient.doGet(
            "address/${address.bech32()}"
        )
        val payload = requireNotNull(response.data).account
        return payload.toDomain(address)
    }
}