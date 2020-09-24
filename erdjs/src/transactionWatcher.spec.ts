import { describe } from "mocha";
import { assert } from "chai";
import { AsyncTimer } from "./asyncTimer";
import { TransactionWatcher } from "./transactionWatcher";
import { TransactionHash } from "./transaction";
import { MockProvider } from "./mockProvider";
import { TransactionOnNetwork, TransactionStatus } from ".";
import { Nonce } from "./nonce";


describe("test transactionWatcher", () => {
    it("should await status == executed", async () => {
        let hash = new TransactionHash("abba");
        let provider = new MockProvider();
        let watcher = new TransactionWatcher(hash, provider, 42, 42 * 3);
        let mockTimeline = new AsyncTimer("mockTimeline");

        provider.mockPutTransaction(hash, new TransactionOnNetwork({
            nonce: new Nonce(7),
            status: TransactionStatus.createUnknown()
        }));

        await Promise.all([
            mockTimeline.start(0)
                .then(() => mockTimeline.start(40))
                .then(() => {
                    provider.mockUpdateTransaction(hash, transaction => {
                        transaction.status = new TransactionStatus("pending");
                    });
                })
                .then(() => mockTimeline.start(40))
                .then(() => {
                    provider.mockUpdateTransaction(hash, transaction => {
                        transaction.status = new TransactionStatus("executed");
                    });
                }),

            watcher.awaitExecuted(),
        ]);

        assert.isTrue((await provider.getTransactionStatus(hash)).isExecuted());
    });
});
