import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "./address";
import * as errors from "./errors";


describe("test address", () => {
    let aliceBech32 = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz";
    let bobBech32 = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r";
    let aliceHex = "fd691bb5e85d102687d81079dffce842d4dc328276d2d4c60d8fd1c3433c3293";
    let bobHex = "c70cf50b238372fffaf7b7c5723b06b57859d424a2da621bcc1b2f317543aa36";

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
        assert.throw(() => new Address(Buffer.from("aaaa", "hex")), errors.ErrAddressWrongLength);
        assert.throw(() => new Address("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2"), errors.ErrAddressCannotCreate);
        assert.throw(() => new Address("xerd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"), errors.ErrAddressCannotCreate);
    });
});
