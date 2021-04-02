import { BytesValue } from "../typesystem/bytes";
import { TokenIdentifierValue } from "../typesystem/tokenIdentifier";
import { BytesBinaryCodec } from "./bytes";

export class TokenIdentifierCodec {
    private readonly bytesCodec = new BytesBinaryCodec();

    decodeNested(buffer: Buffer): [TokenIdentifierValue, number] {
        let [bytesValue, length] = this.bytesCodec.decodeNested(buffer);
        return [new TokenIdentifierValue(bytesValue.valueOf()), length];
    }

    decodeTopLevel(buffer: Buffer): TokenIdentifierValue {
        let bytesValue = this.bytesCodec.decodeTopLevel(buffer);
        return new TokenIdentifierValue(bytesValue.valueOf());
    }

    encodeNested(tokenIdentifier: TokenIdentifierValue): Buffer {
        let bytesValue = new BytesValue(tokenIdentifier.valueOf());
        return this.bytesCodec.encodeNested(bytesValue);
    }

    encodeTopLevel(tokenIdentifier: TokenIdentifierValue): Buffer {
        return tokenIdentifier.valueOf();
    }
}
