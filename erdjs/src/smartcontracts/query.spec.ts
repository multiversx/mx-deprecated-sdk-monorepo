import { assert } from "chai";
import { Address } from "../address";
import { Argument } from "./argument";
import { ContractFunction } from "./function";
import { Query } from "./query";
import { Balance } from "../balance";
import * as errors from "../errors";

describe("test smart contract queries", () => {
    it("should prepare query", async () => {
        let query = new Query({
            func: new ContractFunction("foo"),
            address: new Address("erd1qqqqqqqqqqqqqpgq3ytm9m8dpeud35v3us20vsafp77smqghd8ss4jtm0q"),
            value: Balance.eGLD(42)
        });

        let request = query.toHttpRequest();
        assert.equal(request["ScAddress"], "erd1qqqqqqqqqqqqqpgq3ytm9m8dpeud35v3us20vsafp77smqghd8ss4jtm0q");
        assert.equal(request["FuncName"], "foo");
        assert.equal(request["CallValue"], "42000000000000000000");
        assert.lengthOf(request["Args"], 0);
    });

    it("should prepare query with arguments", async () => {
        let query = new Query({
            func: new ContractFunction("foo"),
            address: new Address("erd1qqqqqqqqqqqqqpgq3ytm9m8dpeud35v3us20vsafp77smqghd8ss4jtm0q"),
            args: [
                Argument.fromNumber(100),
                Argument.fromUTF8("!"),
                Argument.fromHex("abba"),
                Argument.fromBigInt(BigInt("1000000000000000000000000000000000"))
            ]
        });

        let request = query.toHttpRequest();
        assert.lengthOf(request["Args"], 4);
        assert.equal(request["Args"][0], "64");
        assert.equal(request["Args"][1], "21");
        assert.equal(request["Args"][2], "abba");
        assert.equal(request["Args"][3], "314dc6448d9338c15b0a00000000");
    });

    it("should throw if missing required", async () => {
        assert.throw(() => new Query(), errors.ErrAddressEmpty);
        assert.throw(() => new Query({
            address: new Address("erd1qqqqqqqqqqqqqpgq3ytm9m8dpeud35v3us20vsafp77smqghd8ss4jtm0q"),
            func: undefined
        }), errors.ErrMissingValue);
    });
});
