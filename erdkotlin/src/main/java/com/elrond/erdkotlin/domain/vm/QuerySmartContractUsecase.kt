package com.elrond.erdkotlin.domain.vm

import com.elrond.erdkotlin.domain.wallet.models.Address

class QuerySmartContractUsecase internal constructor(
    private val vmRepository: VmRepository
) {

    fun execute(
        address: Address,
        function: String,
        args: List<String> = emptyList()
    ): SmartContractOutput {
        val payload = SmartContractQuery(
            scAddress = address.bech32(),
            funcName = function,
            args = args,
        )
        return vmRepository.queryContract(payload)
    }
}
