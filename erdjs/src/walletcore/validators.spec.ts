import { assert } from "chai";
import { TestWallets } from "../testutils";
import { BLS, ValidatorSecretKey } from "./validatorKeys";

describe("test validator keys", () => {
    let wallets = new TestWallets();

    it("should create secret key and sign a message", async () => {
        await BLS.initIfNecessary();

        let secretKey = Buffer.from(Buffer.from("N2NmZjk5YmQ2NzE1MDJkYjdkMTViYzhhYmMwYzlhODA0ZmI5MjU0MDZmYmRkNTBmMWU0YzE3YTRjZDc3NDI0Nw==", "base64").toString(), "hex");
        let key = new ValidatorSecretKey(secretKey);
        assert.equal(key.generatePublicKey().hex(), "e7beaa95b3877f47348df4dd1cb578a4f7cabf7a20bfeefe5cdd263878ff132b765e04fef6f40c93512b666c47ed7719b8902f6c922c04247989b7137e837cc81a62e54712471c97a2ddab75aa9c2f58f813ed4c0fa722bde0ab718bff382208");

        let signature = key.sign(Buffer.from("hello"));
        // Expected signature computed using `elrond-sdk-go-tools/cmd/signer/mcl_signer.go`
        assert.equal(signature.toString("hex"), "84fd0a3a9d4f1ea2d4b40c6da67f9b786284a1c3895b7253fec7311597cda3f757862bb0690a92a13ce612c33889fd86");

        secretKey = Buffer.from(Buffer.from("ODA4NWJhMWQ3ZjdjM2RiOTM4YWQ3MDU5NWEyYmRhYjA5NjQ0ZjFlYzM4MDNiZTE3MWMzM2YxNGJjODBkNGUzYg==", "base64").toString(), "hex");
        key = new ValidatorSecretKey(secretKey);
        assert.equal(key.generatePublicKey().hex(), "78689fd4b1e2e434d567fe01e61598a42717d83124308266bd09ccc15d2339dd318c019914b86ac29adbae5dd8a02d0307425e9bd85a296e94943708c72f8c670f0b7c50a890a5719088dbd9f1d062cad9acffa06df834106eebe1a4257ef00d");

        signature = key.sign(Buffer.from("hello"));
        // Expected signature computed using `elrond-sdk-go-tools/cmd/signer/mcl_signer.go`
        assert.equal(signature.toString("hex"), "be2e593ff10899a2ee8e1d5c8094e36c9f48e04b87e129991ff09475808743e07bb41bf6e7bc1463fa554c4b46594b98");
    });

    it("should handle PEM files", async () => {
        await BLS.initIfNecessary();

        let text = `-----BEGIN foobar
N2NmZjk5YmQ2NzE1MDJkYjdkMTViYzhhYmMwYzlhODA0ZmI5MjU0MDZmYmRkNTBmMWU0YzE3YTRjZDc3NDI0Nw==
-----END foobar`;
        assert.equal(ValidatorSecretKey.fromPem(text).hex(), "7cff99bd671502db7d15bc8abc0c9a804fb925406fbdd50f1e4c17a4cd774247");
        assert.equal(ValidatorSecretKey.fromPem(text).generatePublicKey().hex(), "e7beaa95b3877f47348df4dd1cb578a4f7cabf7a20bfeefe5cdd263878ff132b765e04fef6f40c93512b666c47ed7719b8902f6c922c04247989b7137e837cc81a62e54712471c97a2ddab75aa9c2f58f813ed4c0fa722bde0ab718bff382208");
    });
});
