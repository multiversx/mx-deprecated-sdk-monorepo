import { IProvider } from "./interface";
import { AsyncTimer } from "./asyncTimer";
import { TransactionHash, TransactionStatus } from "./transaction";
import * as errors from "./errors";
import { Logger } from "./logger";

export type PredicateIsAwaitedStatus = (status: TransactionStatus) => boolean;
export type ActionOnStatusReceived = (status: TransactionStatus) => void;

/**
 * TransactionWatcher allows one to continuously watch (monitor), by means of polling, the status of a given transaction.
 */
export class TransactionWatcher {
    static DefaultPollingInterval: number = 5000;
    static DefaultTimeout: number = TransactionWatcher.DefaultPollingInterval * 10;

    private readonly hash: TransactionHash;
    private readonly provider: IProvider;
    private readonly pollingInterval: number;
    private readonly timeout: number;

    /**
     * 
     * @param hash The hash of the transaction to watch
     * @param provider The provider to query the status from
     * @param pollingInterval The polling interval, in milliseconds
     * @param timeout The timeout, in milliseconds
     */
    constructor(
        hash: TransactionHash,
        provider: IProvider,
        pollingInterval: number = TransactionWatcher.DefaultPollingInterval,
        timeout: number = TransactionWatcher.DefaultTimeout
    ) {
        this.hash = hash;
        this.provider = provider;
        this.pollingInterval = pollingInterval;
        this.timeout = timeout;
    }

    /**
     * Waits until the transaction reaches the "pending" status.
     */
    public async awaitPending(onStatusReceived?: ActionOnStatusReceived): Promise<void> {
        await this.awaitStatus(status => status.isPending(), onStatusReceived);
    }

    /**
      * Waits until the transaction reaches the "executed" status.
      */
    public async awaitExecuted(onStatusReceived?: ActionOnStatusReceived): Promise<void> {
        await this.awaitStatus(status => status.isExecuted(), onStatusReceived);
    }

    /**
     * Waits until the predicate over the transaction status evaluates to "true".
     * @param isAwaitedStatus A predicate over the status
     */
    public async awaitStatus(
        isAwaitedStatus: PredicateIsAwaitedStatus,
        onStatusReceived?: ActionOnStatusReceived,
    ): Promise<void> {
        let periodicTimer = new AsyncTimer("watcher:periodic");
        let timeoutTimer = new AsyncTimer("watcher:timeout");

        let stop = false;
        let currentStatus: TransactionStatus = TransactionStatus.createUnknown();

        timeoutTimer.start(this.timeout).finally(() => {
            timeoutTimer.stop();
            stop = true;
        });

        while (!stop) {
            try {
                currentStatus = await this.provider.getTransactionStatus(this.hash);
                
                if (onStatusReceived) {
                    onStatusReceived(currentStatus);
                }

                if (isAwaitedStatus(currentStatus) || stop) {
                    break;
                }
            } catch (error) {
                Logger.trace("cannot (yet) get status");
            }

            await periodicTimer.start(this.pollingInterval);
        }

        if (!timeoutTimer.isStopped()) {
            timeoutTimer.stop();
        }

        if (!isAwaitedStatus(currentStatus)) {
            throw new errors.ErrExpectedTransactionStatusNotReached();
        }
    }
}
