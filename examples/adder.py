import logging
import base64

from erdpy.projects import ProjectRust
from erdpy.environments import DebugEnvironment
from erdpy.contracts import SmartContract
from erdpy.accounts import Account

logger = logging.getLogger("examples")

if __name__ == '__main__':
    logging.basicConfig(level=logging.DEBUG)

    project = ProjectRust("./examples/contracts/myadder")
    project.build()
    bytecode = project.get_bytecode()

    environment = DebugEnvironment()
    contract = SmartContract(bytecode=bytecode)

    def myflow():
        alice = Account("aaaaaaaa112233441122334411223344112233441122334411223344aaaaaaaa")
        tx, address = environment.deploy_contract(contract, owner=alice, arguments=["0x64"])
        logger.info("Tx hash: %s", tx)
        logger.info("Contract address: %s", address)

        querySum()
        environment.execute_contract(contract, alice, "add", arguments=["100"])
        querySum()

    def querySum():
        answer = environment.query_contract(contract, "getSum")[0]
        answer_bytes = base64.b64decode(answer)
        answer_hex = answer_bytes.hex()
        answer_int = int(answer_hex, 16)
        logger.info(f"Answer: {answer_int}")

    environment.run_flow(myflow)
