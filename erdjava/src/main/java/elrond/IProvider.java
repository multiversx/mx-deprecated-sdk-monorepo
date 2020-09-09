package elrond;

import java.io.IOException;

import elrond.Exceptions.ErrAddress;

public interface IProvider {
    NetworkConfig getNetworkConfig() throws IOException;
    AccountOnNetwork getAccount(Address address) throws IOException, ErrAddress;
}
