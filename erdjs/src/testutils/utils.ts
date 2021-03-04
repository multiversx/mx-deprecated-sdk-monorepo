import { PathLike } from "fs";
import { ProxyProvider } from "../proxyProvider";
import { Code } from "../smartcontracts/code";
import { AbiRegistry } from "../smartcontracts/typesystem";
import { TransactionWatcher } from "../transactionWatcher";

export function getDevnetProvider(): ProxyProvider {
    return new ProxyProvider("http://localhost:7950", 5000);
}

export function getTestnetProvider(): ProxyProvider {
    return new ProxyProvider("https://testnet-gateway.elrond.com", 5000);
}

export function getMainnetProvider(): ProxyProvider {
    return new ProxyProvider("https://gateway.elrond.com", 20000);
}

export async function loadContractCode(path: PathLike): Promise<Code> {
    if (isBrowser()) {
        return Code.fromUrl(path.toString());
    }

    return Code.fromFile(path);
}

export async function loadAbiRegistry(paths: PathLike[]): Promise<AbiRegistry> {
    if (isBrowser()) {
        return AbiRegistry.load({ urls: paths.map(e => e.toString()) });
    }

    return AbiRegistry.load({ files: paths.map(e => e.toString()) });
}

export async function extendAbiRegistry(registry: AbiRegistry, path: PathLike): Promise<AbiRegistry> {
    if (isBrowser()) {
        return registry.extendFromUrl(path.toString());
    }

    return registry.extendFromFile(path.toString());
}

function isBrowser() {
    return typeof window !== "undefined";
}

export function setupUnitTestWatcherTimeouts() {
    TransactionWatcher.DefaultPollingInterval = 42;
    TransactionWatcher.DefaultTimeout = 42 * 42;
}
