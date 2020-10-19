import logging
from argparse import ArgumentParser

from erdpy.accounts import Account, Address
from erdpy.proxy import ElrondProxy
from erdpy.transactions import BunchOfTransactions

logger = logging.getLogger("minting")

counter = 0

ONE_EGLD_STR = "1" + "0" * 18
ONE_EGLD = int(ONE_EGLD_STR)
GAS_PRICE = 1000000000

payload = """
erd1...:1.25000
erd1...:0.25000
erd1...:0.25000
"""


def main():
    logging.basicConfig(level=logging.WARNING)

    parser = ArgumentParser()
    parser.add_argument("--proxy", default="http://myproxy:8079")
    parser.add_argument("--pem", required=True)
    args = parser.parse_args()

    items = payload.splitlines()
    items = [item.strip() for item in items if item]
    items = [parse_item(item) for item in items]

    print(len(items))

    proxy = ElrondProxy(args.proxy)
    sender = Account(pem_file=args.pem)
    sender.sync_nonce(proxy)

    bunch = BunchOfTransactions()
    chain_id = "1"
    tx_version = 1
    data = "foobar"
    gas_limit = 50000 + len(data) * 1500

    cost = 0

    for address, value in items:
        print(address, value)
        bunch.add(sender, address.bech32(), sender.nonce, str(value), data, GAS_PRICE, gas_limit, chain_id, tx_version)
        sender.nonce += 1

        cost += value
        cost += gas_limit * GAS_PRICE

    print("Cost", cost)
    num_txs, _ = bunch.send(proxy)
    print("Sent", num_txs)


def parse_item(item: str):
    parts = item.split(":")
    address = Address(parts[0])
    value = int(float(parts[1]) * ONE_EGLD)

    return address, value


if __name__ == "__main__":
    main()
