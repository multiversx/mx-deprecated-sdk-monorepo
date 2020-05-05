(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
"use strict";
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
const erc20 = require("./erc20");
var UserAddressInput = null;
$(document).ready(function () {
    UserAddressInput = $('#UserAddressInput');
    UserAddressInput.on('keydown', function (ev) {
        return __awaiter(this, void 0, void 0, function* () {
            if (ev.key == "Enter") {
                ev.preventDefault();
                var address = UserAddressInput.val();
                console.log(address);
                erc20.SetUserAddress(address);
                yield erc20.UpdateUserAccount();
                var info = erc20.GetUserAccountInfo();
                console.log(info);
            }
        });
    });
});

},{"./erc20":1}]},{},[2]);
