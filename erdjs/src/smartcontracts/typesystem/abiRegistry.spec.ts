import { assert } from "chai";
import { AbiRegistry } from "./abiRegistry";

describe("test abi registry", () => {
    it("should extend with namespaces and without namespaces", async () => {
        let registry = new AbiRegistry();

        await registry.extendFromFile("src/testdata/answer.json");
        assert.lengthOf(registry.namespaces, 1);
        assert.lengthOf(registry.getDefaultNamespace().interfaces, 1);
        assert.lengthOf(registry.getDefaultNamespace().structures, 0);
        assert.lengthOf(registry.getDefaultNamespace().findInterface("answer").endpoints, 1);

        await registry.extendFromFile("src/testdata/counter.json");
        assert.lengthOf(registry.namespaces, 1);
        assert.lengthOf(registry.getDefaultNamespace().interfaces, 2);
        assert.lengthOf(registry.getDefaultNamespace().structures, 0);
        assert.lengthOf(registry.getDefaultNamespace().findInterface("counter").endpoints, 3);

        await registry.extendFromFile("src/testdata/lottery-egld.json");
        assert.lengthOf(registry.namespaces, 1);
        assert.lengthOf(registry.getDefaultNamespace().interfaces, 3);
        assert.lengthOf(registry.getDefaultNamespace().structures, 1);
        assert.lengthOf(registry.getDefaultNamespace().findInterface("lottery-egld").endpoints, 3);

        await registry.extendFromFile("src/testdata/foobar.namespaced.json");
        assert.lengthOf(registry.namespaces, 3);
        assert.lengthOf(registry.getDefaultNamespace().interfaces, 3);
        assert.lengthOf(registry.getDefaultNamespace().structures, 1);
        assert.lengthOf(registry.findNamespace("foo").interfaces, 3);
        assert.lengthOf(registry.findNamespace("foo").structures, 1);
        assert.lengthOf(registry.findNamespace("bar").interfaces, 1);
        assert.lengthOf(registry.findNamespace("bar").structures, 1);
    });
});
