package com.elrond.erdkotlin.domain.vm

internal interface VmRepository {

    fun queryContract(smartContractQuery: SmartContractQuery): SmartContractOutput

}
