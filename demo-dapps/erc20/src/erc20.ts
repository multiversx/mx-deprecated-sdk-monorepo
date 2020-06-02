/*
https://wallet.elrond.com/hook
    ?receiver=erd1cevsw7mq5uvqymjqzwqvpqtdrhckehwfz99n7praty3y7q2j7yps842mqh
    &value=1000000000000000000
    &gasLimit=75500
    &data=some-encoded-data
    &callbackUrl=https://elrond.com/
*/

import * as erdjs from "@elrondnetwork/erdjs";
import { SmartContractCall } from "@elrondnetwork/erdjs";


const Proxy = new erdjs.ElrondProxy({
    url: "https://api.elrond.com",
    timeout: 4000
});

const UserAccount = new erdjs.Account(Proxy, null);
var ERC20Address: erdjs.Address | null = null;
var ERC20SmartContract: erdjs.ERC20Client | null = null;


export function CreateWalletURL(call: erdjs.SmartContractCall): string {
    if (ERC20Address == null) {
        throw new Error("ERC20 address not initialized");
    }

    let plainCall: any = call.getPlain();
    var url = "https://wallet.elrond.com/hook";
    url += "?sender=" + plainCall.sender;
    url += "&receiver=" + ERC20Address.toString();
    url += "&value=" + plainCall.value;
    url += "&gasLimit=" + plainCall.gasLimit.toString();
    url += "&data=" + plainCall.data;

    let callbackUrl = ("https://dapps.elrond.com/index.html?sender=" + plainCall.sender);
    console.log(callbackUrl);
    url += "&callbackUrl=" + callbackUrl;
    return url;
}


export function SetERC20Address(address: string) {
    console.log('ERC20 address:', address);
    ERC20Address = new erdjs.Address(address);
}

export function SetUserAddress(address: string) {
    console.log('set user address', address);
    UserAccount.setAddress(address);
}


export async function UpdateUserAccount(): Promise<any> {
    if (ERC20Address == null) {
        throw new Error("ERC20 address not initialized");
    }

    await UserAccount.update();
    ERC20SmartContract = new erdjs.BasicERC20Client(Proxy, ERC20Address, UserAccount);

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


export function CreateERC20Transfer(receiver: string, amount: bigint): Promise<SmartContractCall> {
    if (ERC20SmartContract == null) {
        throw new Error("ERC20 smart contract not initialized");
    }

    var receiverAsHex = (new erdjs.Address(receiver)).hex();
    ERC20SmartContract.setGasPrice(200000000000);
    ERC20SmartContract.setGasLimit(1000000000);
    ERC20SmartContract.setProvider(null);
    return ERC20SmartContract.transfer(receiverAsHex, amount).finally(() => {
        if (ERC20SmartContract == null) {
            throw new Error("ERC20 smart contract not initialized");
        }
        ERC20SmartContract.setProvider(Proxy);
    });
}


export function persistTransaction(transaction: any) {
    let transactions = retrieveUserTransactionsStore(null);
    let key = "tx" + transaction.nonce.toString();
    transactions[key] = transaction;
    persistUserTransactionsStore(null, transactions);
}


export function retrieveTransaction(nonce: number): any {
    let transactions = retrieveUserTransactionsStore(null);

    let key = "tx" + nonce.toString();
    if (!transactions[key]) {
        return null;
    }

    return transactions[key];
}


export function persistUserTransactionsStore(address: string | null, transactions: any) {
    if (address == null) {
        address = UserAccount.getAddress();
    }

    window.localStorage[address] = JSON.stringify(transactions);
}


export function retrieveUserTransactionsStore(address: string | null): any {
    if (address == null) {
        address = UserAccount.getAddress();
    }

    let transactions: string = window.localStorage[address];
    if (!transactions) {
        return createUserTransactionsStore(address);
    }
    
    return JSON.parse(transactions);
}


export function createUserTransactionsStore(address: string | null): any {
    if (address == null) {
        address = UserAccount.getAddress();
    }
    let transactions: {} = {};
    window.localStorage[address] = JSON.stringify(transactions);

    return transactions;
}
