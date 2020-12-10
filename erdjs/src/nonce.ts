import { Account } from "./account";
import { Address } from "./address";
import * as errors from "./errors";
import { IProvider } from "./interface";

/**
 * The nonce, as an immutable object.
 */
export class Nonce {
    /**
     * The actual numeric value.
     */
    private readonly value: number;

    /**
     * Creates a Nonce object given a value.
     */
    constructor(value: number) {
        value = Number(value);

        if (Number.isNaN(value) || value < 0) {
            throw new errors.ErrNonceInvalid(value);
        }

        this.value = value;
    }

    /**
     * Creates a new Nonce object by incrementing the current one.
     */
    increment(): Nonce {
        return new Nonce(this.value + 1);
    }

    valueOf(): number {
        return this.value;
    }
}

export class NonceTracker {
    private readonly account: Account;
    private readonly provider: IProvider;
    private isInSync: boolean;

    constructor(address: Address, provider: IProvider) {
        this.account = new Account(address);
        this.provider = provider;
        this.isInSync = false;
    }

    // TODO: Implement state machine.

    onTransactionBroadcastedWithSuccess() {
        // could be good nonce, competing nonce or higher nonce (producing gaps)
        this.account.incrementNonce();
    }

    onTransactionBroadcastedWithError() {
        this.markOutOfSync();
    }

    onIntervalExpired() {
        this.markOutOfSync();
    }

    async getNonce(): Promise<Nonce> {
        if (!this.isInSync) {
            await this.sync();
        }

        return this.account.nonce;
    }

    private async sync() {
        await this.account.sync(this.provider);
        this.isInSync = true;
    }

    private markOutOfSync() {
        this.isInSync = false;
    }
}
