import base64
import logging

from erdpy.accounts import Account
from erdpy.contracts import SmartContract
from erdpy.hosts import TestnetHost
from erdpy.projects import ProjectClang

logger = logging.getLogger("examples")

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    # First, create a sample project called "hello" based on the template "ultimate-answer" (written in C)
    # python3 -m erdpy.cli new --template ultimate-answer --directory ./examples hello

    # Create a project object afterwards
    project = ProjectClang("./examples/contracts/hello")

    # This will build the smart contract.
    # If the buildchain is missing, it will be installed automatically.
    project.build(debug=True)

    # We can inspect the bytecode like this:
    bytecode = project.get_bytecode()
    logger.info("Bytecode: %s", bytecode)

    # Now, we create a host which intermediates deployment and execution
    host = TestnetHost("https://wallet-api.elrond.com")
    alice = Account(
        address="8eb27b2bcaedc6de11793cf0625a4f8d64bf7ac84753a0b6c5d6ceb2be7eb39d",
        pem_file="./examples/keys/alice.pem"
    )

    # We initialize the smart contract contract with an actual address if it was previously deployed,
    # so that we can start to interact with it ("query_flow")
    contract = SmartContract(
        address="00000000000000000500de287dcbcaa9b5867c7c83b489ab1a1a40ea4f39b39d"
    )

    # A flow defines the desired steps to interact with the contract.
    def deploy_flow():
        global contract

        # For deploy, we initialize the smart contract with the compiled bytecode
        contract = SmartContract(bytecode=bytecode)
        tx, address = host.deploy_contract(contract, owner=alice)
        logger.info("Tx hash: %s", tx)
        logger.info("Contract address: %s", address)

    def query_flow():
        global contract

        answer = host.query_contract(contract, "getUltimateAnswer")[0]
        answer_bytes = base64.b64decode(answer)
        answer_hex = answer_bytes.hex()
        answer_int = int(answer_hex, 16)
        logger.info(f"Answer: {answer_bytes}, {answer_hex}, {answer_int}")

    while True:
        print("Let's run a flow.")
        print("1. Deploy smart contract")
        print("2. Query smart contract")
        
        choice = int(input("Choose:\n"))

        if choice == 1:
            host.run_flow(deploy_flow)
        elif choice == 2:
            host.run_flow(query_flow)
