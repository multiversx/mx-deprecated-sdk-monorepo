package com.elrond.erdkotlin.data.vm

import com.elrond.erdkotlin.data.api.ElrondProxy
import com.elrond.erdkotlin.data.toDomain
import com.elrond.erdkotlin.domain.vm.SmartContractQuery
import com.elrond.erdkotlin.domain.vm.SmartContractOutput
import com.elrond.erdkotlin.domain.vm.VmRepository

internal class VmRepositoryImpl(private val elrondProxy: ElrondProxy) : VmRepository {

    override fun queryContract(smartContractQuery: SmartContractQuery): SmartContractOutput {
        return requireNotNull(elrondProxy.queryContract(smartContractQuery).data).data.toDomain()
    }

}
