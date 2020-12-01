import { ProxyProvider } from "../proxyProvider";

export function getDevnetProvider(): ProxyProvider {
    return new ProxyProvider("http://localhost:7950");
}

export function getTestnetProvider(): ProxyProvider {
    return new ProxyProvider("https://testnet-gateway.elrond.com", 2000);
}

export function getMainnetProvider(): ProxyProvider {
    return new ProxyProvider("https://gateway.elrond.com", 2000);
}
