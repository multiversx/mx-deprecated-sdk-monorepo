import { assert } from "chai";
import { AbiRegistry } from "./abiRegistry";

describe("test abi registry", () => {
    it("should extend", async () => {
        let registry = new AbiRegistry();

        await registry.extendFromFile("src/testdata/answer.json");
        assert.lengthOf(registry.interfaces, 1);
        assert.lengthOf(registry.structures, 0);
        assert.lengthOf(registry.findInterface("answer").endpoints, 1);

        await registry.extendFromFile("src/testdata/counter.json");
        assert.lengthOf(registry.interfaces, 2);
        assert.lengthOf(registry.structures, 0);
        assert.lengthOf(registry.findInterface("counter").endpoints, 3);

        await registry.extendFromFile("src/testdata/lottery-egld.json");
        assert.lengthOf(registry.interfaces, 3);
        assert.lengthOf(registry.structures, 1);
        assert.lengthOf(registry.findInterface("lottery-egld").endpoints, 3);
    });
});
