import keccak from "keccak";
import * as errors from "../errors";
import * as valid from "../utils";
import { Account } from "../account";
import { Provider } from "../interface";
import { SmartContract } from "./interface";
import { SmartContractCall } from "./scCall";
import { SmartContractDeploy } from "./scDeploy";
import { TransactionWatcher } from "../transactionWatcher";
import { Address } from "../address";
import { SimpleSigner } from "../simpleSigner";

export class SmartContractBase implements SmartContract {
    protected provider: Provider | null = null;
    protected scAddress: Address | null = null;
    protected user: Account | null = null;

    protected gasPrice: number | null = null;
    protected gasLimit: number | null = null;
    protected chainID: string;
    protected version: number;

    protected callStatusQueryPeriod: number = 6000;
    protected callStatusQueryTimeout: number = 60000;

    protected signingEnabled: boolean = false;

    constructor(provider: Provider | null, scAddress: Address | null, user: Account, chainID: string, txVersion: number) {
        this.provider = provider;
        this.scAddress = scAddress;
        this.user = user;
        this.chainID = chainID;
        this.version = txVersion;
    }

    public enableSigning(enable: boolean) {
        this.signingEnabled = enable;
    }

    setProvider(provider: Provider | null): void {
        this.provider = provider;
    }

    // public setGasPrice(gasPrice: number) {
    //     //this.gasPrice = valid.GasPrice(gasPrice);
    // }

    // public setGasLimit(gasLimit: number) {
    //     //this.gasLimit = valid.GasLimit(gasLimit);
    // }

    public getAddress(): string {
        if (this.scAddress == null) {
            throw errors.ErrSCAddressNotSet;
        }
        return this.scAddress.toString();
    }

    public async performDeployment(deployment: SmartContractDeploy): Promise<SmartContractDeploy> {
        this.prepareDeployment(deployment);

        if (this.provider != null) {
            try {
                //let txHash = await this.provider.sendTransaction(deployment);
                //deployment.setTxHash(txHash);

                // let watcher = new TransactionWatcher(txHash, this.provider);
                // await watcher.awaitExecuted(
                //     this.callStatusQueryPeriod,
                //     this.callStatusQueryTimeout
                // );
                //deployment.setStatus("executed");
                //this.scAddress = this.computeAddress(deployment);
            } catch (err) {
                console.error(err);
            } finally {
                this.cleanup();
            }
        }

        return deployment;
    }

    protected computeAddress(deployment: SmartContractDeploy): Address {
        if (this.user == null) {
            throw errors.ErrUserAccountNotSet;
        }

        let initialPadding = Buffer.alloc(8, 0);
        let ownerAddressBytes = this.user.address.pubkey();
        let shardSelector = ownerAddressBytes.slice(30);
        let ownerNonceBytes = Buffer.alloc(8);
        ownerNonceBytes.writeBigUInt64LE(BigInt(this.user.nonce.value));
        let bytesToHash = Buffer.concat([ownerAddressBytes, ownerNonceBytes]);
        let hash = keccak('keccak256').update(bytesToHash).digest();
        let vmTypeBytes = Buffer.from(deployment.getVMType(), 'hex');

        let addressBytes = Buffer.concat([
            initialPadding,
            vmTypeBytes,
            hash.slice(10, 30),
            shardSelector
        ]);

        let address = new Address(addressBytes);
        return address;
    }

    public async performCall(call: SmartContractCall): Promise<SmartContractCall> {
        this.prepareCall(call);

        if (this.provider != null) {
            try {
                // let txHash = await this.provider.sendTransaction(call);
                // //call.setTxHash(txHash);

                // let watcher = new TransactionWatcher(txHash, this.provider);
                // await watcher.awaitExecuted(
                //     this.callStatusQueryPeriod,
                //     this.callStatusQueryTimeout
                // );
                //call.setStatus("executed");
                // TODO return smart contract results
            } catch (err) {
                console.error(err);
            } finally {
                this.cleanup();
            }
        }

        return call;
    }

