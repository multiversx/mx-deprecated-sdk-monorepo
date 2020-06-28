import keccak from "keccak";
import * as errors from "../errors";
import * as valid from "../data/validation";
import { Account, Address, AccountSigner } from "../data/account";
import { Provider } from "../providers/interface";
import { SmartContract } from "./interface";
import { SmartContractCall } from "./scCall";
import { SmartContractDeploy } from "./scDeploy";
import { TransactionWatcher } from "../data/transaction";

export class SmartContractBase implements SmartContract {
    protected provider: Provider | null = null;
    protected scAddress: Address | null = null;
    protected user: Account | null = null;

    protected gasPrice: number | null = null;
    protected gasLimit: number | null = null;

    protected callStatusQueryPeriod: number = 4000;
    protected callStatusQueryTimeout: number = 60000;

    protected signingEnabled: boolean = false;

    constructor(provider: Provider | null, scAddress: Address | null, user: Account) {
        this.provider = provider;
        this.scAddress = scAddress;
        this.user = user;
    }

    public enableSigning(enable: boolean) {
        this.signingEnabled = enable;
    }

    setProvider(provider: Provider | null): void {
        this.provider = provider;
    }

    public setGasPrice(gasPrice: number) {
        this.gasPrice = valid.GasPrice(gasPrice);
    }

    public setGasLimit(gasLimit: number) {
        this.gasLimit = valid.GasLimit(gasLimit);
    }

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
                let txHash = await this.provider.sendTransaction(deployment);
                deployment.setTxHash(txHash);

                let watcher = new TransactionWatcher(txHash, this.provider);
                await watcher.awaitExecuted(
                    this.callStatusQueryPeriod,
                    this.callStatusQueryTimeout
                );
                deployment.setStatus("executed");
                this.scAddress = this.computeAddress(deployment);
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
        let ownerAddressBytes = this.user.getAddressObject().bytes();
        let shardSelector = ownerAddressBytes.slice(30);
        let ownerNonceBytes = Buffer.alloc(8);
        ownerNonceBytes.writeBigUInt64LE(BigInt(this.user.getNonce()));
        let bytesToHash = Buffer.concat([ownerAddressBytes, ownerNonceBytes]);
        let hash = keccak('keccak256').update(bytesToHash).digest();
        let vmTypeBytes = Buffer.from(deployment.getVMType(), 'hex');

        let addressBytes = Buffer.concat([
            initialPadding,
            vmTypeBytes,
            hash.slice(10, 30),
            shardSelector
        ]);

        let address= new Address().setBytes(addressBytes);
        return address;
    }

    public async performCall(call: SmartContractCall): Promise<SmartContractCall> {
        this.prepareCall(call);

        if (this.provider != null) {
            try {
                let txHash = await this.provider.sendTransaction(call);
                call.setTxHash(txHash);

                let watcher = new TransactionWatcher(txHash, this.provider);
                await watcher.awaitExecuted(
                    this.callStatusQueryPeriod,
                    this.callStatusQueryTimeout
                );
                call.setStatus("executed");
                // TODO return smart contract results
            } catch (err) {
                console.error(err);
            } finally {
                this.cleanup();
            }
        }

        return call;
    }

    public prepareDeployment(deployment: SmartContractDeploy) {
        if (this.user == null) {
            throw errors.ErrUserAccountNotSet;
        }
        if (this.gasPrice == null) {
            throw errors.ErrGasPriceNotSet;
        }
        if (this.gasLimit == null) {
            throw errors.ErrGasLimitNotSet;
        }

        let deploymentAddress = new Address().setBytes(Buffer.alloc(32, 0));

        deployment.setNonce(this.user.getNonce());
        deployment.setSender(this.user.getAddress());
        deployment.setReceiver(deploymentAddress.toString());
        deployment.setGasLimit(this.gasLimit);
        deployment.setGasPrice(this.gasPrice);
        deployment.prepareData();

        if (this.signingEnabled) {
            let signer = new AccountSigner(this.user);
            signer.sign(deployment);
        }
    }

    public prepareCall(call: SmartContractCall) {
        if (this.user == null) {
            throw errors.ErrUserAccountNotSet;
        }
        if (this.scAddress == null) {
            throw errors.ErrSCAddressNotSet;
        }
        if (this.gasPrice == null) {
            throw errors.ErrGasPriceNotSet;
        }
        if (this.gasLimit == null) {
            throw errors.ErrGasLimitNotSet;
        }

        call.setNonce(this.user.getNonce());
        call.setSender(this.user.getAddress());
        call.setReceiver(this.scAddress.toString());
        call.setGasLimit(this.gasLimit);
        call.setGasPrice(this.gasPrice);
        call.prepareData();

        if (this.signingEnabled) {
            let signer = new AccountSigner(this.user);
            signer.sign(call);
        }
    }

    public cleanup() {
        this.gasPrice = null;
        this.gasLimit = null;
    }
}
