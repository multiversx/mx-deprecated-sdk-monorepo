import logging
import base64

from erdpy.building.builder import CCodebase
from erdpy.gateways import DebugGateway
from erdpy.contracts import SmartContract

logger = logging.getLogger("examples")

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    # First, create a sample project called "hello" based on the template "ultimate-answer" (written in C)
    # python3 -m erdpy.cli new --template ultimate-answer --directory ./examples hello

    # Create a codebase object afterwards
    codebase = CCodebase("./examples/hello")

    # This will build the smart contract.
    # If the buildchain is missing, it will be installed automatically.
    codebase.build(debug=True)

    # We can inspect the bytecode like this:
    bytecode = codebase.get_bytecode()
    logger.info("Bytecode: %s", bytecode)

    # Now, we can deploy the smart contract on node-debug.
    contract = SmartContract(bytecode=bytecode)
    gateway = DebugGateway()

    answer = None

    def myflow():
        alice = "aaaaaaaa112233441122334411223344112233441122334411223344aaaaaaaa"
        tx, address = gateway.deploy_contract(contract, sender=alice)
        
        assert address is not None
        logger.info("Tx hash: %s", tx)
        logger.info("Contract address: %s", address)
        
        answer = gateway.query_contract(contract, "getUltimateAnswer")[0]
        answer_bytes = base64.decodebytes(b"Kg==")
        answer_hex = answer_bytes.hex()
        answer_int = int(answer_hex, 16)
        logger.info(f"Answer: {answer}, {answer_bytes}, {answer_hex}, {answer_int}")


    gateway.run_flow(myflow)