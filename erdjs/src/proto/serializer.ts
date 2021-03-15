import * as errors from "../errors";
import { Balance } from "../balance";
import { bigIntToBuffer } from "../smartcontracts/codec/utils";
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
            // elrond-go's serializer handles nonce == 0 differently, thus we treat 0 as "undefined".
            Nonce: transaction.getNonce().valueOf() ? transaction.getNonce().valueOf() : undefined,
            Value: this.serializeBalance(transaction.getValue()),
            RcvAddr: transaction.getReceiver().pubkey(),
            RcvUserName: null,
            SndAddr: transaction.getSender().pubkey(),
            SndUserName: null,
            GasPrice: transaction.getGasPrice().valueOf(),
            GasLimit: transaction.getGasLimit().valueOf(),
            Data: transaction.getData().isEmpty() ? null : transaction.getData().valueOf(),
            ChainID: Buffer.from(transaction.getChainID().valueOf()),
            Version: transaction.getVersion().valueOf(),
            Signature: Buffer.from(transaction.getSignature().hex(), "hex")
        });
        
        let encoded = proto.Transaction.encode(protoTransaction).finish();
        let buffer = Buffer.from(encoded);
        return buffer;
    }

    /**
     * Custom serialization, compatible with elrond-go.
     */
    private serializeBalance(balance: Balance): Buffer {
        let value = balance.valueOf();
        if (value.isZero()) {
            return Buffer.from([0, 0]);
        }

        // Will retain the magnitude, as a buffer.
        let buffer = bigIntToBuffer(value);
        // We prepend the "positive" sign marker, in order to be compatible with Elrond Go's "sign & magnitude" proto-representation (a custom one).
        buffer = Buffer.concat([Buffer.from([0x00]), buffer]);
        return buffer;
    }

    deserializeTransaction(_buffer: Buffer): Transaction {
        // Not needed (yet).
        throw new errors.ErrUnsupportedOperation("deserializeTransaction");
    }
}
