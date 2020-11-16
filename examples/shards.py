def get_shard_of_address(pub_key):
    num_shards = 3
    mask_high = int("11", 2)
    mask_low = int("01", 2)

    last_byte_of_pub_key = pub_key[31]

    if is_address_of_metachain(pub_key):
        return "metachain"

    shard = last_byte_of_pub_key & mask_high
    if shard > num_shards - 1:
        shard = last_byte_of_pub_key & mask_low

    return shard


def is_address_of_metachain(pub_key):
    metachain_prefix = bytearray([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    pub_key_prefix = pub_key[0:len(metachain_prefix)]
    if pub_key_prefix == metachain_prefix:
        return True

    zero_address = bytearray(32)
    if pub_key == zero_address:
        return True

    return False
