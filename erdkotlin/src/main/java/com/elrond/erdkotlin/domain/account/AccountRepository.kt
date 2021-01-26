package com.elrond.erdkotlin.domain.account

import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.domain.wallet.Address
import java.io.IOException

internal interface AccountRepository {

    @Throws(
        IOException::class,
        Exceptions.ProxyRequestException::class,
        Exceptions.AddressException::class
    )
    fun getAccount(address: Address): Account

}