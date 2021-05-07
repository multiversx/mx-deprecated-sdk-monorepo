import {assert} from "chai";
import {ScArgumentsParser} from "./scArgumentsParser";
import {ErrInvalidScCallDataField} from "./errors";

describe("test scArgumentsParser.isValidDataField", () => {
    it("should return true for valid data fields", () => {
        assert.isTrue(ScArgumentsParser.isValidDataField("delegate"));
        assert.isTrue(ScArgumentsParser.isValidDataField("function@01@6f6b"));
        assert.isTrue(ScArgumentsParser.isValidDataField("ESDTTransfer@74657374746f6b656e6964@02b671"));
    });

    it("should return false for invalid length arguments", () => {
        assert.isFalse(ScArgumentsParser.isValidDataField("stake@1"));
        assert.isFalse(ScArgumentsParser.isValidDataField("function@01@6f6b6"));
        assert.isFalse(ScArgumentsParser.isValidDataField("ESDTTransfer@74657374746f6b656e6964@02b6710"));
    });

    it("should return false for non-hex arguments", () => {
        assert.isFalse(ScArgumentsParser.isValidDataField("function@qwerty"));
        assert.isFalse(ScArgumentsParser.isValidDataField("ESDTTransfer@74657374746f6b656e6964@02b6710g"));
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

describe("test scArgumentsParser.getArgumentsFromDataField", () => {
    it("should return correct value", () => {
        let expected = ["01", "abcd"];
        let actual = ScArgumentsParser.getArgumentsFromDataField("function@01@abcd");
        assert.deepEqual(expected, actual);
    });

    it("should throw exception", () => {
        assert.throw(() => ScArgumentsParser.getArgumentsFromDataField("function@01@bad"), ErrInvalidScCallDataField);
    });
});
