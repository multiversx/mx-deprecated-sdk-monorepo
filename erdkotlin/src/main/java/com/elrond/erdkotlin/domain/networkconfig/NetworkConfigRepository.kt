package com.elrond.erdkotlin.domain.networkconfig

import com.elrond.erdkotlin.Exceptions
import java.io.IOException

internal interface NetworkConfigRepository {

    @Throws(IOException::class, Exceptions.ProxyRequestException::class)
    fun getNetworkConfig(): NetworkConfig
}