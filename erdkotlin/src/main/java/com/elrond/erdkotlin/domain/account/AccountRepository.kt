package com.elrond.erdkotlin.domain.account

import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.domain.account.models.Account
import com.elrond.erdkotlin.domain.wallet.models.Address
import java.io.IOException
import java.math.BigInteger

internal interface AccountRepository {

    @Throws(
        IOException::class,
        Exceptions.ProxyRequestException::class,
        Exceptions.AddressException::class
    )
    fun getAccount(address: Address): Account

    @Throws(
        IOException::class,
        Exceptions.ProxyRequestException::class,
        Exceptions.AddressException::class
    )
    fun getAddressNonce(address: Address): Long

    @Throws(
        IOException::class,
        Exceptions.ProxyRequestException::class,
        Exceptions.AddressException::class
    )
    fun getAddressBalance(address: Address): BigInteger
}