    public prepareDeployment(_deployment: SmartContractDeploy) {
        if (this.user == null) {
            throw errors.ErrUserAccountNotSet;
        }
        // if (this.gasPrice == null) {
        //     throw errors.ErrGasPriceNotSet;
        // }
        // if (this.gasLimit == null) {
        //     throw errors.ErrGasLimitNotSet;
        // }

        // deployment.setNonce(this.user.getNonce());
        // deployment.setSender(this.user.getAddress());
        // deployment.setReceiver(Address.Zero());
        // deployment.setGasLimit(this.gasLimit);
        // deployment.setGasPrice(this.gasPrice);
        // deployment.setChainID(this.chainID);
        // deployment.setVersion(this.version);
        // deployment.prepareData();

        if (this.signingEnabled) {
            // let signer = new SimpleSigner("");
            // signer.sign(deployment);
        }
    }

    public prepareCall(_call: SmartContractCall) {
        if (this.user == null) {
            throw errors.ErrUserAccountNotSet;
        }
        if (this.scAddress == null) {
            throw errors.ErrSCAddressNotSet;
        }
        // if (this.gasPrice == null) {
        //     throw errors.ErrGasPriceNotSet;
        // }
        // if (this.gasLimit == null) {
        //     throw errors.ErrGasLimitNotSet;
        // }

        // call.setNonce(this.user.getNonce());
        // call.setSender(this.user.getAddress());
        // call.setReceiver(this.scAddress.toString());
        // call.setGasLimit(this.gasLimit);
        // call.setGasPrice(this.gasPrice);
        // call.setChainID(this.chainID);
        // call.setVersion(this.version);
        // call.prepareData();

        if (this.signingEnabled) {
            // let signer = new SimpleSigner("");
            // signer.sign(call);
        }
    }

    public cleanup() {
        this.gasPrice = null;
        this.gasLimit = null;
    }
}


// import base64
// import logging
// from typing import Any, List

// from Cryptodome.Hash import keccak

// from erdpy import config, errors, utils
// from erdpy.accounts import Address
// from erdpy.transactions import Transaction

// logger = logging.getLogger("contracts")

// VM_TYPE_ARWEN = "0500"


// class SmartContract:
//     def __init__(self, address=None, bytecode=None, metadata=None):
//         self.address = Address(address)
//         self.bytecode = bytecode
//         self.metadata = metadata or CodeMetadata()

//     def deploy(self, owner, arguments, gas_price, gas_limit, value, chain, version) -> Transaction:
//         self.owner = owner
//         self.compute_address()

//         arguments = arguments or []
//         gas_price = int(gas_price)
//         gas_limit = int(gas_limit)
//         value = str(value or "0")

//         tx = Transaction()
//         tx.nonce = owner.nonce
//         tx.value = value
//         tx.sender = owner.address.bech32()
//         tx.receiver = Address.zero().bech32()
//         tx.gasPrice = gas_price
//         tx.gasLimit = gas_limit
//         tx.data = self.prepare_deploy_transaction_data(arguments)
//         tx.chainID = chain
//         tx.version = version

//         tx.sign(owner)
//         return tx

//     def prepare_deploy_transaction_data(self, arguments):
//         tx_data = f"{self.bytecode}@{VM_TYPE_ARWEN}@{self.metadata.to_hex()}"

//         for arg in arguments:
//             tx_data += f"@{_prepare_argument(arg)}"

//         return tx_data

//     def compute_address(self):
//         """
//         8 bytes of zero + 2 bytes for VM type + 20 bytes of hash(owner) + 2 bytes of shard(owner)
//         """
//         owner_bytes = self.owner.address.pubkey()
//         nonce_bytes = self.owner.nonce.to_bytes(8, byteorder="little")
//         bytes_to_hash = owner_bytes + nonce_bytes
//         address = keccak.new(digest_bits=256).update(bytes_to_hash).digest()
//         address = bytes([0] * 8) + bytes([5, 0]) + address[10:30] + owner_bytes[30:]
//         self.address = Address(address)

