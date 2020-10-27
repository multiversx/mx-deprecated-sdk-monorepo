import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "./address";
import * as errors from "./errors";


describe("test address", () => {
    let aliceBech32 = "erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th";
    let bobBech32 = "erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx";
    let aliceHex = "0139472eff6886771a982f3083da5d421f24c29181e63888228dc81ca60d69e1";
    let bobHex = "8049d639e5a6980d1cd2392abcce41029cda74a1563523a202f09641cc2618f8";

    it("should create address", async () => {
        let alice = new Address(aliceBech32);
        let bob = new Address(bobBech32);

        assert.equal(alice.hex(), aliceHex);
        assert.equal(bob.hex(), bobHex);
    });

    it("should check equality", () => {
        let aliceFoo = new Address(aliceBech32);
        let aliceBar = new Address(aliceHex);
        let bob = new Address(bobBech32);

        assert.isTrue(aliceFoo.equals(aliceBar));
        assert.isTrue(aliceBar.equals(aliceFoo));
        assert.isTrue(aliceFoo.equals(aliceFoo));
        assert.isFalse(bob.equals(aliceBar));
        assert.isFalse(bob.equals(null));
    });

    it("should throw error when invalid input", () => {
        assert.throw(() => new Address("foo"), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address("a".repeat(7)), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address(Buffer.from("aaaa", "hex")), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2"), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address("xerd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"), errors.ErrAddressCannotCreate);
    });
});
