package elrond;

import java.io.IOException;

import elrond.Exceptions.AddressException;
import elrond.Exceptions.CannotSerializeTransactionException;
import elrond.Exceptions.ProxyRequestException;

public interface IProvider {
    NetworkConfig getNetworkConfig() throws IOException, ProxyRequestException;
    AccountOnNetwork getAccount(Address address) throws IOException, AddressException, ProxyRequestException;
    String sendTransaction(Transaction transaction) throws IOException, CannotSerializeTransactionException, ProxyRequestException;
}
