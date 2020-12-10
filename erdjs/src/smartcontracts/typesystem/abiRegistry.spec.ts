import { assert } from "chai";
import { AbiRegistry } from "./abiRegistry";

describe("test abi registry", () => {
    it("should extend with namespaces and without namespaces", async () => {
        let registry = new AbiRegistry();

        await registry.extendFromFile("src/testdata/answer.json");
        assert.lengthOf(registry.namespaces, 1);
        assert.lengthOf(registry.getDefaultNamespace().endpoints, 1);
        assert.lengthOf(registry.getDefaultNamespace().structures, 0);
        assert.lengthOf(registry.getDefaultNamespace().findEndpoint("answer").functions, 1);

        await registry.extendFromFile("src/testdata/counter.json");
        assert.lengthOf(registry.namespaces, 1);
        assert.lengthOf(registry.getDefaultNamespace().endpoints, 2);
        assert.lengthOf(registry.getDefaultNamespace().structures, 0);
        assert.lengthOf(registry.getDefaultNamespace().findEndpoint("counter").functions, 3);

        await registry.extendFromFile("src/testdata/lottery-egld.json");
        assert.lengthOf(registry.namespaces, 1);
        assert.lengthOf(registry.getDefaultNamespace().endpoints, 3);
        assert.lengthOf(registry.getDefaultNamespace().structures, 1);
        assert.lengthOf(registry.getDefaultNamespace().findEndpoint("lottery-egld").functions, 2);

        await registry.extendFromFile("src/testdata/foobar.namespaced.json");
        assert.lengthOf(registry.namespaces, 3);
        assert.lengthOf(registry.getDefaultNamespace().endpoints, 3);
        assert.lengthOf(registry.getDefaultNamespace().structures, 1);
        assert.lengthOf(registry.findNamespace("foo").endpoints, 3);
        assert.lengthOf(registry.findNamespace("foo").structures, 1);
        assert.lengthOf(registry.findNamespace("bar").endpoints, 1);
        assert.lengthOf(registry.findNamespace("bar").structures, 1);
    });
});
