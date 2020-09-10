package elrond;

import java.io.IOException;

import elrond.Exceptions.ErrAddress;
import elrond.Exceptions.ErrCannotSerializeTransaction;

public interface IProvider {
    NetworkConfig getNetworkConfig() throws IOException;
    AccountOnNetwork getAccount(Address address) throws IOException, ErrAddress;
    String sendTransaction(Transaction transaction) throws IOException, ErrCannotSerializeTransaction;
}
