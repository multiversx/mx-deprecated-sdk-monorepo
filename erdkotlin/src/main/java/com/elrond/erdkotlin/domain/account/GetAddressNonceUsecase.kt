package com.elrond.erdkotlin.domain.account

import com.elrond.erdkotlin.domain.wallet.models.Address

class GetAddressNonceUsecase internal constructor(private val accountRepository: AccountRepository) {

    fun execute(address: Address) = accountRepository.getAddressNonce(address)

}
