import { assert } from "chai";
import { TransactionWatcher } from "./transactionWatcher";
import { TransactionHash, TransactionOnNetwork, TransactionStatus } from "./transaction";
import { MockProvider, Wait } from "./testutils";
import { Nonce } from "./nonce";


describe("test transactionWatcher", () => {
    it("should await status == executed", async () => {
        let hash = new TransactionHash("abba");
        let provider = new MockProvider();
        let watcher = new TransactionWatcher(hash, provider, 42, 42 * 42);

        provider.mockPutTransaction(hash, new TransactionOnNetwork({
            nonce: new Nonce(7),
            status: TransactionStatus.createUnknown()
        }));

        await Promise.all([
            provider.mockTransactionTimeline(hash, [new Wait(40), new TransactionStatus("pending"), new Wait(40), new TransactionStatus("executed")]),
            watcher.awaitExecuted(),
        ]);

        assert.isTrue((await provider.getTransactionStatus(hash)).isExecuted());
    });
});
