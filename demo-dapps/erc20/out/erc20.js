"use strict";
/*
https://wallet.elrond.com/hook
    ?receiver=erd1cevsw7mq5uvqymjqzwqvpqtdrhckehwfz99n7praty3y7q2j7yps842mqh
    &value=1000000000000000000
    &gasLimit=75500
    &data=some-encoded-data
    &callbackUrl=https://elrond.com/
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Proxy = new erdjs.providers.ElrondProxy({
    url: "http://zirconium:7950",
    timeout: 1000
});
const UserAccount = new erdjs.account.Account(Proxy, null);
function SetUserAddress(address) {
    UserAccount.setAddress(address);
}
exports.SetUserAddress = SetUserAddress;
function UpdateUserAccount() {
    return __awaiter(this, void 0, void 0, function* () {
        yield UserAccount.update();
    });
}
exports.UpdateUserAccount = UpdateUserAccount;
function GetUserAccountInfo() {
    return {
        address: UserAccount.getAddress(),
        addressAsHex: UserAccount.getAddressObject().hex(),
        nonce: UserAccount.getNonce(),
        balance: UserAccount.getBalance()
    };
}
exports.GetUserAccountInfo = GetUserAccountInfo;
//# sourceMappingURL=erc20.js.map