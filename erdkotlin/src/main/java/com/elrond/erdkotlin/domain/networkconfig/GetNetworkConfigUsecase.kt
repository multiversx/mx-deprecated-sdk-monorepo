package com.elrond.erdkotlin.domain.networkconfig

class GetNetworkConfigUsecase internal constructor(
    private val networkConfigRepository: NetworkConfigRepository
) {
    fun execute() = networkConfigRepository.getNetworkConfig()
}
