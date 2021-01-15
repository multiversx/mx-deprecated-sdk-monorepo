import { assert } from "chai";
import * as errors from "./errors";
import { AsyncTimer } from "./asyncTimer";


describe("test asyncTimer", () => {
    it("should start timer and resolve promise", async () => {
        let timer = new AsyncTimer("test");
        await timer.start(42);

        // No assertion needed.
    });

    it("should abort a very long-running timer", async () => {
        let error: Error | null = null;

        let shortTimer = new AsyncTimer("short");
        let longTimer = new AsyncTimer("long");

        let shortPromise = shortTimer.start(42);
        let longPromise = longTimer.start(42000);

        let shortTimerThenAbortLongTimer = shortPromise.then(() => longTimer.abort());
        let longTimerThenCatchAbort = longPromise.catch(reason => error = reason);

        await Promise.all([shortTimerThenAbortLongTimer, longTimerThenCatchAbort]);

        assert.instanceOf(error, errors.ErrAsyncTimerAborted);
    });
});
