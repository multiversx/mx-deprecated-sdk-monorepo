import * as valid from "./validation";

export class Account {
    private Address: string = "";
    private Nonce: number = 0;
    private Balance: bigint = BigInt(0);
    private Code: string = "";
    private CodeHash: string = "";
    private RootHash: string = "";

    private Initialized: boolean = false;

    public constructor(data: any) {
        this.set(data);
    }

    public set(data: any) {
        if (data == null) {
            this.Initialized = false;
            return;
        }

        this.Address = valid.Address(data.address);
        this.Nonce = valid.Nonce(data.nonce);
        this.Balance = valid.BalanceString(data.balance);
        this.CodeHash = valid.CodeHash(data.codeHash);
        this.Code = valid.Code(data.code, this.CodeHash);
        this.RootHash = valid.RootHash(data.rootHash);

        this.Initialized = true;
    }
}
