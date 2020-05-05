/*
https://wallet.elrond.com/hook
    ?receiver=erd1cevsw7mq5uvqymjqzwqvpqtdrhckehwfz99n7praty3y7q2j7yps842mqh
    &value=1000000000000000000
    &gasLimit=75500
    &data=some-encoded-data
    &callbackUrl=https://elrond.com/
*/

import * as erdjs from "erdjs";


const Proxy = new erdjs.ElrondProxy({
    url: "http://zirconium:7950",
    timeout: 1000
});

const UserAccount = new erdjs.Account(Proxy, null);


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
