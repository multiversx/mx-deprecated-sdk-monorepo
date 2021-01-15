import { PathLike } from "fs";
import { ProxyProvider } from "../proxyProvider";
import { Code } from "../smartcontracts/code";

export function getDevnetProvider(): ProxyProvider {
    return new ProxyProvider("http://localhost:7950", 5000);
}

export function getTestnetProvider(): ProxyProvider {
    return new ProxyProvider("https://testnet-gateway.elrond.com", 5000);
}

export function getMainnetProvider(): ProxyProvider {
    return new ProxyProvider("https://gateway.elrond.com", 5000);
}

export async function loadContractCode(path: PathLike): Promise<Code> {
    if (isBrowser()) {
        return Code.fromUrl(path.toString());
    }

    return Code.fromFile(path);
}

function isBrowser() {
    return typeof window !== "undefined";
}
