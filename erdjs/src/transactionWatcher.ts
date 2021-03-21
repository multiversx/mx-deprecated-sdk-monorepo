import { IProvider } from "./interface";
import { AsyncTimer } from "./asyncTimer";
import { TransactionHash, TransactionStatus } from "./transaction";
import { TransactionOnNetwork } from "./transactionOnNetwork";
import * as errors from "./errors";
import { Logger } from "./logger";

export type PredicateIsAwaitedStatus = (status: TransactionStatus) => boolean;
export type ActionOnStatusReceived = (status: TransactionStatus) => void;

/**
 * TransactionWatcher allows one to continuously watch (monitor), by means of polling, the status of a given transaction.
 */
export class TransactionWatcher {
    static DefaultPollingInterval: number = 6000;
    static DefaultTimeout: number = TransactionWatcher.DefaultPollingInterval * 15;

    static NoopOnStatusReceived = (_: TransactionStatus) => {};

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
        await this.awaitStatus(status => status.isPending(), onStatusReceived || TransactionWatcher.NoopOnStatusReceived);
    }

    /**
      * Waits until the transaction reaches the "executed" status.
      */
    public async awaitExecuted(onStatusReceived?: ActionOnStatusReceived): Promise<void> {
        await this.awaitStatus(status => status.isExecuted(), onStatusReceived || TransactionWatcher.NoopOnStatusReceived);
    }

    /**
     * Waits until the predicate over the transaction status evaluates to "true".
     * @param isAwaitedStatus A predicate over the status
     */
    public async awaitStatus(isAwaitedStatus: PredicateIsAwaitedStatus, onStatusReceived: ActionOnStatusReceived): Promise<void> {
        let doFetch = async () => await this.provider.getTransactionStatus(this.hash);
        let errorProvider = () => new errors.ErrExpectedTransactionStatusNotReached();

        return this.awaitConditionally<TransactionStatus>(
            isAwaitedStatus,
            doFetch,
            onStatusReceived,
            errorProvider
        );
    }

    public async awaitNotarized(): Promise<void> {
        let isNotarized = (data: TransactionOnNetwork) => !data.hyperblockHash.isEmpty();
        let doFetch = async () => await this.provider.getTransaction(this.hash);
        let errorProvider = () => new errors.ErrTransactionWatcherTimeout();

        return this.awaitConditionally<TransactionOnNetwork>(
            isNotarized,
            doFetch,
            (_) => {},
            errorProvider
        );
    }

    public async awaitConditionally<TData>(
        isSatisfied: (data: TData) => boolean,
        doFetch: () => Promise<TData>,
        onFetched: (data: TData) => void,
        createError: () => errors.Err
    ): Promise<void> {
        let periodicTimer = new AsyncTimer("watcher:periodic");
        let timeoutTimer = new AsyncTimer("watcher:timeout");

        let stop = false;
        let fetchedData: TData | undefined = undefined;

        timeoutTimer.start(this.timeout).finally(() => {
            timeoutTimer.stop();
            stop = true;
        });

        while (!stop) {
            try {
                fetchedData = await doFetch();

                if (onFetched) {
                    onFetched(fetchedData);
                }

                if (isSatisfied(fetchedData) || stop) {
                    break;
                }
            } catch (error) {
                if (!(error instanceof errors.Err)) {
                    throw error;
                }

                Logger.info("cannot (yet) fetch data");
            }

            await periodicTimer.start(this.pollingInterval);
        }

        if (!timeoutTimer.isStopped()) {
            timeoutTimer.stop();
        }

        let notSatisfied = !fetchedData || !isSatisfied(fetchedData);
        if (notSatisfied) {
            let error = createError();
            throw error;
        }
    }
}
