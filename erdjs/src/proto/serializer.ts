import { Transaction } from "../transaction";
import { proto } from "./compiled";

/**
 * Hides away the serialization complexity, for each type of object (e.g. transactions).
 
 * The implementation is non-generic, but practical: there's a pair of `serialize` / `deserialize` method for each type of object.
 */
export class ProtoSerializer {
    /**
     * Serializes a Transaction object to a Buffer. Handles low-level conversion logic and field-mappings as well.
     */
    serializeTransaction(transaction: Transaction): Buffer {
        let protoTransaction = new proto.Transaction({
            Nonce: transaction.nonce.valueOf(),
            Value: Buffer.alloc(0), // TODO!
            RcvAddr: transaction.receiver.pubkey(),
            RcvUserName: Buffer.alloc(0),
            SndAddr: transaction.sender.pubkey(),
            SndUserName: Buffer.alloc(0),
            GasPrice: transaction.gasPrice.valueOf(),
            GasLimit: transaction.gasLimit.valueOf(),
            Data: transaction.data.valueOf(),
            ChainID: Buffer.from(transaction.chainID.valueOf()),
            Version: transaction.version.valueOf(),
            Signature: Buffer.from(transaction.signature.hex(), "hex")
        });

        let encoded = proto.Transaction.encode(protoTransaction).finish();
        let buffer = Buffer.from(encoded);
        return buffer;

    }

    deserializeTransaction(_buffer: Buffer): Transaction {
        return new Transaction();
    }
}
