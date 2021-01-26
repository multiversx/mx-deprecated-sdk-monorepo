package com.elrond.erdkotlin.domain.wallet

import com.elrond.erdkotlin.Exceptions
import org.bitcoinj.crypto.MnemonicCode
import org.bitcoinj.crypto.MnemonicException.MnemonicLengthException
import org.bouncycastle.crypto.digests.SHA512Digest
import org.bouncycastle.crypto.generators.PKCS5S2ParametersGenerator
import org.bouncycastle.crypto.macs.HMac
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters
import org.bouncycastle.crypto.params.KeyParameter
import org.bouncycastle.crypto.signers.Ed25519Signer
import org.bouncycastle.util.encoders.Hex
import java.io.ByteArrayOutputStream
import java.io.IOException
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.charset.StandardCharsets
import java.security.SecureRandom


class Wallet(
    private val publicKey: ByteArray,
    private val privateKey: ByteArray,
) {

    val publicKeyHex: String = String(Hex.encode(publicKey))
    val privateKeyHex: String = String(Hex.encode(privateKey))

    fun sign(data: String): String = sign(data.toByteArray(StandardCharsets.UTF_8))

    fun sign(data: ByteArray): String {
        val signer: Ed25519Signer = createEd25519Signer().apply {
            update(data, 0, data.size)
        }
        val signature = signer.generateSignature()
        val hex = Hex.encode(signature)
        return String(hex)
    }

    private fun createEd25519Signer(): Ed25519Signer {
        val parameters = Ed25519PrivateKeyParameters(this.privateKey, 0)
        return Ed25519Signer().apply {
            init(true, parameters)
        }
    }

    companion object {
        private const val DEFAULT_ENTROPY_BITS = 256 // this leads to 24-words mnemonics
        private const val BIP39_SALT_MODIFIER = "mnemonic"
        private const val BIP39_PBKDF2_ROUNDS = 2048
        private const val BIP32_SEED_MODIFIER = "ed25519 seed"
        private const val HARDENED_OFFSET: Long = -0x80000000
        private val ELROND_DERIVATION_PATH = longArrayOf(44, 508, 0, 0, 0)

        fun createFromPrivateKey(privateKey: ByteArray): Wallet {
            val privateKeyParameters = Ed25519PrivateKeyParameters(privateKey, 0)
            val publicKeyParameters = privateKeyParameters.generatePublicKey()
            return Wallet(
                publicKey = publicKeyParameters.encoded,
                privateKey = privateKey
            )
        }

        fun createFromPrivateKey(privateKeyHex: String) = createFromPrivateKey(
            Hex.decode(privateKeyHex)
        )

        @Throws(Exceptions.CannotDeriveKeysException::class)
        fun createFromMnemonic(mnemonic: String, accountIndex: Long): Wallet {
            return try {
                val seed: ByteArray = mnemonicToBip39Seed(mnemonic)
                val privateKey: ByteArray = bip39SeedToPrivateKey(seed, accountIndex)
                createFromPrivateKey(privateKey)
            } catch (error: IOException) {
                throw Exceptions.CannotDeriveKeysException()
            }
        }

        @Throws(Exceptions.CannotGenerateMnemonicException::class)
        fun generateMnemonic(): List<String> {
            return try {
                val entropy = generateEntropy()
                MnemonicCode().toMnemonic(entropy)
            } catch (error: IOException) {
                throw Exceptions.CannotGenerateMnemonicException()
            } catch (error: MnemonicLengthException) {
                throw Exceptions.CannotGenerateMnemonicException()
            }
        }

        private fun generateEntropy(): ByteArray {
            val random = SecureRandom()
            val entropy = ByteArray(DEFAULT_ENTROPY_BITS / 8)
            random.nextBytes(entropy)
            return entropy
        }

        private fun mnemonicToBip39Seed(mnemonic: String): ByteArray {
            val mnemonicBytes: ByteArray = mnemonic.toByteArray(StandardCharsets.UTF_8)
            val passphrase: ByteArray = BIP39_SALT_MODIFIER.toByteArray(StandardCharsets.UTF_8)
            val generator = PKCS5S2ParametersGenerator(SHA512Digest())
            generator.init(mnemonicBytes, passphrase, BIP39_PBKDF2_ROUNDS)
            return (generator.generateDerivedParameters(512) as KeyParameter).key
        }

        @Throws(IOException::class)
        private fun bip39SeedToPrivateKey(seed: ByteArray, accountIndex: Long): ByteArray {
            var keyAndChainCode = bip39SeedToMasterKey(seed)
            var key: ByteArray = keyAndChainCode.key
            var chainCode: ByteArray = keyAndChainCode.chainCode
            val derivationPath: LongArray = ELROND_DERIVATION_PATH
                .copyOf(ELROND_DERIVATION_PATH.size)
                .apply {
                    set(size - 1, accountIndex)
                }
            derivationPath.forEach { segment ->
                keyAndChainCode = ckdPriv(key, chainCode, segment + HARDENED_OFFSET)
                key = keyAndChainCode.key
                chainCode = keyAndChainCode.chainCode
            }
            return key
        }

        private fun bip39SeedToMasterKey(seed: ByteArray): KeyAndChainCode {
            val result: ByteArray = hmacSHA512(
                BIP32_SEED_MODIFIER.toByteArray(StandardCharsets.UTF_8),
                seed
            )
            val masterKey = result.copyOfRange(0, 32)
            val chainCode = result.copyOfRange(32, 64)
            return KeyAndChainCode(masterKey, chainCode)
        }

        @Throws(IOException::class)
        private fun ckdPriv(key: ByteArray, chainCode: ByteArray, index: Long): KeyAndChainCode {
            val indexBuffer: ByteBuffer = ByteBuffer.allocate(4).apply {
                order(ByteOrder.BIG_ENDIAN)
                putInt((index and 0xffffffffL).toInt())
            }

            val dataStream = ByteArrayOutputStream().apply {
                write(byteArrayOf(0))
                write(key)
                write(indexBuffer.array()) // indexBytes
            }
            val data: ByteArray = dataStream.toByteArray()
            val result = hmacSHA512(chainCode, data)
            return KeyAndChainCode(
                key = result.copyOfRange(0, 32),
                chainCode = result.copyOfRange(32, 64)
            )
        }

        private fun hmacSHA512(key: ByteArray, message: ByteArray): ByteArray {
            val result = ByteArray(64)
            val hmac = HMac(SHA512Digest()).apply {
                init(KeyParameter(key))
                update(message, 0, message.size)
            }
            hmac.doFinal(result, 0)
            return result
        }

    }

    private data class KeyAndChainCode(val key: ByteArray, val chainCode: ByteArray) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as KeyAndChainCode

            if (!key.contentEquals(other.key)) return false
            if (!chainCode.contentEquals(other.chainCode)) return false

            return true
        }

        override fun hashCode(): Int {
            var result = key.contentHashCode()
            result = 31 * result + chainCode.contentHashCode()
            return result
        }
    }
}
