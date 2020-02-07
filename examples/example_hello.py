import logging
import base64

from erdpy.building.builder import CodebaseC
from erdpy.gateways import DebugGateway
from erdpy.contracts import SmartContract

logger = logging.getLogger("examples")

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    # First, create a sample project called "hello" based on the template "ultimate-answer" (written in C)
    # python3 -m erdpy.cli new --template ultimate-answer --directory ./examples hello

    # Create a codebase object afterwards
    codebase = CodebaseC("./examples/hello")

    # This will build the smart contract.
    # If the buildchain is missing, it will be installed automatically.
    codebase.build(debug=True)

    # We can inspect the bytecode like this:
    bytecode = codebase.get_bytecode()
    logger.info("Bytecode: %s", bytecode)

    # Now, we create a gateway which intermediates deployment and execution
    gateway = DebugGateway()
    # We initialize the smart contract with the compiled bytecode.
    contract = SmartContract(bytecode=bytecode)

    # A flow defines the desired steps to interact with the contract.
    def myflow():
        # First, we deploy the contract in the name of Alice.
        alice = "aaaaaaaa112233441122334411223344112233441122334411223344aaaaaaaa"
        tx, address = gateway.deploy_contract(contract, sender=alice)
        logger.info("Tx hash: %s", tx)
        logger.info("Contract address: %s", address)
        
        # Secondly, we execute a pure function of the contract.
        answer = gateway.query_contract(contract, "getUltimateAnswer")[0]
        answer_bytes = base64.b64decode(answer)
        answer_hex = answer_bytes.hex()
        answer_int = int(answer_hex, 16)
        logger.info(f"Answer: {answer_bytes}, {answer_hex}, {answer_int}")


    # This is how we run a defined flow.
    gateway.run_flow(myflow)