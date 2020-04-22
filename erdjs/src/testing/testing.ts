export function DeployContract() {
    console.warn("deploy contract");
}

export function UpgradeContract() {
    console.warn("deploy contract");
}

export function RunContract() {
    console.warn("call function");
}

export function QueryContract() {
    console.warn("call function");
}

// TODO: pass arguments as strings, and with data type:
// string, number, or ByteArray.
// strings and numbers as plain strings
// ByteArray as hex
// in Arwen debug, re-prepare all when composing vm input.
// so that we keep CLI and web API human readable.

// when erdjs core is ready, implement these as custom provider.
// for invoking CLI,
// https://github.com/ElrondNetwork/elrond-ide-vscode/blob/master/src/utils.ts#L47
// for invoking web (afterwards, see erdjs core)