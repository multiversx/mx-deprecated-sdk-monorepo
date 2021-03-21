import { PathLike } from "fs";
import { ProxyProvider } from "../proxyProvider";
import { Code } from "../smartcontracts/code";
import { AbiRegistry } from "../smartcontracts/typesystem";
import { TransactionWatcher } from "../transactionWatcher";

// TODO: Adjust with respect to current terminology (localnet instead of devnet).
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
    let sources = paths.map(e => e.toString());
    
    if (isBrowser()) {
        return AbiRegistry.load({ urls: sources });
    }

    return AbiRegistry.load({ files: sources });
}

export async function extendAbiRegistry(registry: AbiRegistry, path: PathLike): Promise<AbiRegistry> {
    let source = path.toString();
    
    if (isBrowser()) {
        return registry.extendFromUrl(source);
    }

    return registry.extendFromFile(source);
}

function isBrowser() {
    return typeof window !== "undefined";
}

export function setupUnitTestWatcherTimeouts() {
    TransactionWatcher.DefaultPollingInterval = 42;
    TransactionWatcher.DefaultTimeout = 42 * 42;
}
