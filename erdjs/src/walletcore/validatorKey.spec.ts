import * as errors from "../errors";
import { assert } from "chai";
import { TestWallets } from "../testutils";
import { BLS, ValidatorKey } from "./validatorKey";

describe("test validator key", () => {
    let wallets = new TestWallets();

    it("should create", async () => {
        await BLS.initIfNecessary();
        let privateKey = Buffer.from(Buffer.from("N2NmZjk5YmQ2NzE1MDJkYjdkMTViYzhhYmMwYzlhODA0ZmI5MjU0MDZmYmRkNTBmMWU0YzE3YTRjZDc3NDI0Nw==", "base64").toString(), "hex");
        let key = new ValidatorKey(privateKey);
        assert.equal(key.toString(), "e7beaa95b3877f47348df4dd1cb578a4f7cabf7a20bfeefe5cdd263878ff132b765e04fef6f40c93512b666c47ed7719b8902f6c922c04247989b7137e837cc81a62e54712471c97a2ddab75aa9c2f58f813ed4c0fa722bde0ab718bff382208");

        privateKey = Buffer.from(Buffer.from("ODA4NWJhMWQ3ZjdjM2RiOTM4YWQ3MDU5NWEyYmRhYjA5NjQ0ZjFlYzM4MDNiZTE3MWMzM2YxNGJjODBkNGUzYg==", "base64").toString(), "hex");
        key = new ValidatorKey(privateKey);
        assert.equal(key.toString(), "78689fd4b1e2e434d567fe01e61598a42717d83124308266bd09ccc15d2339dd318c019914b86ac29adbae5dd8a02d0307425e9bd85a296e94943708c72f8c670f0b7c50a890a5719088dbd9f1d062cad9acffa06df834106eebe1a4257ef00d");
    });
});
