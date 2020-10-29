import { describe } from "mocha";
import { assert } from "chai";
import { Transaction } from "./transaction";
import * as errors from "./errors";
import { Nonce } from "./nonce";
import { GasLimit, GasPrice } from "./networkParams";


describe("test transaction", () => {
    let nonce: any = 42;
    let gasLimit: any = 42;
    let gasPrice: any = 42;

    it("should throw error when bad types", () => {
        assert.throw(() => new Transaction({ nonce: nonce }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasLimit: gasLimit }), errors.ErrBadType);
        assert.throw(() => new Transaction({ gasPrice: gasPrice }), errors.ErrBadType);

        assert.doesNotThrow(() => new Transaction({}));
        assert.doesNotThrow(() => new Transaction({ nonce: new Nonce(42), gasLimit: new GasLimit(42), gasPrice: new GasPrice(42) }));
        assert.doesNotThrow(() => new Transaction({ nonce: undefined, gasLimit: undefined, gasPrice: undefined }));
    });
});
