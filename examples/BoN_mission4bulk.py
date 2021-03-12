import logging
import sys
import time
from argparse import ArgumentParser

from erdpy import config, errors
from erdpy.accounts import Account
from erdpy.proxy import ElrondProxy
from erdpy.transactions import BunchOfTransactions

logger = logging.getLogger("bon_mission4")

counter = 0

VALUE = 20000000000000000
GAS_PRICE = 1000000000
GAS_LIMIT = 50000


def main():
    parser = ArgumentParser()
    parser.add_argument("--proxy", default="https://testnet-gateway.elrond.com")
    parser.add_argument("--pem", required=True)
    parser.add_argument("--bulk-size", type=int, default=50, help="how many transactions to send in bulk")
    parser.add_argument("--sleep-before-recall", type=int, default=5, help="how many seconds to sleep before recalling nonce")
    parser.add_argument("--sleep-after-bulk", required=True, help="how many seconds to sleep after sending a bulk")
    args = parser.parse_args()

    logging.basicConfig(level=logging.WARNING)

    print("Press CTRL+C to stop the script execution")

    proxy = ElrondProxy(args.proxy)
    sender = Account(pem_file=args.pem)
    bulk_size = int(args.bulk_size)
    sleep_after_bulk = int(args.sleep_after_bulk)
    sleep_before_recall = int(args.sleep_before_recall)

    while True:
        print(f"Sleeping {sleep_before_recall} seconds before recalling nonce and sending a bulk of {bulk_size} transactions...")
        time.sleep(sleep_before_recall)

        try:
            sender.sync_nonce(proxy)
            print(f"Sender nonce recalled: nonce={sender.nonce}.")
            send_txs(proxy, sender, bulk_size, sleep_after_bulk)
        except errors.ProxyRequestError as err:
            logger.error(err)


def send_txs(proxy: ElrondProxy, sender: Account, num: int, sleep_after: int):
    print(f"Will send {num} transactions in bulk ({int(num / 2)} for each destination address). Will also sleep {sleep_after} seconds after each bulk.")

    bunch = BunchOfTransactions()
    chain_id = config.get_chain_id()
    tx_version = config.get_tx_version()

    for _ in range(0, int(num / 2)):
        bunch.add(sender, "erd1hqplnafrhnd4zv846wumat2462jy9jkmwxtp3nwmw8ye9eclr6fq40f044", sender.nonce, VALUE, "", GAS_PRICE, GAS_LIMIT, chain_id, tx_version)
        sender.nonce += 1
        bunch.add(sender, "erd1utftdvycwgl3xt0r44ekncentlxgmhucxfq3jt6cjz0w7h6qjchsjarml6", sender.nonce, VALUE, "", GAS_PRICE, GAS_LIMIT, chain_id, tx_version)
        sender.nonce += 1

    num_sent, _ = bunch.send(proxy)
    global counter
    counter += num_sent
    print(f"Sent {num_sent} transactions. Total: {counter}.")

    time.sleep(sleep_after)


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        logger.critical(err)
        sys.exit(1)
