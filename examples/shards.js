function getShardOfAddress(hexPubKey) {
    let numShards = 3;
    let maskHigh = parseInt("11", 2);
    let maskLow = parseInt("01", 2);

    let pubKey = Buffer.from(hexPubKey, "hex");
    let lastByteOfPubKey = pubKey[31];

    if (isAddressOfMetachain(pubKey)) {
        return "metachain";
    }

    let shard = lastByteOfPubKey & maskHigh;
    if (shard > numShards - 1) {
        shard = lastByteOfPubKey & maskLow;
    }

    return shard;
}

function isAddressOfMetachain(pubKey) {
    let metachainPrefix = Buffer.from([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
    let pubKeyPrefix = pubKey.slice(0, metachainPrefix.length);
    if (pubKeyPrefix.equals(metachainPrefix)) {
        return true;
    }

    let zeroAddress = Buffer.alloc(32).fill(0);
    if (pubKey.equals(zeroAddress)) {
        return true;
    }

    return false;
}


// Alice ... Frank:
// https://github.com/ElrondNetwork/elrond-sdk/tree/master/erdpy/testnet/wallets/users
console.log(getShardOfAddress("0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1") == 1);
console.log(getShardOfAddress("8049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f8") == 0);
console.log(getShardOfAddress("b2a11555ce521e4944e09ab17549d85b487dcd26c84b5017a39e31a3670889ba") == 2);
console.log(getShardOfAddress("b13a017423c366caff8cecfb77a12610a130f4888134122c7937feae0d6d7d17") == 1);
console.log(getShardOfAddress("3af8d9c9423b2577c6252722c1d90212a4111f7203f9744f76fcfa1d0a310033") == 1);
console.log(getShardOfAddress("b37f5d130beb8885b90ab574a8bfcdd894ca531a7d3d1f3431158d77d6185fbb") == 1);

// System SC etc.
console.log(getShardOfAddress("000000000000000000010000000000000000000000000000000000000000ffff") == "metachain");
console.log(getShardOfAddress("000000000000000000010000000000000000000000000000000000000001ffff") == "metachain");
console.log(getShardOfAddress("000000000000000000010000000000000000000000000000000000000002ffff") == "metachain");
console.log(getShardOfAddress("000000000000000000010000000000000000000000000000000000000003ffff") == "metachain");
console.log(getShardOfAddress("0000000000000000000100000000000000000000000000000000ffffffffffff") == "metachain");
console.log(getShardOfAddress("0000000000000000000000000000000000000000000000000000000000000000") == "metachain");
