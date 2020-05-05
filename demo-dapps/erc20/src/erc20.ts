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
const ERC20Address = new erdjs.Address("erd1qqqqqqqqqqqqqpgq996x37vacr4lh79mzrrw692lx7kz2rmpp9lqev7uzt");
var ERC20SmartContract: erdjs.ERC20Client | null = null;


export function SetUserAddress(address: string) {
    UserAccount.setAddress(address);
}

export async function UpdateUserAccount(): Promise<any> {
    await UserAccount.update();
    ERC20SmartContract = new erdjs.ElrondERC20client(Proxy, ERC20Address, UserAccount);
    return GetUserAccountInfo();
}

export function GetUserAccountInfo(): any {
    return {
        address: UserAccount.getAddress(),
        addressAsHex: UserAccount.getAddressObject().hex(),
        nonce: UserAccount.getNonce(),
        balance: UserAccount.getBalance()
    };
}

export function GetUserTokenBalance(): Promise<bigint> {
    if (ERC20SmartContract == null) {
        console.log('SC is null');
        return Promise.resolve(BigInt(0));
    }
    console.log('returning async promise');
    return ERC20SmartContract.balanceOf(UserAccount.getAddressObject().hex());
}

export function GetERC20TotalSupply(): Promise<bigint> {
    if (ERC20SmartContract == null) {
        console.log('SC is null');
        return Promise.resolve(BigInt(0));
    }
    return ERC20SmartContract.totalSupply();
}
