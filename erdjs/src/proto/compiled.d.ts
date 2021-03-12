import * as $protobuf from "protobufjs";
/** Namespace proto. */
export namespace proto {

    /** Properties of a Transaction. */
    interface ITransaction {

        /** Transaction Nonce */
        Nonce?: (number|Long|null);

        /** Transaction Value */
        Value?: (Uint8Array|null);

        /** Transaction RcvAddr */
        RcvAddr?: (Uint8Array|null);

        /** Transaction RcvUserName */
        RcvUserName?: (Uint8Array|null);

        /** Transaction SndAddr */
        SndAddr?: (Uint8Array|null);

        /** Transaction SndUserName */
        SndUserName?: (Uint8Array|null);

        /** Transaction GasPrice */
        GasPrice?: (number|Long|null);

        /** Transaction GasLimit */
        GasLimit?: (number|Long|null);

        /** Transaction Data */
        Data?: (Uint8Array|null);

        /** Transaction ChainID */
        ChainID?: (Uint8Array|null);

        /** Transaction Version */
        Version?: (number|null);

        /** Transaction Signature */
        Signature?: (Uint8Array|null);

        /** Transaction Options */
        Options?: (number|null);
    }

    /** Represents a Transaction. */
    class Transaction implements ITransaction {

        /**
         * Constructs a new Transaction.
         * @param [properties] Properties to set
         */
        constructor(properties?: proto.ITransaction);

        /** Transaction Nonce. */
        public Nonce: (number|Long);

        /** Transaction Value. */
        public Value: Uint8Array;

        /** Transaction RcvAddr. */
        public RcvAddr: Uint8Array;

        /** Transaction RcvUserName. */
        public RcvUserName: Uint8Array;

        /** Transaction SndAddr. */
        public SndAddr: Uint8Array;

        /** Transaction SndUserName. */
        public SndUserName: Uint8Array;

        /** Transaction GasPrice. */
        public GasPrice: (number|Long);

        /** Transaction GasLimit. */
        public GasLimit: (number|Long);

        /** Transaction Data. */
        public Data: Uint8Array;

        /** Transaction ChainID. */
        public ChainID: Uint8Array;

        /** Transaction Version. */
        public Version: number;

        /** Transaction Signature. */
        public Signature: Uint8Array;

        /** Transaction Options. */
        public Options: number;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @param [properties] Properties to set
         * @returns Transaction instance
         */
        public static create(properties?: proto.ITransaction): proto.Transaction;

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encode(message: proto.ITransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @param message Transaction message or plain object to encode
         * @param [writer] Writer to encode to
         * @returns Writer
         */
        public static encodeDelimited(message: proto.ITransaction, writer?: $protobuf.Writer): $protobuf.Writer;

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @param reader Reader or buffer to decode from
         * @param [length] Message length if known beforehand
         * @returns Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): proto.Transaction;

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @param reader Reader or buffer to decode from
         * @returns Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): proto.Transaction;

        /**
         * Verifies a Transaction message.
         * @param message Plain object to verify
         * @returns `null` if valid, otherwise the reason why it is not
         */
        public static verify(message: { [k: string]: any }): (string|null);

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @param object Plain object
         * @returns Transaction
         */
        public static fromObject(object: { [k: string]: any }): proto.Transaction;

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @param message Transaction
         * @param [options] Conversion options
         * @returns Plain object
         */
        public static toObject(message: proto.Transaction, options?: $protobuf.IConversionOptions): { [k: string]: any };

        /**
         * Converts this Transaction to JSON.
         * @returns JSON object
         */
        public toJSON(): { [k: string]: any };
    }
}
