package com.elrond.erdkotlin.data.account

import com.elrond.erdkotlin.data.api.ElrondProxy
import com.elrond.erdkotlin.data.toDomain
import com.elrond.erdkotlin.domain.wallet.models.Address
import com.elrond.erdkotlin.domain.account.models.Account
import com.elrond.erdkotlin.domain.account.AccountRepository
import java.math.BigInteger

internal class AccountRepositoryImpl(
    private val elrondProxy: ElrondProxy
) : AccountRepository {

    override fun getAccount(address: Address): Account {
        val response = elrondProxy.getAccount(address)
        val payload = requireNotNull(response.data).account
        return payload.toDomain(address)
    }

    override fun getAddressNonce(address: Address): Long {
        val response = elrondProxy.getAddressNonce(address)
        return requireNotNull(response.data).nonce
    }

    override fun getAddressBalance(address: Address): BigInteger {
        val response = elrondProxy.getAddressBalance(address)
        return requireNotNull(response.data).balance
    }
}
