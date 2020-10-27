import logging
import math
import sys
from argparse import ArgumentParser
from typing import Any

from erdpy import config, facade, utils
from erdpy.accounts import Address

logger = logging.getLogger("bon_staking")

counter = 0

GAS_PRICE = 1000000000
GAS_LIMIT = 50000


def main():
    logging.basicConfig(level=logging.DEBUG)

    parser = ArgumentParser()
    parser.add_argument("--proxy", default="https://api-testnet.elrond.com")
    parser.add_argument("--pem", required=True)
    parser.add_argument("--reward-address", required=True, help="the reward address")
    parser.add_argument("--nodes-file", required=True, help="file containing list of BLS keys, one per line")
    parser.add_argument("--value", required=True, help="the value to stake")
    args = parser.parse_args()

    proxy_url = args.proxy
    reward_address = Address(args.reward_address)
    lines = utils.read_lines(args.nodes_file)
    value = args.value
    chain = config.get_chain_id()

    print("Reward address:")
    print(reward_address.bech32())
    confirm_continuation()

    print("Number of Nodes to stake:", len(lines))
    confirm_continuation()

    for line in lines:
        print(line[:8], "...", line[-8:])

    confirm_continuation()

    print("Elrond Proxy (or Observer) address:", proxy_url)
    print("Chain ID:", chain)
    confirm_continuation()

    print("Value to stake:")
    print(int(value))
    print(int(value) / int(math.pow(10, 18)), "ERD")
    confirm_continuation()

    stake_args: Any = utils.Object()
    stake_args.reward_address = reward_address.bech32()
    stake_args.number_of_nodes = len(lines)
    # Minor programming artifice (the CSV formatting),
    # so that we are compatible with erdpy 0.7.2 (this will change in the future)
    stake_args.nodes_public_keys = ",".join(lines)
    stake_args.estimate_gas = True
    stake_args.gas_price = 1000000000
    stake_args.value = args.value

    stake_args.pem = args.pem
    stake_args.proxy = proxy_url
    stake_args.chain = chain
    stake_args.version = config.get_tx_version()
    stake_args.recall_nonce = True

    print("Transaction will now be sent.")
    confirm_continuation()
    facade.prepare_and_send_stake_transaction(stake_args)
    print("Done.")


def confirm_continuation():
    answer = input("Continue? (y/n)")
    if answer.lower() not in ["y", "yes"]:
        raise Exception("Confirmation not given. Will stop.")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        logger.critical(err)
        sys.exit(1)
