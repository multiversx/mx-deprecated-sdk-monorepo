import BigNumber from "bignumber.js";
import { Account } from "../../account";
import { Balance } from "../../balance";
import { IProvider } from "../../interface";
import { TestWallet } from "../../testutils";

export function toBalance(balance: number | string | BigNumber | Balance): Balance {
    let asBalance: Balance;
    if (balance instanceof Balance) {
        asBalance = balance;
    } else {
        let asBigNumber = new BigNumber(balance);
        asBalance = new Balance(asBigNumber.toString());
    }
    return asBalance;
}

export function printBalance(balance: number | string | BigNumber | Balance): Balance {
    let asBalance = toBalance(balance);
    console.log(asBalance.toCurrencyString());
    return asBalance;
}

export async function refreshAccountBalance(walletOrAccount: TestWallet | Account, provider: IProvider): Promise<Balance> {
    let account: Account;
    if (walletOrAccount instanceof TestWallet) {
        account = walletOrAccount.account;
    } else {
        account = walletOrAccount;
    }
    await account.sync(provider);
    return account.balance;
}

export async function printAccountBalance(wallet: TestWallet | Account, provider: IProvider): Promise<Balance> {
    let newBalance = await refreshAccountBalance(wallet, provider);
    return printBalance(newBalance);
}

export async function nowNonce(provider: IProvider): Promise<number> {
    let networkStatus = await provider.getNetworkStatus();
    return networkStatus.Nonce;
}

export function minutesNonce(minutes: number): number {
    return minutes * 10;
}

export function now(): number {
    return Math.floor(Date.now() / 1000);
}

export function hours(hours: number): number {
    let asMinutes = hours * 60;
    return minutes(asMinutes);
}

export function minutes(minutes: number): number {
    let seconds = minutes * 60;
    return seconds;
}
