

export var ErrProviderNotSet = new Error("provider not set");
export var ErrInvalidFunctionName = new Error("invalid function name");
export var ErrUserAccountNotSet = new Error("user account not set");
export var ErrSCAddressNotSet = new Error("smart contract address not set");
export var ErrInvalidVMType = new Error("invalid vm type");
export var ErrInvalidSmartContractCode = new Error("invalid smart contract code");

export var ErrExpectedTransactionStatusNotReached = new Error("expected transaction status not reached");

export class Err extends Error {
    inner: Error | undefined = undefined;

    public constructor(message: string, inner?: Error) {
        super(message);
        this.inner = inner;
    }

    summary(): any[] {
        let result = [];

        result.push({name: this.name, message: this.message});

        let inner: any = this.inner;
        while (inner) {
            result.push({name: inner.name, message: inner.message});
            inner = inner.inner;
        }

        return result;
    }

    html(): string {
        let summary = this.summary();
        let error = summary[0];
        let causedBy = summary.slice(1)

        let html = `
            An error of type <strong>${error.name}</strong> occurred: ${error.message}.
        `;

        causedBy.forEach(cause => {
            html += `<br /> ... <strong>${cause.name}</strong>: ${cause.message}`;
        });

        return html;
    }

    static html(error: Error): string {
        if (error instanceof Err) {
            return error.html();
        } else {
            return `Unexpected error of type <strong>${error.name}</strong> occurred: ${error.message}.`
        }
    }
}

export class ErrInvalidArgument extends Err {
    public constructor(name: string, value?: any, inner?: Error) {
        super(ErrInvalidArgument.getMessage(name, value), inner);
    }

    static getMessage(name: string, value?: any): string {
        if (value) {
            return `Invalid argument "${name}": ${value}`;
        }

        return `Invalid argument "${name}"`;
    }
}

export class ErrAddressCannotCreate extends Err {
    public constructor(input: any, inner?: Error) {
        let message = `Cannot create address from: ${input}`;
        super(message, inner);
    }
}

export class ErrAddressBadHrp extends Err {
    public constructor(expected: string, got: string) {
        super(`Wrong address HRP. Expected: ${expected}, got ${got}`);
    }
}

export class ErrAddressEmpty extends Err {
    public constructor() {
        super(`Address is empty`);
    }
}

export class ErrSignerCannotSign extends Err {
    public constructor(inner: Error) {
        super(`Cannot sign`, inner);
    }
}

export class ErrBalanceInvalid extends Err {
    public constructor(value: bigint) {
        super(`Invalid balance: ${value}`);
    }
}

export class ErrGasPriceInvalid extends Err {
    public constructor(value: number) {
        super(`Invalid gas price: ${value}`);
    }
}

export class ErrGasLimitInvalid extends Err {
    public constructor(value: number) {
        super(`Invalid gas limit: ${value}`);
    }
}

export class ErrNonceInvalid extends Err {
    public constructor(value: number) {
        super(`Invalid nonce: ${value}`);
    }
}

export class ErrChainIDInvalid extends Err {
    public constructor(value: string) {
        super(`Invalid chain ID: ${value}`);
    }
}

export class ErrTransactionVersionInvalid extends Err {
    public constructor(value: number) {
        super(`Invalid transaction version: ${value}`);
    }
}

export class ErrTransactionHashUnknown extends Err {
    public constructor() {
        super(`Transaction hash isn't known`);
    }
}

export class ErrTransactionNotSigned extends Err {
    public constructor() {
        super(`Transaction isn't signed`);
    }
}

export class ErrSignatureCannotCreate extends Err {
    public constructor(input: any, inner?: Error) {
        let message = `Cannot create signature from: ${input}`;
        super(message, inner);
    }
}

export class ErrSignatureEmpty extends Err {
    public constructor() {
        super(`Signature is empty`);
    }
}

export class ErrProxyProviderGet extends Err {
    public constructor(url: string, error: string, inner?: Error) {
        let message = `Cannot GET ${url}, error: ${error}`;
        super(message, inner);
    }
}

export class ErrProxyProviderPost extends Err {
    public constructor(url: string, error: string, inner?: Error) {
        let message = `Cannot POST ${url}, error: ${error}`;
        super(message, inner);
    }
}

export class ErrAsyncTimerAlreadyRunning extends Err {
    public constructor() {
        super("Async timer already running");
    }
}

export class ErrAsyncTimerAborted extends Err {
    public constructor() {
        super("Async timer aborted");
    }
}
