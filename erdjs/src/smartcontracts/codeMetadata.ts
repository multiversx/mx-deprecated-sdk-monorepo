export class CodeMetadata {
    private upgradeable: boolean;
    private readable: boolean;
    private payable: boolean;

    constructor(upgradeable: boolean = false, readable: boolean = false, payable: boolean = false) {
        this.upgradeable = upgradeable;
        this.readable = readable;
        this.payable = payable;
    }

    toggleUpgradeable(value: boolean) {
        this.upgradeable = value;
    }

    toggleReadable(value: boolean) {
        this.readable = value;
    }

    togglePayable(value: boolean) {
        this.payable = value;
    }

    toBuffer(): Buffer {
        let byteZero = 0;
        let byteOne = 0;

        if (this.upgradeable) {
            byteZero |= ByteZero.Upgradeable;
        }
        if (this.readable) {
            byteZero |= ByteZero.Readable;
        }
        if (this.payable) {
            byteOne |= ByteOne.Payable;
        }

        return Buffer.from([byteZero, byteOne]);
    }

    toString() {
        return this.toBuffer().toString("hex");
    }

    toJSON(): object {
        return {
            upgradeable: this.upgradeable,
            readable: this.readable,
            payable: this.payable
        };
    }
}

enum ByteZero {
    Upgradeable = 1,
    Reserved2 = 2,
    Readable = 4
}

enum ByteOne {
    Reserved1 = 1,
    Payable = 2
}