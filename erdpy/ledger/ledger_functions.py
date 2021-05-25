import string

from erdpy.ledger.config import compare_versions
from erdpy.ledger.ledger_app_handler import ElrondLedgerApp, SIGN_USING_HASH_VERSION
from erdpy.transactions import Transaction

TX_HASH_SIGN_VERSION = 2
TX_HASH_SIGN_OPTIONS = 1

def sign_transaction_with_ledger(tx: Transaction, account_index: int, address_index: int) -> Transaction:
    ledger_handler = ElrondLedgerApp()
    ledger_handler.set_address(account_index=account_index, address_index=address_index)
    ledger_version = ledger_handler.get_version()

    should_use_hash_signing = compare_versions(ledger_version, SIGN_USING_HASH_VERSION) >= 0
    if should_use_hash_signing:
        tx.version = TX_HASH_SIGN_VERSION
        tx.options = TX_HASH_SIGN_OPTIONS

    tx.signature = ledger_handler.sign_transaction(tx.serialize(), should_use_hash_signing)
    ledger_handler.close()

    return tx


def do_get_ledger_address(account_index: int, address_index: int) -> string:
    ledger_handler = ElrondLedgerApp()
    ledger_address = ledger_handler.get_address(account_index=account_index, address_index=address_index)
    ledger_handler.close()

    return ledger_address
