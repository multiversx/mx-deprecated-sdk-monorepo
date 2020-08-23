import { Provider } from "./interface";
import { errors } from ".";
import { AsyncTimer } from "./asyncTimer";

export class TransactionWatcher {
    private txHash: string = "";
    private provider: Provider | null = null;
    private stop: boolean = false;

    constructor(hash: string, provider: Provider) {
        this.txHash = hash;
        this.provider = provider;
    }

    public async awaitReceived(period: number, timeout: number): Promise<void> {
        // TODO "executed" or later, not just "executed"
        await this.awaitStatus("received", period, timeout);
    }

    public async awaitExecuted(period: number, timeout: number): Promise<void> {
        // TODO "executed" or later, not just "executed"
        await this.awaitStatus("executed", period, timeout);
    }

    public async awaitStatus(awaited_status: string, period: number, timeout: number): Promise<void> {
        if (this.provider == null) {
            throw errors.ErrProviderNotSet;
        }

        this.stop = false;

        let txStatus = "";
        let periodicTimer = new AsyncTimer();
        let timeoutTimer = new AsyncTimer();
        timeoutTimer.start(timeout).finally(() => {console.log('timeoutTimer.stop'); timeoutTimer.stop(); this.stop = true;});
        while (!this.stop) {
            console.log('getting status for', this.txHash);
            txStatus = await this.provider.getTransactionStatus(this.txHash);
            console.log('status', txStatus);
            if (txStatus != awaited_status && !this.stop) {
                console.log('not done yet, and stop =', this.stop, ', waiting');
                await periodicTimer.start(period);
                console.log('done waiting');
            } else {
                console.log('stop');
                break;
            }
        }

        timeoutTimer.stop();

        let result = false;
        if (!this.stop && txStatus == awaited_status) {
            result = true;
        }

        console.log('exiting expectExecuted() with result =', result);

        if (!result) {
            throw errors.ErrExpectedTransactionStatusNotReached;
        }
    }
}
