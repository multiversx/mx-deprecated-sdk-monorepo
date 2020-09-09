package elrond;

import java.math.BigInteger;

import elrond.ProxyProvider.PayloadOfGetAccount;

public class AccountOnNetwork {
    private long nonce = 0;
    private BigInteger balance = BigInteger.valueOf(0);

    public static AccountOnNetwork fromProviderPayload(PayloadOfGetAccount response) {
        AccountOnNetwork account = new AccountOnNetwork();
        account.nonce = response.nonce;
        account.balance = response.balance;
        return account;
    }

    public long getNonce() {
        return nonce;
    }

    public BigInteger getBalance() {
        return balance;
    }
}
