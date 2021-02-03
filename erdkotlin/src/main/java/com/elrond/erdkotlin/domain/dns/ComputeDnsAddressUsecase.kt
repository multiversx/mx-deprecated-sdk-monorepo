package com.elrond.erdkotlin.domain.dns

import com.elrond.erdkotlin.domain.account.models.Account
import com.elrond.erdkotlin.domain.wallet.models.Address
import org.bouncycastle.jcajce.provider.digest.Keccak
import org.bouncycastle.util.encoders.Hex
import java.nio.charset.StandardCharsets

// returns the compatible DNS address
internal class ComputeDnsAddressUsecase {

    fun execute(username: String): Address {
        val hash = nameHash(username)
        val shardId = hash.last()
        return execute(shardId)
    }

    fun execute(shardId: Byte): Address {
        val deployerPubkeyPrefix = initialDNSAddress.sliceArray(
            0 until initialDNSAddress.size - shardIdentiferLen
        )
        val deployerPubkey = deployerPubkeyPrefix + 0 + shardId
        val account = Account(
            address = Address.fromHex(String(Hex.encode(deployerPubkey))),
            nonce = 0
        )
        return computeAddress(account)
    }

    private fun nameHash(name: String): ByteArray {
        val digest = Keccak.Digest256()
        return digest.digest(name.toByteArray(StandardCharsets.UTF_8))
    }

    private fun computeAddress(account: Account): Address {
        // 8 bytes of zero + 2 bytes for VM type + 20 bytes of hash(owner) + 2 bytes of shard(owner)
        val ownerBytes = account.address.pubkey()
        val nonceBytes = longToUInt32ByteArray(account.nonce, 8)
        val bytesToHash = ownerBytes + nonceBytes
        val ownerHash = Keccak.Digest256().digest(bytesToHash)
        val dnsAddress =
            ByteArray(8) { 0 } + 5 + 0 + ownerHash.slice(10 until 30) + ownerBytes[30] + ownerBytes[31]
        return Address.fromHex(String(Hex.encode(dnsAddress)))
    }

    // litte endian implementation
    private fun longToUInt32ByteArray(value: Long, length: Int): ByteArray {
        val bytes = ByteArray(length)
        for (i in 0 until length) {
            bytes[i] = ((value ushr (i * 8)) and 0xFFFF).toByte()
        }
        return bytes
    }

    companion object {
        private val initialDNSAddress = ByteArray(32) { 1 }
        private const val shardIdentiferLen = 2
    }

}
