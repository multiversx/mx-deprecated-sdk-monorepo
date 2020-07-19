import logging
import sys
import time
from argparse import ArgumentParser

from erdpy import config, errors
from erdpy.accounts import Account
from erdpy.proxy import ElrondProxy
from erdpy.transactions import (PlainTransaction, PreparedTransaction,
                                TransactionPayloadToSign)
from erdpy.wallet import signing

logger = logging.getLogger("bon_mission4")

counter = 0


def main():
    parser = ArgumentParser()
    parser.add_argument("--proxy", default="https://api.elrond.com")
    parser.add_argument("--pem", required=True)
    parser.add_argument("--batch-size", type=int, default=50, help="how many transactions to send before recalling nonce")
    parser.add_argument("--sleep-before-recall", type=int, default=15, help="how many seconds to sleep before recalling nonce")
    parser.add_argument("--sleep-after-tx", required=True, help="how many seconds to sleep after sending a transaction")
    args = parser.parse_args()

    logging.basicConfig(level=logging.WARNING)

    print("Press CTRL+C to stop the script execution")

    proxy = ElrondProxy(args.proxy)
    sender = Account(pem_file=args.pem)
    batch_size = int(args.batch_size)
    sleep_after_tx = int(args.sleep_after_tx)
    sleep_before_recall = int(args.sleep_before_recall)

    while True:
        print(f"Sleeping {sleep_before_recall} seconds before recalling nonce and sending {batch_size} transactions...")
        time.sleep(sleep_before_recall)

        try:
            sender.sync_nonce(proxy)
            print(f"Sender nonce recalled: nonce={sender.nonce}.")
            send_txs(proxy, sender, batch_size, sleep_after_tx)
        except errors.ProxyRequestError as err:
            logger.error(err)


def send_txs(proxy, sender, num, sleep_after):
    print(f"Will send {num} transactions. Will also sleep {sleep_after} after each transaction.")
    for i in range(0, num):
        send_one_tx(proxy, sender, "erd1hqplnafrhnd4zv846wumat2462jy9jkmwxtp3nwmw8ye9eclr6fq40f044")
        sender.nonce += 1
        time.sleep(sleep_after)

        send_one_tx(proxy, sender, "erd1utftdvycwgl3xt0r44ekncentlxgmhucxfq3jt6cjz0w7h6qjchsjarml6")
        sender.nonce += 1
        time.sleep(sleep_after)


def send_one_tx(proxy, sender, receiver_address):
    plain = PlainTransaction()
    plain.nonce = sender.nonce
    plain.value = "20000000000000000"  # 0.02 ERD
    plain.sender = sender.address.bech32()
    plain.receiver = receiver_address
    plain.gasPrice = 200000000000
    plain.gasLimit = 50000
    plain.data = ""
    plain.chainID = config.get_chain_id()
    plain.version = config.get_tx_version()

    payload = TransactionPayloadToSign(plain)
    signature = signing.sign_transaction(payload, sender.pem_file)
    prepared = PreparedTransaction(plain, signature)
    prepared.send(proxy)

    global counter
    counter += 1
    print(f"Sent transaction #{counter}, with nonce = {plain.nonce}.")


if __name__ == "__main__":
    try:
        main()
    except Exception as err:
        logger.critical(err)
        sys.exit(1)