//     def execute(self, caller, function, arguments, gas_price, gas_limit, value, chain, version) -> Transaction:
//         self.caller = caller

//         arguments = arguments or []
//         gas_price = int(gas_price)
//         gas_limit = int(gas_limit)
//         value = str(value or "0")

//         tx = Transaction()
//         tx.nonce = caller.nonce
//         tx.value = value
//         tx.sender = caller.address.bech32()
//         tx.receiver = self.address.bech32()
//         tx.gasPrice = gas_price
//         tx.gasLimit = gas_limit
//         tx.data = self.prepare_execute_transaction_data(function, arguments)
//         tx.chainID = chain
//         tx.version = version

//         tx.sign(caller)
//         return tx

//     def prepare_execute_transaction_data(self, function, arguments):
//         tx_data = function

//         for arg in arguments:
//             tx_data += f"@{_prepare_argument(arg)}"

//         return tx_data

//     def upgrade(self, owner, arguments, gas_price, gas_limit, value, chain, version) -> Transaction:
//         self.owner = owner

//         arguments = arguments or []
//         gas_price = int(gas_price or config.DEFAULT_GAS_PRICE)
//         gas_limit = int(gas_limit)
//         value = str(value or "0")

//         tx = Transaction()
//         tx.nonce = owner.nonce
//         tx.value = value
//         tx.sender = owner.address.bech32()
//         tx.receiver = self.address.bech32()
//         tx.gasPrice = gas_price
//         tx.gasLimit = gas_limit
//         tx.data = self.prepare_upgrade_transaction_data(arguments)
//         tx.chainID = chain
//         tx.version = version

//         tx.sign(owner)
//         return tx

//     def prepare_upgrade_transaction_data(self, arguments):
//         tx_data = f"upgradeContract@{self.bytecode}@{self.metadata.to_hex()}"

//         for arg in arguments:
//             tx_data += f"@{_prepare_argument(arg)}"

//         return tx_data

//     def query(self, proxy, function, arguments) -> List[Any]:
//         arguments = arguments or []
//         prepared_arguments = [_prepare_argument(argument) for argument in arguments]

//         payload = {
//             "ScAddress": self.address.bech32(),
//             "FuncName": function,
//             "Args": prepared_arguments
//         }

//         response = proxy.query_contract(payload)
//         return_data = response.get("data", {}).get("ReturnData")
//         return [self._interpret_return_data(data) for data in return_data]

//     def _interpret_return_data(self, data):
//         try:
//             as_bytes = base64.b64decode(data)
//             as_hex = as_bytes.hex()
//             as_number = int(as_hex, 16)

//             result = utils.Object()
//             result.base64 = data
//             result.hex = as_hex
//             result.number = as_number
//             return result
//         except Exception:
//             logger.warn(f"Cannot interpret return data: {data}")
//             return None


// def _prepare_argument(argument):
//     hex_prefix = "0X"
//     as_string = str(argument).upper()

//     if as_string.startswith(hex_prefix):
//         return as_string[len(hex_prefix):]

//     if not as_string.isnumeric():
//         raise errors.UnknownArgumentFormat(as_string)

//     as_number = int(as_string)
//     as_hexstring = hex(as_number)[len(hex_prefix):]
//     if len(as_hexstring) % 2 == 1:
//         as_hexstring = "0" + as_hexstring

//     return as_hexstring


// class CodeMetadata:
//     def __init__(self, upgradeable=True, payable=False):
//         self.upgradeable = upgradeable
//         self.payable = payable

//     def to_hex(self):
//         return ("01" if self.upgradeable else "00") + ("02" if self.payable else "00")
