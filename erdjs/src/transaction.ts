import * as valid from "./utils";
import { Signer, Signable, Provider } from "./interface";
import { Address } from "./address";
import { Balance } from "./balance";
import { GasPrice, GasLimit } from "./gas";
import { NetworkConfig } from "./networkConfig";
import { Nonce } from "./nonce";

export class Transaction implements Signable {
    protected nonce: Nonce = new Nonce(0);
    protected value: Balance = Balance.Zero();
    protected sender: Address = Address.Zero();
    protected receiver: Address = Address.Zero();
    protected gasPrice: GasPrice = NetworkConfig.Default.MinGasPrice;
    protected gasLimit: GasLimit = NetworkConfig.Default.MinGasLimit;
    protected data: string = "";  // TODO: TransactionPayload
    protected chainID: string = ""; // TODO: in networkConfig
    protected version: number = 0; // TODO: in networkConfig
    protected signature: string = ""; // ??? primitive or not?

    protected hash: string = ""; // primitive or not?
    protected status: string = "unknown"; // primitive!

    public constructor(init?: Partial<Transaction>) {
        Object.assign(this, init);
    }

    public validate() {
        // this.data = valid.TxData(data.data);
        // this.chainID = valid.ChainID(data.chainID);
        // this.version = valid.Version(data.version);
    }

    public setStatus(status: string) {
        this.status = status;
    }

    public getStatus(): string {
        return this.status;
    }

    public getNonce(): number {
        return this.nonce.value;
    }

    // public getSender(): string {
    //     return this.sender;
    // }

    // public getData(): string {
    //     return this.data;
    // }

    // TODO change this method to take no arguments,
    // and to use this.Sender as the signer, because
    // Account implements the Signer interface.
    public sign(signer: Signer) {
        signer.sign(this);
    }

    public getPlain(): any {
        let plainTx: any = {
            nonce: this.nonce,
            value: this.value.toString(),
            receiver: this.receiver,
            sender: this.sender,
        };

        plainTx.gasPrice = this.gasPrice;
        plainTx.gasLimit = this.gasLimit;
        if (this.data != "") {
            plainTx.data = Buffer.from(this.data).toString("base64");
        }

        plainTx.chainID = this.chainID;
        plainTx.version = this.version;

        return plainTx;
    }

    public getAsSendable(): any {
        // if (!this.signed) {
        //     throw errors.ErrTransactionNotSigned;
        // }

        let tx = this.getPlain();
        tx.signature = this.signature;

        return tx;
    }

    public serializeForSigning(): Buffer {
        let tx = this.getPlain();

        let serializedTx = JSON.stringify(tx);
        return Buffer.from(serializedTx);
    }

    public applySignature(signature: Buffer) {
        // TODO throw error if the signature can't be validated against
        // this.address (which is the public key)
        this.signature = signature.toString('hex');
        //this.signed = true;
    }
}

export class TransactionPayload {

}

// class Transaction(ITransaction):

//     # The data field is base64-encoded. erdpy only supports utf-8 "data" at this moment.
//     def data_encoded(self) -> str:
//         data_bytes = self.data.encode("utf-8")
//         data_base64 = base64.b64encode(data_bytes).decode()
//         return data_base64

//     # Useful when loading a tx from a file (when data is already encoded in base64)
//     def data_decoded(self) -> str:
//         return base64.b64decode(self.data).decode()

//     def sign(self, account: Account):
//         self.signature = signing.sign_transaction(self, account)

//     def serialize(self) -> bytes:
//         dictionary = self.to_dictionary()
//         serialized = self._dict_to_json(dictionary)
//         return serialized

//     def _dict_to_json(self, dictionary: Dict[str, Any]):
//         serialized = json.dumps(dictionary, separators=(',', ':')).encode("utf8")
//         return serialized

//     def serialize_as_inner(self):
//         inner_dictionary = self.to_dictionary_as_inner()
//         serialized = self._dict_to_json(inner_dictionary)
//         serialized_hex = serialized.hex()
//         return f"relayedTx@{serialized_hex}"


//     def send(self, proxy: IElrondProxy):
//         if not self.signature:
//             raise errors.TransactionIsNotSigned()

//         logger.info(f"Transaction.send: nonce={self.nonce}")

//         dictionary = self.to_dictionary()
//         self.hash = proxy.send_transaction(dictionary)
//         logger.info(f"Hash: {self.hash}")
//         return self.hash

//     def to_dictionary(self) -> Dict[str, Any]:
//         dictionary: Dict[str, Any] = OrderedDict()
//         dictionary["nonce"] = self.nonce
//         dictionary["value"] = self.value
//         dictionary["receiver"] = self.receiver
//         dictionary["sender"] = self.sender
//         dictionary["gasPrice"] = self.gasPrice
//         dictionary["gasLimit"] = self.gasLimit

//         if self.data:
//             dictionary["data"] = self.data_encoded()

//         dictionary["chainID"] = self.chainID
//         dictionary["version"] = int(self.version)

//         if self.signature:
//             dictionary["signature"] = self.signature

//         return dictionary

//     # Creates the payload for a "user" / "inner" transaction
//     def to_dictionary_as_inner(self) -> Dict[str, Any]:
//         dictionary = self.to_dictionary()
//         dictionary["receiver"] = base64.b64encode(Address(self.receiver).pubkey()).decode()
//         dictionary["sender"] = base64.b64encode(Address(self.sender).pubkey()).decode()
//         dictionary["chainID"] = base64.b64encode(self.chainID.encode()).decode()
//         dictionary["signature"] = base64.b64encode(bytes(bytearray.fromhex(self.signature))).decode()
//         dictionary["value"] = int(self.value)

//         return dictionary

//     def wrap_inner(self, inner: ITransaction) -> None:
//         self.data = inner.serialize_as_inner()


// def do_prepare_transaction(args: Any) -> Transaction:
//     account = Account()
//     if args.pem:
//         account = Account(pem_file=args.pem, pem_index=args.pem_index)
//     elif args.keyfile and args.passfile:
//         account = Account(key_file=args.keyfile, pass_file=args.passfile)

//     tx = Transaction()
//     tx.nonce = int(args.nonce)
//     tx.value = args.value
//     tx.sender = account.address.bech32()
//     tx.receiver = args.receiver
//     tx.gasPrice = int(args.gas_price)
//     tx.gasLimit = int(args.gas_limit)
//     tx.data = args.data
//     tx.chainID = args.chain
//     tx.version = int(args.version)

//     tx.sign(account)
//     return tx
