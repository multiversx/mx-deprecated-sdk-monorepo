import logging

from erdpy.building.builder import CCodebase
from erdpy.gateways import DebugGateway
from erdpy.contracts import SmartContract

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
    print("Bytecode:", bytecode)

    # Now, we can deploy the smart contract on node-debug.
    contract = SmartContract(bytecode=bytecode)
    gateway = DebugGateway()
    tx_hash, contract_address = gateway.deploy_contract(contract)
    print("Tx hash:", tx_hash)
    print("Contract address:", contract_address)

    def myflow():
        gateway.deploy_contract(contract)
        # assert ...
        # gateway.execute_contract(contract)
        # assert ...
    
    gateway.run_flow(myflow)


