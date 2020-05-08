import { Provider } from "../providers/interface";
import { Account, Address, AccountSigner } from "../data/account";
import { SmartContractCall } from "./scCall";
import * as valid from "../data/validation";
import * as errors from "../errors";
import { TransactionWatcher } from "../data/transaction";
import { SmartContract } from "./interface";

export class SmartContractBase implements SmartContract {
    protected provider: Provider | null = null;
    protected scAddress: Address | null = null;
    protected user: Account | null = null

    protected gasPrice: number | null = null;
    protected gasLimit: number | null = null;

    protected callStatusQueryPeriod: number = 4000;
    protected callStatusQueryTimeout: number = 60000;

    protected signingEnabled: boolean = false;

    constructor(provider: Provider | null, scAddress: Address, user: Account) {
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

    public async performCall(call: SmartContractCall): Promise<SmartContractCall> {
        this.prepareCall(call);

        if (this.provider != null) {
            try {
                // TODO replace this with external sending
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
                this.cleanupCall();
            }
        }

        return call;
    }

    public cleanupCall() {
        this.gasPrice = null;
        this.gasLimit = null;
    }
}
