import {assert} from "chai";
import {ScArgumentsParser} from "./scArgumentsParser";
import {ErrInvalidScCallDataField} from "./errors";

describe("test scArgumentsParser.isValidDataField", () => {
    it("should return true for valid data fields", () => {
        assert.isTrue(ScArgumentsParser.isValidSmartContractCallDataField("delegate"));
        assert.isTrue(ScArgumentsParser.isValidSmartContractCallDataField("function@01@6f6b"));
        assert.isTrue(ScArgumentsParser.isValidSmartContractCallDataField("ESDTTransfer@74657374746f6b656e6964@02b671"));
    });

    it("should return false for invalid length arguments", () => {
        assert.isFalse(ScArgumentsParser.isValidSmartContractCallDataField("stake@1"));
        assert.isFalse(ScArgumentsParser.isValidSmartContractCallDataField("function@01@6f6b6"));
        assert.isFalse(ScArgumentsParser.isValidSmartContractCallDataField("ESDTTransfer@74657374746f6b656e6964@02b6710"));
    });

    it("should return false for non-hex arguments", () => {
        assert.isFalse(ScArgumentsParser.isValidSmartContractCallDataField("function@qwerty"));
        assert.isFalse(ScArgumentsParser.isValidSmartContractCallDataField("ESDTTransfer@74657374746f6b656e6964@02b6710g"));
    });
});

describe("test scArgumentsParser.isValidScArgument", () => {
    it("should return correct value", () => {
        assert.isFalse(ScArgumentsParser.isValidScArgument("delegate"));
        assert.isFalse(ScArgumentsParser.isValidScArgument("abcdefg"));
        assert.isFalse(ScArgumentsParser.isValidScArgument("1"));
        assert.isFalse(ScArgumentsParser.isValidScArgument("abc"));
        assert.isFalse(ScArgumentsParser.isValidScArgument("qwerty"));
        assert.isFalse(ScArgumentsParser.isValidScArgument("qwerty"));
        assert.isFalse(ScArgumentsParser.isValidScArgument("abcd@dcba"));

        assert.isTrue(ScArgumentsParser.isValidScArgument("74657374746f6b656e6964"));
        assert.isTrue(ScArgumentsParser.isValidScArgument("abcd"));
    });
});

describe("test scArgumentsParser.parseSmartContractCallDataField", () => {
    it("should extract function name and args", () => {
        let expected = ["01", "abcd"];
        let {functionName, args} = ScArgumentsParser.parseSmartContractCallDataField("function@01@abcd");
        assert.deepEqual(expected, args);
        assert.equal(functionName, "function");
    });

    it("should return only the function name if no arg", () => {
        let expected: string[] = [];
        let {functionName, args} = ScArgumentsParser.parseSmartContractCallDataField("function");
        assert.deepEqual(expected, args);
        assert.equal(functionName, "function");
    });

    it("should throw exception", () => {
        assert.throw(() => ScArgumentsParser.parseSmartContractCallDataField("function@01@bad"), ErrInvalidScCallDataField);
    });
});
