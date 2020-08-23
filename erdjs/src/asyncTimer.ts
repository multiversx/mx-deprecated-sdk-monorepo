import { errors } from ".";

// TODO add tests for this class
export class AsyncTimer {
    // TODO replace 'any' with a proper type
    private timeout: any = null;
    private rejectTimeoutPromise: any = null;

    constructor() {
    }

    public start(timeout: number): Promise<void> {
        if (this.timeout != null) {
            throw errors.ErrAsyncTimerAlreadyRunning;
        }

        return new Promise<void>((resolve, reject) => {
            this.rejectTimeoutPromise = reject;
            let resolutionCallback = () => {
                console.log('async timer: resolution');
                this.rejectTimeoutPromise = null;
                this.stop();
                resolve();
            };

            this.timeout = setTimeout(resolutionCallback, timeout);
        });
    }

    public abort() {
        if (this.rejectTimeoutPromise != null) {
            this.rejectTimeoutPromise();
            console.log('async timer: promise rejected');
            this.rejectTimeoutPromise = null;
        }
        this.stop();
    }

    public stop() {
        console.log('async timer: stop');
        if (this.timeout != null) {
            clearTimeout(this.timeout);
            console.log('async timer: clearTimeout');
            this.timeout = null;
        }
    }
}
