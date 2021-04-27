/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.proto = (function() {

    /**
     * Namespace proto.
     * @exports proto
     * @namespace
     */
    var proto = {};

    proto.Transaction = (function() {

        /**
         * Properties of a Transaction.
         * @memberof proto
         * @interface ITransaction
         * @property {number|Long|null} [Nonce] Transaction Nonce
         * @property {Uint8Array|null} [Value] Transaction Value
         * @property {Uint8Array|null} [RcvAddr] Transaction RcvAddr
         * @property {Uint8Array|null} [RcvUserName] Transaction RcvUserName
         * @property {Uint8Array|null} [SndAddr] Transaction SndAddr
         * @property {Uint8Array|null} [SndUserName] Transaction SndUserName
         * @property {number|Long|null} [GasPrice] Transaction GasPrice
         * @property {number|Long|null} [GasLimit] Transaction GasLimit
         * @property {Uint8Array|null} [Data] Transaction Data
         * @property {Uint8Array|null} [ChainID] Transaction ChainID
         * @property {number|null} [Version] Transaction Version
         * @property {Uint8Array|null} [Signature] Transaction Signature
         * @property {number|null} [Options] Transaction Options
         */

        /**
         * Constructs a new Transaction.
         * @memberof proto
         * @classdesc Represents a Transaction.
         * @implements ITransaction
         * @constructor
         * @param {proto.ITransaction=} [properties] Properties to set
         */
        function Transaction(properties) {
            if (properties)
                for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                    if (properties[keys[i]] != null)
                        this[keys[i]] = properties[keys[i]];
        }

        /**
         * Transaction Nonce.
         * @member {number|Long} Nonce
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Nonce = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction Value.
         * @member {Uint8Array} Value
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Value = $util.newBuffer([]);

        /**
         * Transaction RcvAddr.
         * @member {Uint8Array} RcvAddr
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.RcvAddr = $util.newBuffer([]);

        /**
         * Transaction RcvUserName.
         * @member {Uint8Array} RcvUserName
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.RcvUserName = $util.newBuffer([]);

        /**
         * Transaction SndAddr.
         * @member {Uint8Array} SndAddr
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.SndAddr = $util.newBuffer([]);

        /**
         * Transaction SndUserName.
         * @member {Uint8Array} SndUserName
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.SndUserName = $util.newBuffer([]);

        /**
         * Transaction GasPrice.
         * @member {number|Long} GasPrice
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.GasPrice = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction GasLimit.
         * @member {number|Long} GasLimit
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.GasLimit = $util.Long ? $util.Long.fromBits(0,0,true) : 0;

        /**
         * Transaction Data.
         * @member {Uint8Array} Data
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Data = $util.newBuffer([]);

        /**
         * Transaction ChainID.
         * @member {Uint8Array} ChainID
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.ChainID = $util.newBuffer([]);

        /**
         * Transaction Version.
         * @member {number} Version
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Version = 0;

        /**
         * Transaction Signature.
         * @member {Uint8Array} Signature
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Signature = $util.newBuffer([]);

        /**
         * Transaction Options.
         * @member {number} Options
         * @memberof proto.Transaction
         * @instance
         */
        Transaction.prototype.Options = 0;

        /**
         * Creates a new Transaction instance using the specified properties.
         * @function create
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction=} [properties] Properties to set
         * @returns {proto.Transaction} Transaction instance
         */
        Transaction.create = function create(properties) {
            return new Transaction(properties);
        };

        /**
         * Encodes the specified Transaction message. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @function encode
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encode = function encode(message, writer) {
            if (!writer)
                writer = $Writer.create();
            if (message.Nonce != null && Object.hasOwnProperty.call(message, "Nonce"))
                writer.uint32(/* id 1, wireType 0 =*/8).uint64(message.Nonce);
            if (message.Value != null && Object.hasOwnProperty.call(message, "Value"))
                writer.uint32(/* id 2, wireType 2 =*/18).bytes(message.Value);
            if (message.RcvAddr != null && Object.hasOwnProperty.call(message, "RcvAddr"))
                writer.uint32(/* id 3, wireType 2 =*/26).bytes(message.RcvAddr);
            if (message.RcvUserName != null && Object.hasOwnProperty.call(message, "RcvUserName"))
                writer.uint32(/* id 4, wireType 2 =*/34).bytes(message.RcvUserName);
            if (message.SndAddr != null && Object.hasOwnProperty.call(message, "SndAddr"))
                writer.uint32(/* id 5, wireType 2 =*/42).bytes(message.SndAddr);
            if (message.SndUserName != null && Object.hasOwnProperty.call(message, "SndUserName"))
                writer.uint32(/* id 6, wireType 2 =*/50).bytes(message.SndUserName);
            if (message.GasPrice != null && Object.hasOwnProperty.call(message, "GasPrice"))
                writer.uint32(/* id 7, wireType 0 =*/56).uint64(message.GasPrice);
            if (message.GasLimit != null && Object.hasOwnProperty.call(message, "GasLimit"))
                writer.uint32(/* id 8, wireType 0 =*/64).uint64(message.GasLimit);
            if (message.Data != null && Object.hasOwnProperty.call(message, "Data"))
                writer.uint32(/* id 9, wireType 2 =*/74).bytes(message.Data);
            if (message.ChainID != null && Object.hasOwnProperty.call(message, "ChainID"))
                writer.uint32(/* id 10, wireType 2 =*/82).bytes(message.ChainID);
            if (message.Version != null && Object.hasOwnProperty.call(message, "Version"))
                writer.uint32(/* id 11, wireType 0 =*/88).uint32(message.Version);
            if (message.Signature != null && Object.hasOwnProperty.call(message, "Signature"))
                writer.uint32(/* id 12, wireType 2 =*/98).bytes(message.Signature);
            if (message.Options != null && Object.hasOwnProperty.call(message, "Options"))
                writer.uint32(/* id 13, wireType 0 =*/104).uint32(message.Options);
            return writer;
        };

        /**
         * Encodes the specified Transaction message, length delimited. Does not implicitly {@link proto.Transaction.verify|verify} messages.
         * @function encodeDelimited
         * @memberof proto.Transaction
         * @static
         * @param {proto.ITransaction} message Transaction message or plain object to encode
         * @param {$protobuf.Writer} [writer] Writer to encode to
         * @returns {$protobuf.Writer} Writer
         */
        Transaction.encodeDelimited = function encodeDelimited(message, writer) {
            return this.encode(message, writer).ldelim();
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer.
         * @function decode
         * @memberof proto.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @param {number} [length] Message length if known beforehand
         * @returns {proto.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decode = function decode(reader, length) {
            if (!(reader instanceof $Reader))
                reader = $Reader.create(reader);
            var end = length === undefined ? reader.len : reader.pos + length, message = new $root.proto.Transaction();
            while (reader.pos < end) {
                var tag = reader.uint32();
                switch (tag >>> 3) {
                case 1:
                    message.Nonce = reader.uint64();
                    break;
                case 2:
                    message.Value = reader.bytes();
                    break;
                case 3:
                    message.RcvAddr = reader.bytes();
                    break;
                case 4:
                    message.RcvUserName = reader.bytes();
                    break;
                case 5:
                    message.SndAddr = reader.bytes();
                    break;
                case 6:
                    message.SndUserName = reader.bytes();
                    break;
                case 7:
                    message.GasPrice = reader.uint64();
                    break;
                case 8:
                    message.GasLimit = reader.uint64();
                    break;
                case 9:
                    message.Data = reader.bytes();
                    break;
                case 10:
                    message.ChainID = reader.bytes();
                    break;
                case 11:
                    message.Version = reader.uint32();
                    break;
                case 12:
                    message.Signature = reader.bytes();
                    break;
                case 13:
                    message.Options = reader.uint32();
                    break;
                default:
                    reader.skipType(tag & 7);
                    break;
                }
            }
            return message;
        };

        /**
         * Decodes a Transaction message from the specified reader or buffer, length delimited.
         * @function decodeDelimited
         * @memberof proto.Transaction
         * @static
         * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
         * @returns {proto.Transaction} Transaction
         * @throws {Error} If the payload is not a reader or valid buffer
         * @throws {$protobuf.util.ProtocolError} If required fields are missing
         */
        Transaction.decodeDelimited = function decodeDelimited(reader) {
            if (!(reader instanceof $Reader))
                reader = new $Reader(reader);
            return this.decode(reader, reader.uint32());
        };

        /**
         * Verifies a Transaction message.
         * @function verify
         * @memberof proto.Transaction
         * @static
         * @param {Object.<string,*>} message Plain object to verify
         * @returns {string|null} `null` if valid, otherwise the reason why it is not
         */
        Transaction.verify = function verify(message) {
            if (typeof message !== "object" || message === null)
                return "object expected";
            if (message.Nonce != null && message.hasOwnProperty("Nonce"))
                if (!$util.isInteger(message.Nonce) && !(message.Nonce && $util.isInteger(message.Nonce.low) && $util.isInteger(message.Nonce.high)))
                    return "Nonce: integer|Long expected";
            if (message.Value != null && message.hasOwnProperty("Value"))
                if (!(message.Value && typeof message.Value.length === "number" || $util.isString(message.Value)))
                    return "Value: buffer expected";
            if (message.RcvAddr != null && message.hasOwnProperty("RcvAddr"))
                if (!(message.RcvAddr && typeof message.RcvAddr.length === "number" || $util.isString(message.RcvAddr)))
                    return "RcvAddr: buffer expected";
            if (message.RcvUserName != null && message.hasOwnProperty("RcvUserName"))
                if (!(message.RcvUserName && typeof message.RcvUserName.length === "number" || $util.isString(message.RcvUserName)))
                    return "RcvUserName: buffer expected";
            if (message.SndAddr != null && message.hasOwnProperty("SndAddr"))
                if (!(message.SndAddr && typeof message.SndAddr.length === "number" || $util.isString(message.SndAddr)))
                    return "SndAddr: buffer expected";
            if (message.SndUserName != null && message.hasOwnProperty("SndUserName"))
                if (!(message.SndUserName && typeof message.SndUserName.length === "number" || $util.isString(message.SndUserName)))
                    return "SndUserName: buffer expected";
            if (message.GasPrice != null && message.hasOwnProperty("GasPrice"))
                if (!$util.isInteger(message.GasPrice) && !(message.GasPrice && $util.isInteger(message.GasPrice.low) && $util.isInteger(message.GasPrice.high)))
                    return "GasPrice: integer|Long expected";
            if (message.GasLimit != null && message.hasOwnProperty("GasLimit"))
                if (!$util.isInteger(message.GasLimit) && !(message.GasLimit && $util.isInteger(message.GasLimit.low) && $util.isInteger(message.GasLimit.high)))
                    return "GasLimit: integer|Long expected";
            if (message.Data != null && message.hasOwnProperty("Data"))
                if (!(message.Data && typeof message.Data.length === "number" || $util.isString(message.Data)))
                    return "Data: buffer expected";
            if (message.ChainID != null && message.hasOwnProperty("ChainID"))
                if (!(message.ChainID && typeof message.ChainID.length === "number" || $util.isString(message.ChainID)))
                    return "ChainID: buffer expected";
            if (message.Version != null && message.hasOwnProperty("Version"))
                if (!$util.isInteger(message.Version))
                    return "Version: integer expected";
            if (message.Signature != null && message.hasOwnProperty("Signature"))
                if (!(message.Signature && typeof message.Signature.length === "number" || $util.isString(message.Signature)))
                    return "Signature: buffer expected";
            if (message.Options != null && message.hasOwnProperty("Options"))
                if (!$util.isInteger(message.Options))
                    return "Options: integer expected";
            return null;
        };

        /**
         * Creates a Transaction message from a plain object. Also converts values to their respective internal types.
         * @function fromObject
         * @memberof proto.Transaction
         * @static
         * @param {Object.<string,*>} object Plain object
         * @returns {proto.Transaction} Transaction
         */
        Transaction.fromObject = function fromObject(object) {
            if (object instanceof $root.proto.Transaction)
                return object;
            var message = new $root.proto.Transaction();
            if (object.Nonce != null)
                if ($util.Long)
                    (message.Nonce = $util.Long.fromValue(object.Nonce)).unsigned = true;
                else if (typeof object.Nonce === "string")
                    message.Nonce = parseInt(object.Nonce, 10);
                else if (typeof object.Nonce === "number")
                    message.Nonce = object.Nonce;
                else if (typeof object.Nonce === "object")
                    message.Nonce = new $util.LongBits(object.Nonce.low >>> 0, object.Nonce.high >>> 0).toNumber(true);
            if (object.Value != null)
                if (typeof object.Value === "string")
                    $util.base64.decode(object.Value, message.Value = $util.newBuffer($util.base64.length(object.Value)), 0);
                else if (object.Value.length)
                    message.Value = object.Value;
            if (object.RcvAddr != null)
                if (typeof object.RcvAddr === "string")
                    $util.base64.decode(object.RcvAddr, message.RcvAddr = $util.newBuffer($util.base64.length(object.RcvAddr)), 0);
                else if (object.RcvAddr.length)
                    message.RcvAddr = object.RcvAddr;
            if (object.RcvUserName != null)
                if (typeof object.RcvUserName === "string")
                    $util.base64.decode(object.RcvUserName, message.RcvUserName = $util.newBuffer($util.base64.length(object.RcvUserName)), 0);
                else if (object.RcvUserName.length)
                    message.RcvUserName = object.RcvUserName;
            if (object.SndAddr != null)
                if (typeof object.SndAddr === "string")
                    $util.base64.decode(object.SndAddr, message.SndAddr = $util.newBuffer($util.base64.length(object.SndAddr)), 0);
                else if (object.SndAddr.length)
                    message.SndAddr = object.SndAddr;
            if (object.SndUserName != null)
                if (typeof object.SndUserName === "string")
                    $util.base64.decode(object.SndUserName, message.SndUserName = $util.newBuffer($util.base64.length(object.SndUserName)), 0);
                else if (object.SndUserName.length)
                    message.SndUserName = object.SndUserName;
            if (object.GasPrice != null)
                if ($util.Long)
                    (message.GasPrice = $util.Long.fromValue(object.GasPrice)).unsigned = true;
                else if (typeof object.GasPrice === "string")
                    message.GasPrice = parseInt(object.GasPrice, 10);
                else if (typeof object.GasPrice === "number")
                    message.GasPrice = object.GasPrice;
                else if (typeof object.GasPrice === "object")
                    message.GasPrice = new $util.LongBits(object.GasPrice.low >>> 0, object.GasPrice.high >>> 0).toNumber(true);
            if (object.GasLimit != null)
                if ($util.Long)
                    (message.GasLimit = $util.Long.fromValue(object.GasLimit)).unsigned = true;
                else if (typeof object.GasLimit === "string")
                    message.GasLimit = parseInt(object.GasLimit, 10);
                else if (typeof object.GasLimit === "number")
                    message.GasLimit = object.GasLimit;
                else if (typeof object.GasLimit === "object")
                    message.GasLimit = new $util.LongBits(object.GasLimit.low >>> 0, object.GasLimit.high >>> 0).toNumber(true);
            if (object.Data != null)
                if (typeof object.Data === "string")
                    $util.base64.decode(object.Data, message.Data = $util.newBuffer($util.base64.length(object.Data)), 0);
                else if (object.Data.length)
                    message.Data = object.Data;
            if (object.ChainID != null)
                if (typeof object.ChainID === "string")
                    $util.base64.decode(object.ChainID, message.ChainID = $util.newBuffer($util.base64.length(object.ChainID)), 0);
                else if (object.ChainID.length)
                    message.ChainID = object.ChainID;
            if (object.Version != null)
                message.Version = object.Version >>> 0;
            if (object.Signature != null)
                if (typeof object.Signature === "string")
                    $util.base64.decode(object.Signature, message.Signature = $util.newBuffer($util.base64.length(object.Signature)), 0);
                else if (object.Signature.length)
                    message.Signature = object.Signature;
            if (object.Options != null)
                message.Options = object.Options >>> 0;
            return message;
        };

        /**
         * Creates a plain object from a Transaction message. Also converts values to other types if specified.
         * @function toObject
         * @memberof proto.Transaction
         * @static
         * @param {proto.Transaction} message Transaction
         * @param {$protobuf.IConversionOptions} [options] Conversion options
         * @returns {Object.<string,*>} Plain object
         */
        Transaction.toObject = function toObject(message, options) {
            if (!options)
                options = {};
            var object = {};
            if (options.defaults) {
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.Nonce = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.Nonce = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.Value = "";
                else {
                    object.Value = [];
                    if (options.bytes !== Array)
                        object.Value = $util.newBuffer(object.Value);
                }
                if (options.bytes === String)
                    object.RcvAddr = "";
                else {
                    object.RcvAddr = [];
                    if (options.bytes !== Array)
                        object.RcvAddr = $util.newBuffer(object.RcvAddr);
                }
                if (options.bytes === String)
                    object.RcvUserName = "";
                else {
                    object.RcvUserName = [];
                    if (options.bytes !== Array)
                        object.RcvUserName = $util.newBuffer(object.RcvUserName);
                }
                if (options.bytes === String)
                    object.SndAddr = "";
                else {
                    object.SndAddr = [];
                    if (options.bytes !== Array)
                        object.SndAddr = $util.newBuffer(object.SndAddr);
                }
                if (options.bytes === String)
                    object.SndUserName = "";
                else {
                    object.SndUserName = [];
                    if (options.bytes !== Array)
                        object.SndUserName = $util.newBuffer(object.SndUserName);
                }
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.GasPrice = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.GasPrice = options.longs === String ? "0" : 0;
                if ($util.Long) {
                    var long = new $util.Long(0, 0, true);
                    object.GasLimit = options.longs === String ? long.toString() : options.longs === Number ? long.toNumber() : long;
                } else
                    object.GasLimit = options.longs === String ? "0" : 0;
                if (options.bytes === String)
                    object.Data = "";
                else {
                    object.Data = [];
                    if (options.bytes !== Array)
                        object.Data = $util.newBuffer(object.Data);
                }
                if (options.bytes === String)
                    object.ChainID = "";
                else {
                    object.ChainID = [];
                    if (options.bytes !== Array)
                        object.ChainID = $util.newBuffer(object.ChainID);
                }
                object.Version = 0;
                if (options.bytes === String)
                    object.Signature = "";
                else {
                    object.Signature = [];
                    if (options.bytes !== Array)
                        object.Signature = $util.newBuffer(object.Signature);
                }
                object.Options = 0;
            }
            if (message.Nonce != null && message.hasOwnProperty("Nonce"))
                if (typeof message.Nonce === "number")
                    object.Nonce = options.longs === String ? String(message.Nonce) : message.Nonce;
                else
                    object.Nonce = options.longs === String ? $util.Long.prototype.toString.call(message.Nonce) : options.longs === Number ? new $util.LongBits(message.Nonce.low >>> 0, message.Nonce.high >>> 0).toNumber(true) : message.Nonce;
            if (message.Value != null && message.hasOwnProperty("Value"))
                object.Value = options.bytes === String ? $util.base64.encode(message.Value, 0, message.Value.length) : options.bytes === Array ? Array.prototype.slice.call(message.Value) : message.Value;
            if (message.RcvAddr != null && message.hasOwnProperty("RcvAddr"))
                object.RcvAddr = options.bytes === String ? $util.base64.encode(message.RcvAddr, 0, message.RcvAddr.length) : options.bytes === Array ? Array.prototype.slice.call(message.RcvAddr) : message.RcvAddr;
            if (message.RcvUserName != null && message.hasOwnProperty("RcvUserName"))
                object.RcvUserName = options.bytes === String ? $util.base64.encode(message.RcvUserName, 0, message.RcvUserName.length) : options.bytes === Array ? Array.prototype.slice.call(message.RcvUserName) : message.RcvUserName;
            if (message.SndAddr != null && message.hasOwnProperty("SndAddr"))
                object.SndAddr = options.bytes === String ? $util.base64.encode(message.SndAddr, 0, message.SndAddr.length) : options.bytes === Array ? Array.prototype.slice.call(message.SndAddr) : message.SndAddr;
            if (message.SndUserName != null && message.hasOwnProperty("SndUserName"))
                object.SndUserName = options.bytes === String ? $util.base64.encode(message.SndUserName, 0, message.SndUserName.length) : options.bytes === Array ? Array.prototype.slice.call(message.SndUserName) : message.SndUserName;
            if (message.GasPrice != null && message.hasOwnProperty("GasPrice"))
                if (typeof message.GasPrice === "number")
                    object.GasPrice = options.longs === String ? String(message.GasPrice) : message.GasPrice;
                else
                    object.GasPrice = options.longs === String ? $util.Long.prototype.toString.call(message.GasPrice) : options.longs === Number ? new $util.LongBits(message.GasPrice.low >>> 0, message.GasPrice.high >>> 0).toNumber(true) : message.GasPrice;
            if (message.GasLimit != null && message.hasOwnProperty("GasLimit"))
                if (typeof message.GasLimit === "number")
                    object.GasLimit = options.longs === String ? String(message.GasLimit) : message.GasLimit;
                else
                    object.GasLimit = options.longs === String ? $util.Long.prototype.toString.call(message.GasLimit) : options.longs === Number ? new $util.LongBits(message.GasLimit.low >>> 0, message.GasLimit.high >>> 0).toNumber(true) : message.GasLimit;
            if (message.Data != null && message.hasOwnProperty("Data"))
                object.Data = options.bytes === String ? $util.base64.encode(message.Data, 0, message.Data.length) : options.bytes === Array ? Array.prototype.slice.call(message.Data) : message.Data;
            if (message.ChainID != null && message.hasOwnProperty("ChainID"))
                object.ChainID = options.bytes === String ? $util.base64.encode(message.ChainID, 0, message.ChainID.length) : options.bytes === Array ? Array.prototype.slice.call(message.ChainID) : message.ChainID;
            if (message.Version != null && message.hasOwnProperty("Version"))
                object.Version = message.Version;
            if (message.Signature != null && message.hasOwnProperty("Signature"))
                object.Signature = options.bytes === String ? $util.base64.encode(message.Signature, 0, message.Signature.length) : options.bytes === Array ? Array.prototype.slice.call(message.Signature) : message.Signature;
            if (message.Options != null && message.hasOwnProperty("Options"))
                object.Options = message.Options;
            return object;
        };

        /**
         * Converts this Transaction to JSON.
         * @function toJSON
         * @memberof proto.Transaction
         * @instance
         * @returns {Object.<string,*>} JSON object
         */
        Transaction.prototype.toJSON = function toJSON() {
            return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
        };

        return Transaction;
    })();

    return proto;
})();

module.exports = $root;
