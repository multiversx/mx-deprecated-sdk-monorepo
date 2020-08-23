
export var ErrNegativeNonce = new Error("negative nonce");
export var ErrInvalidBalanceString = new Error("invalid balance string");
export var ErrNegativeBalance = new Error("negative balance");
export var ErrInvalidCodeHash = new Error("invalid code hash");
export var ErrInvalidRootHash = new Error("invalid code root hash");
export var ErrCodeHasUnexpectedHash = new Error("code has unexpected hash");
export var ErrNegativeGasPrice = new Error("negative gas price");
export var ErrNegativeGasLimit = new Error("negative gas limit");
export var ErrWrongSecretKeyLength = new Error("wrong secret key length");
export var ErrInvalidTxValueString = new Error("invalid tx value string");
export var ErrNegativeValue = new Error("negative value");
export var ErrNotANumber = new Error("not a number");
export var ErrTransactionNotSigned = new Error("transaction not signed");
export var ErrProviderNotSet = new Error("provider not set");
export var ErrAsyncTimerAlreadyRunning = new Error("async timer already running");
export var ErrInvalidFunctionName = new Error("invalid function name");
export var ErrInvalidArgument = new Error("invalid argument");
export var ErrUserAccountNotSet = new Error("user account not set");
export var ErrSCAddressNotSet = new Error("smart contract address not set");
export var ErrGasPriceNotSet = new Error("gas price not set");
export var ErrGasLimitNotSet = new Error("gas limit not set");
export var ErrInvalidVMType = new Error("invalid vm type");
export var ErrInvalidSmartContractCode = new Error("invalid smart contract code");
export var ErrInvalidChainID = new Error("invalid chain ID");
export var ErrInvalidTransactionVersion = new Error("invalid transaction version");

export class Err extends Error {
    inner: Err | undefined = undefined;

    public constructor(message: string, inner?: Err) {
        super(message);
        this.inner = inner;
    }
}

export class ErrAddressWrongLength extends Err {
    public constructor(expected: number, got: number) {
        let message = `Wrong address length. Expected: ${expected}, got ${got}`;
        super(message); 
    }
}

export class ErrAddressCannotCreate extends Err {
    public constructor(input: any, inner?: Err) {
        let message = `Cannot create address from ${input}`;
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