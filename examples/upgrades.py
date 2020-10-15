import logging
from argparse import ArgumentParser

from erdpy import config
from erdpy.accounts import Account
from erdpy.contracts import CodeMetadata, SmartContract
from erdpy.environments import TestnetEnvironment
from erdpy.projects import ProjectClang
from erdpy.proxy.core import ElrondProxy

logger = logging.getLogger("examples")


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--proxy", help="testnet Proxy URL", default=config.get_proxy())
    parser.add_argument("--contract", help="existing contract address")
    parser.add_argument("--pem", help="PEM file", required=True)
    args = parser.parse_args()

    logging.basicConfig(level=logging.DEBUG)

    # Now, we create a environment which intermediates deployment and execution
    proxy = ElrondProxy(args.proxy)
    environment = TestnetEnvironment(args.proxy)
    user = Account(pem_file=args.pem)

    # We initialize the smart contract with an actual address if IF was previously deployed,
    contract = SmartContract(address=args.contract, metadata=CodeMetadata(upgradeable=True))

    # A flow defines the desired steps to interact with the contract.
    def deploy_flow():
        global contract

        project = ProjectClang(input("Path to contract project: "))
        contract.bytecode = project.get_bytecode()

        user.sync_nonce(proxy)
        tx, address = environment.deploy_contract(
            contract=contract,
            owner=user,
            arguments=[],
            gas_price=config.DEFAULT_GAS_PRICE,
            gas_limit=5000000,
            value=None,
            chain=config.get_chain_id(),
            version=config.get_tx_version()
        )

        logger.info("Tx hash: %s", tx)
        logger.info("Contract address (hex): %s", address.hex())
        logger.info("Contract address (bech32): %s", address.bech32())

    def query_flow():
        global contract

        function = input("Name of function: ")
        answer = environment.query_contract(contract, function)
        logger.info(f"Answer: {answer}")

    def execute_flow():
        global contract
        function = input("Name of function: ")

        user.sync_nonce(proxy)
        tx = environment.execute_contract(
            contract=contract,
            caller=user,
            function=function,
            arguments=[],
            gas_price=config.DEFAULT_GAS_PRICE,
            gas_limit=5000000,
            value=None,
            chain=config.get_chain_id(),
            version=config.get_tx_version()
        )

        logger.info("Tx hash: %s", tx)

    def upgrade_flow():
        global contract

        project = ProjectClang(input("Path to contract project: "))
        contract.bytecode = project.get_bytecode()

        user.sync_nonce(proxy)
        environment.upgrade_contract(
            contract,
            caller=user,
            arguments=[],
            gas_price=config.DEFAULT_GAS_PRICE,
            gas_limit=5000000,
            value=None,
            chain=config.get_chain_id(),
            version=config.get_tx_version()
        )

    while True:
        print("Let's run a flow.")
        print("1. Deploy")
        print("2. Query")
        print("3. Call")
        print("4. Upgrade")

        try:
            choice = int(input("Choose:\n"))
        except Exception:
            break

        flows = [
            None,
            deploy_flow,
            query_flow,
            execute_flow,
            upgrade_flow
        ]

        flow = flows[choice]
        if flow:
            environment.run_flow(flow)
        else:
            print("Bad choice")
            break
