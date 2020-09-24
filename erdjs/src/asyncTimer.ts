import { errors } from ".";
import { ErrAsyncTimerAborted } from "./errors";

/*
 * AsyncTimer is an async-friendly abstraction that wraps JavaScript's setTimeout() and clearTimeout().
 */
export class AsyncTimer {
    private timeoutHandle: any = null;
    private rejectionFunc: any = null;

    constructor() {
    }

    /**
     * Starts the timer.
     * @param timeout The time (in milliseconds) to wait until resolving the promise.
     */
    public start(timeout: number): Promise<void> {
        console.debug("AsyncTimer.start()");

        if (this.timeoutHandle) {
            throw new errors.ErrAsyncTimerAlreadyRunning();
        }

        return new Promise<void>((resolve, reject) => {
            this.rejectionFunc = reject;

            let timeoutCallback = () => {
                this.rejectionFunc = null;
                this.stop();
                resolve();
            };

            this.timeoutHandle = setTimeout(timeoutCallback, timeout);
        });
    }

    /**
     * Aborts the timer: rejects the promise (if any) and stops the timer.
     */
    public abort() {
        console.debug("AsyncTimer.abort()");

        if (this.rejectionFunc) {
            this.rejectionFunc(new ErrAsyncTimerAborted());
            this.rejectionFunc = null;
        }

        this.stop();
    }

    /**
     * Stops the timer.
     */
    public stop() {
        console.debug("AsyncTimer.stop()");

        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }
}
