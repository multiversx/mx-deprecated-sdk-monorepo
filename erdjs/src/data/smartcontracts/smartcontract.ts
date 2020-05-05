import { Provider } from "../../providers/interface";
import { Account, Address, AccountSigner } from "../account";
import { SmartContractCall } from "./scCall";
import * as valid from "../validation";
import * as errors from "../errors";
import { TransactionWatcher } from "../transaction";

export class SmartContract {
    protected provider: Provider | null = null;
    protected scAddress: Address | null = null;
    protected user: Account | null = null

    protected gasPrice: number | null = null;
    protected gasLimit: number | null = null;

    protected callStatusQueryPeriod: number = 4000;
    protected callStatusQueryTimeout: number = 60000;

    constructor(provider: Provider, scAddress: Address, user: Account) {
        this.provider = provider;
        this.scAddress = scAddress;
        this.user = user;
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

        // TODO Replace this with external signing
        let signer = new AccountSigner(this.user);
        signer.sign(call);
    }

    public async performCall(call: SmartContractCall): Promise<void> {
        if (this.provider == null) {
            throw errors.ErrProviderNotSet;
        }

        this.prepareCall(call);

        try {
            // TODO replace this with external sending
            let txHash = await this.provider.sendTransaction(call);
            call.setTxHash(txHash);

            let watcher = new TransactionWatcher(txHash, this.provider);
            let result = await watcher.awaitExecuted(
                this.callStatusQueryPeriod,
                this.callStatusQueryTimeout
            );

            // TODO return smart contract results
        } catch (err) {
            console.error(err);
        }
    }

    public cleanupCall() {
        this.gasPrice = null;
        this.gasLimit = null;
    }
}
