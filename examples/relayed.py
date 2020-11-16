import base64
import itertools
import logging

from argparse import ArgumentParser
from os import path
from pathlib import Path
from typing import Union
from erdpy import guards, utils
from erdpy.accounts import Account
from erdpy.proxy import ElrondProxy
from erdpy.transactions import Transaction
from examples.shards import get_shard_of_address

logger = logging.getLogger("relayed")

counter = 0


def get_index_by_shard_id(pem_file: Union[str, Path], shard_id: int) -> int:
    pem_file = path.expanduser(pem_file)
    guards.is_file(pem_file)

    lines = utils.read_lines(pem_file)
    keys_lines = [list(key_lines) for is_next_key, key_lines in itertools.groupby(lines, lambda line: "-----" in line)
                  if not is_next_key]
    keys = ["".join(key_lines) for key_lines in keys_lines]

    idx = 0
    while idx < len(keys):
        key_hex = base64.b64decode(keys[idx]).decode()
        key_bytes = bytes.fromhex(key_hex)
        pubkey = key_bytes[32:]

        shard = get_shard_of_address(pubkey)
        if shard_id == shard:
            return idx
        idx += 1

    print("cannot find address with given shard")
    return 0


def main():
    pem_file_name = "walletKey.pem"
    pem_path = "~/Elrond/testnet/filegen/output"

    pem_file = path.join(pem_path, pem_file_name)

    parser = ArgumentParser()
    parser.add_argument("--proxy", default="http://localhost:7950")
    args = parser.parse_args()

    shard0_index = get_index_by_shard_id(pem_file, 0)
    shard1_index = get_index_by_shard_id(pem_file, 1)

    logging.basicConfig(level=logging.DEBUG)

    proxy = ElrondProxy(args.proxy)
    network = proxy.get_network_config()

    alice = Account(pem_file=pem_file, pem_index=shard0_index)
    bob = Account(pem_file=pem_file, pem_index=shard1_index)

    bob.sync_nonce(proxy)

    innerTx = Transaction()
    innerTx.nonce = bob.nonce
    innerTx.value = "0"
    innerTx.sender = bob.address.bech32()
    innerTx.receiver = "erd1qqqqqqqqqqqqqpgqrchxzx5uu8sv3ceg8nx8cxc0gesezure5awqn46gtd"  # shard 2 address
    innerTx.gasPrice = 1000000000
    innerTx.gasLimit = 500000000
    innerTx.chainID = network.chain_id
    innerTx.version = network.min_tx_version
    innerTx.data = "version"
    innerTx.sign(bob)

    alice.sync_nonce(proxy)

    wrapperTx = Transaction()
    wrapperTx.nonce = alice.nonce
    wrapperTx.value = "0"
    wrapperTx.sender = alice.address.bech32()
    wrapperTx.receiver = bob.address.bech32()
    wrapperTx.gasPrice = 1000000000
    wrapperTx.gasLimit = 501109000
    wrapperTx.chainID = network.chain_id
    wrapperTx.version = network.min_tx_version
    wrapperTx.wrap_inner(innerTx)
    wrapperTx.sign(alice)

    wrapperTx.send(proxy)


if __name__ == "__main__":
    main()
