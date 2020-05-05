/*
https://wallet.elrond.com/hook
    ?receiver=erd1cevsw7mq5uvqymjqzwqvpqtdrhckehwfz99n7praty3y7q2j7yps842mqh
    &value=1000000000000000000
    &gasLimit=75500
    &data=some-encoded-data
    &callbackUrl=https://elrond.com/
*/

import { Account, Address } from "../core/data/account";
import { ElrondProxy } from "../core/providers/elrondproxy";
import { ElrondERC20client } from "../core/data/smartcontracts/elrondERC20client";


const Proxy = new ElrondProxy({
    url: "http://zirconium:7950",
    timeout: 1000
});

const UserAccount: Account = new Account(Proxy, null);


export function SetUserAddress(address: string) {
    UserAccount.setAddress(address);
}

export async function UpdateUserAccount() {
    await UserAccount.update();
}

export function GetUserAccountInfo(): any {
    return {
        address: UserAccount.getAddress(),
        addressAsHex: UserAccount.getAddressObject().hex(),
        nonce: UserAccount.getNonce(),
        balance: UserAccount.getBalance()
    };
}
