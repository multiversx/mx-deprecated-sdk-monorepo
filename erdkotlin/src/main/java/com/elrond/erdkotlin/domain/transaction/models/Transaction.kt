package com.elrond.erdkotlin.domain.transaction.models

import com.elrond.erdkotlin.Exceptions
import com.elrond.erdkotlin.domain.wallet.models.Address
import com.google.gson.GsonBuilder
import java.math.BigInteger
import java.nio.charset.StandardCharsets
import org.bouncycastle.util.encoders.Base64

data class Transaction(
    val sender: Address,
    val receiver: Address,
    val chainID: String,
    val senderUsername: String = "",
    val receiverUsername: String = "",
    val nonce: Long = 0,
    val value: BigInteger = 0.toBigInteger(),
    val gasPrice: Long = 1000000000,
    val gasLimit: Long = 50000,
    val version: Int = 1,
    val data: String = "",
    val signature: String = "",
    val txHash: String = ""
) {

    val isSigned = signature.isNotEmpty()
    val isSent = txHash.isNotEmpty()

    @Throws(Exceptions.CannotSerializeTransactionException::class)
    fun serialize(): String = try {
        gson.toJson(toMap())
    } catch (error: Exceptions.AddressException) {
        throw Exceptions.CannotSerializeTransactionException()
    }

    @Throws(Exceptions.AddressException::class)
    private fun toMap(): Map<String, Any> {
        return mutableMapOf<String, Any>().apply {
            put("nonce", nonce)
            put("value", value.toString(10))
            put("receiver", receiver.bech32())
            put("sender", sender.bech32())
            if (senderUsername.isNotEmpty()) {
                put("senderUsername", encode(senderUsername))
            }
            if (receiverUsername.isNotEmpty()) {
                put("receiverUsername", encode(receiverUsername))
            }
            put("gasPrice", gasPrice)
            put("gasLimit", gasLimit)
            if (data.isNotEmpty()) {
                put("data", encode(data))
            }
            put("chainID", chainID)
            put("version", version)
            if (signature.isNotEmpty()) {
                put("signature", signature)
            }
        }
    }

    private fun encode(data: String): String {
        val dataAsBytes: ByteArray = data.toByteArray(StandardCharsets.UTF_8)
        val encodedAsBytes: ByteArray = Base64.encode(dataAsBytes)
        return String(encodedAsBytes)
    }

    companion object {
        private val gson = GsonBuilder().disableHtmlEscaping().create()
    }

}
