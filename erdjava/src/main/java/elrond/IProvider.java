package elrond;

import java.io.IOException;

public interface IProvider {
    NetworkConfig getNetworkConfig() throws IOException;
}
