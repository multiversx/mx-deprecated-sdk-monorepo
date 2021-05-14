package com.elrond.erdkotlin.data

import com.elrond.erdkotlin.data.account.responses.GetAccountResponse
import com.elrond.erdkotlin.data.account.responses.GetAddressTransactionsResponse
import com.elrond.erdkotlin.data.networkconfig.GetNetworkConfigResponse
import com.elrond.erdkotlin.data.transaction.responses.GetTransactionInfoResponse
import com.elrond.erdkotlin.data.vm.responses.QueryContractResponse
import com.elrond.erdkotlin.domain.networkconfig.models.NetworkConfig
import com.elrond.erdkotlin.domain.account.models.Account
import com.elrond.erdkotlin.domain.transaction.models.TransactionInfo
import com.elrond.erdkotlin.domain.transaction.models.TransactionOnNetwork
import com.elrond.erdkotlin.domain.vm.SmartContractOutput
import com.elrond.erdkotlin.domain.wallet.models.Address

internal fun GetAccountResponse.AccountData.toDomain(address: Address) = Account(
    address = address,
    nonce = nonce,
    balance = balance,
)

internal fun GetAddressTransactionsResponse.TransactionOnNetworkData.toDomain() =
    TransactionOnNetwork(
        sender = Address.fromBech32(sender),
        receiver = Address.fromBech32(receiver),
        senderUsername = senderUsername,
        receiverUsername = receiverUsername,
        nonce = nonce,
        value = value,
        gasPrice = gasPrice,
        gasLimit = gasLimit,
        signature = signature,
        hash = hash,
        data = data,
        status = status,
        timestamp = timestamp,
        gasUsed = gasUsed,
        receiverShard = receiverShard,
        senderShard = senderShard,
        miniBlockHash = miniBlockHash,
        round = round,
        searchOrder = searchOrder,
        fee = fee,
        scResults = scResults,
        hyperblockNonce = hyperblockNonce
    )

internal fun GetTransactionInfoResponse.TransactionInfoData.toDomain() = TransactionInfo(
    type = type,
    nonce = nonce,
    round = round,
    epoch = epoch,
    value = value,
    sender = Address.fromBech32(sender),
    receiver = Address.fromBech32(receiver),
    senderUsername = senderUsername,
    receiverUsername = receiverUsername,
    gasPrice = gasPrice,
    gasLimit = gasLimit,
    data = data,
    signature = signature,
    sourceShard = sourceShard,
    destinationShard = destinationShard,
    blockNonce = blockNonce,
    miniBlockHash = miniBlockHash,
    blockHash = blockHash,
    status = status,
    hyperblockNonce = hyperblockNonce
)

internal fun QueryContractResponse.Data.toDomain() = SmartContractOutput(
    returnData = returnData,
    returnCode = returnCode,
    returnMessage = returnMessage,
    gasRemaining = gasRemaining,
    gasRefund = gasRefund,
    outputAccounts = outputAccounts,
)

internal fun GetNetworkConfigResponse.NetworkConfigData.toDomain() = NetworkConfig(
    chainID = chainID,
    erdDenomination = erdDenomination,
    gasPerDataByte = gasPerDataByte,
    erdGasPriceModifier = erdGasPriceModifier,
    erdLatestTagSoftwareVersion = erdLatestTagSoftwareVersion,
    erdMetaConsensusGroupSize = erdMetaConsensusGroupSize,
    minGasLimit = minGasLimit,
    minGasPrice = minGasPrice,
    minTransactionVersion = minTransactionVersion,
    erdNumMetachainNodes = erdNumMetachainNodes,
    erdNumNodesInShard = erdNumNodesInShard,
    erdNumShardsWithoutMeta = erdNumShardsWithoutMeta,
    erdRewardsTopUpGradientPoint = erdRewardsTopUpGradientPoint,
    erdRoundDuration = erdRoundDuration,
    erdRoundsPerEpoch = erdRoundsPerEpoch,
    erdShardConsensusGroupSize = erdShardConsensusGroupSize,
    erdStartTime = erdStartTime,
    erdTopUpFactor = erdTopUpFactor
)

