package com.elrond.erdkotlin.domain.wallet

import com.elrond.erdkotlin.Exceptions
import org.bitcoinj.core.Bech32
import org.bouncycastle.util.encoders.DecoderException
import org.bouncycastle.util.encoders.Hex
import java.io.ByteArrayOutputStream


@Suppress("DataClassPrivateConstructor")
data class Address private constructor(
    val hex: String
) {

    fun pubkey(): ByteArray {
        return Hex.decode(hex)
    }

    @Throws(Exceptions.AddressException::class)
    fun bech32(): String {
        return Bech32.encode(HRP, convertBits(pubkey(), 8, 5, true))
    }

    companion object {
        const val HRP = "erd"
        const val PUBKEY_LENGTH = 32
        const val PUBKEY_STRING_LENGTH = PUBKEY_LENGTH * 2 // hex-encoded
        const val BECH32_LENGTH = 62
        const val ZERO_PUBKEY_STRING =
            "0000000000000000000000000000000000000000000000000000000000000000"

        fun createZeroAddress() = Address(ZERO_PUBKEY_STRING)

        @Throws(Exceptions.AddressException::class, Exceptions.BadAddressHrpException::class)
        fun fromBech32(value: String): Address {
            val bech32Data = try {
                Bech32.decode(value)
            } catch (e: Exception) {
                throw Exceptions.CannotCreateBech32AddressException(value)
            }
            if (bech32Data.hrp != HRP) {
                throw Exceptions.BadAddressHrpException()
            }
            val decodedBytes: ByteArray = convertBits(bech32Data.data, 5, 8, false)
            val hex = String(Hex.encode(decodedBytes))
            return Address(hex)
        }

        @Throws(Exceptions.AddressException::class)
        fun fromHex(value: String): Address {
            if (value.length != PUBKEY_STRING_LENGTH || !isValidHex(value)) {
                throw Exceptions.CannotCreateAddressException(value)
            }
            return Address(value)
        }

        private fun isValidHex(value: String): Boolean {
            return try {
                Hex.decode(value)
                true
            } catch (error: DecoderException) {
                false
            }
        }

        fun isValidBech32(value: String): Boolean {
            return try {
                fromBech32(value)
                true
            } catch (error: Exceptions.AddressException) {
                false
            }
        }

        /**
         * General power-of-2 base conversion.
         */
        @Throws(Exceptions.AddressException::class)
        fun convertBits(
            data: ByteArray,
            fromBits: Int,
            toBits: Int,
            pad: Boolean
        ): ByteArray {
            /*-
               Reference Python implementation by Pieter Wuille:

               def convertbits(data, frombits, tobits, pad=True):
                   acc = 0
                   bits = 0
                   ret = []
                   maxv = (1 << tobits) - 1
                   max_acc = (1 << (frombits + tobits - 1)) - 1
                   for value in data:
                       if value < 0 or (value >> frombits):
                           return None
                       acc = ((acc << frombits) | value) & max_acc
                       bits += frombits
                       while bits >= tobits:
                           bits -= tobits
                           ret.append((acc >> bits) & maxv)
                   if pad:
                       if bits:
                           ret.append((acc << (tobits - bits)) & maxv)
                   elif bits >= frombits or ((acc << (tobits - bits)) & maxv):
                       return None
                   return ret
            */

            var acc = 0
            var bits = 0
            val ret = ByteArrayOutputStream()
            val maxv = (1 shl toBits) - 1
            val maxAcc = (1 shl fromBits + toBits - 1) - 1
            for (value in data) {
                val valueAsInt: Int = (value.toInt() and 0xff)
                if (valueAsInt < 0 || valueAsInt ushr fromBits != 0) {
                    throw Exceptions.CannotConvertBitsException()
                }
                acc = ((acc shl fromBits) or valueAsInt) and maxAcc
                bits += fromBits
                while (bits >= toBits) {
                    bits -= toBits
                    ret.write((acc ushr bits) and maxv)
                }
            }
            if (pad) {
                if (bits > 0) {
                    ret.write((acc shl (toBits - bits)) and maxv)
                }
            } else if (bits >= fromBits || ((acc shl (toBits - bits)) and maxv) != 0) {
                throw Exceptions.CannotConvertBitsException()
            }
            return ret.toByteArray()
        }

    }

}