import base64
import logging
from argparse import ArgumentParser

from erdpy.accounts import Account
from erdpy.contracts import SmartContract
from erdpy.environments import TestnetEnvironment
from erdpy.projects import ProjectClang

logger = logging.getLogger("examples")


if __name__ == '__main__':
    parser = ArgumentParser()
    parser.add_argument("--proxy", help="Testnet Proxy URL", required=True)
    parser.add_argument("--contract", help="Existing contract address", default="0000000000000000050000000000000000000000000000000000000000000000")
    parser.add_argument("--pem", help="User PEM file", required=True)
    args = parser.parse_args()

    logging.basicConfig(level=logging.DEBUG)

    project_v1 = ProjectClang("./examples/contracts/hello")
    project_v2 = ProjectClang("./examples/contracts/mycounter")

    # Now, we create a environment which intermediates deployment and execution
    environment = TestnetEnvironment(args.proxy)
    myself = Account(pem_file=args.pem)

    # We initialize the smart contract with an actual address if IF was previously deployed,
    contract = SmartContract(address=args.contract)

    # A flow defines the desired steps to interact with the contract.
    def deploy_v1_flow():
        global contract
        contract = SmartContract(bytecode=project_v1.get_bytecode())
        tx, address = environment.deploy_contract(contract, owner=myself)

    def query_v1_flow():
        global contract

        answer = environment.query_contract(contract, "getUltimateAnswer")[0]
        answer_bytes = base64.b64decode(answer)
        answer_hex = answer_bytes.hex()
        answer_int = int(answer_hex, 16)
        logger.info(f"Answer: {answer_bytes}, {answer_hex}, {answer_int}")

    def query_v2_flow():
        global contract

        answer = environment.query_contract(contract, "get")[0]
        answer_bytes = base64.b64decode(answer)
        answer_hex = answer_bytes.hex()
        answer_int = int(answer_hex, 16)
        logger.info(f"Answer: {answer_bytes}, {answer_hex}, {answer_int}")

    def execute_v2_flow(function):
        global contract
        environment.execute_contract(contract, caller=myself, function=function)

    def upgrade_to_v2_flow():
        global contract
        contract.bytecode = project_v2.get_bytecode()
        environment.upgrade_contract(contract, caller=myself)

    def upgrade_to_v1_flow():
        global contract
        contract.bytecode = project_v1.get_bytecode()
        environment.upgrade_contract(contract, caller=myself)

    while True:
        print("Let's run a flow.")
        print("1. Deploy V1")
        print("2. Query V1")
        print("3. Query V2")
        print("4. Call V2: increment")
        print("5. Call V2: decrement")
        print("6. Upgrade V1 -> V2")
        print("7. Upgrade V2 -> V1")

        try:
            choice = int(input("Choose:\n"))
        except Exception:
            break

        flows = [
            None,
            deploy_v1_flow,
            query_v1_flow,
            query_v2_flow,
            lambda: execute_v2_flow("increment"),
            lambda: execute_v2_flow("decrement"),
            upgrade_to_v2_flow,
            upgrade_to_v1_flow
        ]

        flow = flows[choice]
        if flow:
            environment.run_flow(flow)
        else:
            print("Bad choice")
            break
