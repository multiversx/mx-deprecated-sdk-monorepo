import {assert} from "chai";
import {EsdtHelpers} from "./esdtHelpers";

describe("test EsdtHelpers.extractFieldsFromEsdtTransferDataField", () => {
    it("should throw exceptions due to bad input", () => {
        assert.throw(() => EsdtHelpers.extractFieldsFromEsdtTransferDataField("invalid esdt transfer"));
        assert.throw(() => EsdtHelpers.extractFieldsFromEsdtTransferDataField("esdtTransfer@aa@01")); // case sensitive protection
        assert.throw(() => EsdtHelpers.extractFieldsFromEsdtTransferDataField("ESDTTransfer@aa@1")); // wrong sized second argument
    });

    it("should work", () => {
        let result = EsdtHelpers.extractFieldsFromEsdtTransferDataField("ESDTTransfer@aa@01");
        assert.equal(result.tokenIdentifier, "aa");
        assert.equal(result.amount, "1");

        result = EsdtHelpers.extractFieldsFromEsdtTransferDataField("ESDTTransfer@4142432d317132773365@2cd76fe086b93ce2f768a00b229fffffffffff");
        assert.equal(result.tokenIdentifier, "4142432d317132773365");
        assert.equal(result.amount, "999999999999999999999999999999999999999999999");
    });
});
