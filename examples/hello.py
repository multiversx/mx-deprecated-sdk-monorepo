import logging
import base64

from erdpy.projects import ProjectClang
from erdpy.environments import DebugEnvironment
from erdpy.contracts import SmartContract
from erdpy.accounts import Account

logger = logging.getLogger("examples")

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    # First, create a sample project called "hello" based on the template "ultimate-answer" (written in C)
    # erdpy new --template ultimate-answer --directory ./examples hello

    # Create a project object afterwards
    project = ProjectClang("./examples/contracts/hello")

    # This will build the smart contract.
    # If the buildchain is missing, it will be installed automatically.
    project.build()

    # We can inspect the bytecode like this:
    bytecode = project.get_bytecode()
    logger.info("Bytecode: %s", bytecode)

    # Now, we create a environment which intermediates deployment and execution
    environment = DebugEnvironment()
    # We initialize the smart contract with the compiled bytecode.
    contract = SmartContract(bytecode=bytecode)

    # A flow defines the desired steps to interact with the contract.
    def myflow():
        # First, we deploy the contract in the name of Alice.
        alice = Account("aaaaaaaa112233441122334411223344112233441122334411223344aaaaaaaa")
        tx, address = environment.deploy_contract(contract, owner=alice)
        logger.info("Tx hash: %s", tx)
        logger.info("Contract address: %s", address)
        
        # Secondly, we execute a pure function of the contract.
        answer = environment.query_contract(contract, "getUltimateAnswer")[0]
        answer_bytes = base64.b64decode(answer)
        answer_hex = answer_bytes.hex()
        answer_int = int(answer_hex, 16)
        logger.info(f"Answer: {answer_bytes}, {answer_hex}, {answer_int}")


    # This is how we run a defined flow.
    environment.run_flow(myflow)