import logging
import math
import sys
from argparse import ArgumentParser

from erdpy.accounts import Account, Address
from erdpy.proxy.core import ElrondProxy
from erdpy.transactions import do_prepare_transaction
from erdpy.validators import prepare_args_for_stake

logger = logging.getLogger("staking")


def main():
    logging.basicConfig(level=logging.DEBUG)

    parser = ArgumentParser()
    parser.add_argument("--proxy", default="https://testnet-api.elrond.com")
    parser.add_argument("--keyfile", help="wallet JSON keyfile", required=True)
    parser.add_argument("--passfile", help="wallet password file", required=True)
    parser.add_argument("--reward-address", required=True, help="the reward address")
    parser.add_argument("--validators-file", required=True, help="validators JSON file (with links to PEM files)")
    parser.add_argument("--value", required=True, help="the value to stake")
    args = parser.parse_args()
    args.estimate_gas = True
    args.pem = None

    proxy = ElrondProxy(args.proxy)
    network = proxy.get_network_config()
    args.chain = network.chain_id
    args.gas_price = network.min_gas_price
    args.version = network.min_tx_version

    print("Reward address:")
    print(Address(args.reward_address).bech32())
    confirm_continuation()

    prepare_args_for_stake(args)
    print("Transaction data:")
    print(args.data)
    confirm_continuation()

    print("Elrond Proxy (or Observer) address:", args.proxy)
    print("Chain ID:", args.chain)
    confirm_continuation()

    print("Value to stake:")
    print(int(args.value) / int(math.pow(10, 18)), "ERD")
    confirm_continuation()

    node_operator = Account(key_file=args.keyfile, pass_file=args.passfile)
    node_operator.sync_nonce(proxy)
    args.nonce = node_operator.nonce

    tx = do_prepare_transaction(args)
    tx.dump_to(sys.stdout)
    print("Transaction will now be sent.")
    confirm_continuation()

    tx.send(proxy)
    print("Done.")


def confirm_continuation():
    answer = input("Continue? (y/n)")
    if answer.lower() not in ["y", "yes"]:
        raise Exception("Confirmation not given. Will stop.")


if __name__ == "__main__":
    main()
