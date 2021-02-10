package com.elrond.erdkotlin.domain.dns

import com.elrond.erdkotlin.domain.vm.QuerySmartContractUsecase
import com.elrond.erdkotlin.domain.wallet.models.Address
import org.bouncycastle.util.encoders.Base64
import java.math.BigInteger

class GetDnsRegistrationCostUsecase internal constructor(
    private val queryContractUsecase: QuerySmartContractUsecase,
    private val computeDnsAddressUsecase: ComputeDnsAddressUsecase
) {

    fun execute(shardId: Byte): BigInteger {
        return execute(computeDnsAddressUsecase.execute(shardId))
    }

    fun execute(dnsAddress: Address): BigInteger {
        val result = queryContractUsecase.execute(dnsAddress, "getRegistrationCost")
        return when {
            result.returnData.isNullOrEmpty() || result.returnData[0].isEmpty() -> 0.toBigInteger()
            else -> BigInteger(Base64.decode(result.returnData[0]))
        }
    }
}
