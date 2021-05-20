import BigNumber from "bignumber.js";
import { Account } from "../../account";
import { Balance } from "../../balance";
import { IProvider } from "../../interface";
import { TestWallet } from "../../testutils";

export function printBalance(balance: Balance) {
    console.log(balance.toCurrencyString());
}

export async function getAccountBalance(walletOrAccount: TestWallet | Account, provider: IProvider): Promise<Balance> {
    let account: Account;
    if (walletOrAccount instanceof TestWallet) {
        account = walletOrAccount.account;
    } else {
        account = walletOrAccount;
    }
    await account.sync(provider);
    return account.balance;
}

export async function currentNonce(provider: IProvider): Promise<number> {
    let networkStatus = await provider.getNetworkStatus();
    return networkStatus.Nonce;
}

export function minutesToNonce(minutes: number): number {
    // the nonce is incremented every 6 seconds - in a minute the nonce increases by 10
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
