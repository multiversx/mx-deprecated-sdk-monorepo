import { ProxyProvider } from "../proxyProvider";

export function getDevnetProvider(): ProxyProvider {
    return new ProxyProvider("http://localhost:7950", 5000);
}

export function getTestnetProvider(): ProxyProvider {
    return new ProxyProvider("https://testnet-gateway.elrond.com", 5000);
}

export function getMainnetProvider(): ProxyProvider {
    return new ProxyProvider("https://gateway.elrond.com", 5000);
}
