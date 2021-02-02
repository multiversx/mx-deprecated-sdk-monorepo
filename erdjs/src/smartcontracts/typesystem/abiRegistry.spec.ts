import { assert } from "chai";
import { AbiRegistry } from "./abiRegistry";

describe("test abi registry", () => {
    it("should extend", async () => {
        let registry = new AbiRegistry();

        await registry.extendFromFile("src/testdata/answer.abi.json");
        assert.lengthOf(registry.interfaces, 1);
        assert.lengthOf(registry.customTypes, 0);
        assert.lengthOf(registry.findInterface("answer").endpoints, 1);

        await registry.extendFromFile("src/testdata/counter.abi.json");
        assert.lengthOf(registry.interfaces, 2);
        assert.lengthOf(registry.customTypes, 0);
        assert.lengthOf(registry.findInterface("counter").endpoints, 3);

        await registry.extendFromFile("src/testdata/lottery_egld.abi.json");
        assert.lengthOf(registry.interfaces, 3);
        assert.lengthOf(registry.customTypes, 2);

        assert.lengthOf(registry.findInterface("Lottery").endpoints, 7);
        assert.lengthOf(registry.findStructure("LotteryInfo").fields, 8);
        assert.lengthOf(registry.findEnum("Status").variants, 3);
    });
});
