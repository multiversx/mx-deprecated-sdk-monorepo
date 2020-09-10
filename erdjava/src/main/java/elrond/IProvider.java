package elrond;

import java.io.IOException;

import elrond.Exceptions.ErrAddress;
import elrond.Exceptions.ErrCannotSerializeTransaction;
import elrond.Exceptions.ErrProxyRequest;

public interface IProvider {
    NetworkConfig getNetworkConfig() throws IOException, ErrProxyRequest;
    AccountOnNetwork getAccount(Address address) throws IOException, ErrAddress, ErrProxyRequest;
    String sendTransaction(Transaction transaction) throws IOException, ErrCannotSerializeTransaction, ErrProxyRequest;
}
