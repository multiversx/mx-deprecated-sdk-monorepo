package elrond;

import org.bouncycastle.util.encoders.Hex;

import elrond.Bech32.AddressFormatException;
import elrond.Bech32.CannotConvertBitsException;

public class Address {
    static final String HRP = "erd";
    static final int PUBKEY_LENGTH = 32;
    static final int PUBKEY_STRING_LENGTH = PUBKEY_LENGTH * 2; // hex-encoded
    static final int BECH32_LENGTH = 62;

    private final String valueHex;

    private Address(String valueHex) {
        this.valueHex = valueHex;
    }

    public static Address fromHex(String value) throws ErrAddressCannotCreate {
        var decoded = Hex.decode(value);
        var encodedAgain = new String(Hex.encode(decoded));
        var isValid = encodedAgain.equals(value);

        if (!isValid) {
            throw new ErrAddressCannotCreate(value);
        }

        return new Address(value);
    }

    public static Address fromBech32(String value) throws AddressFormatException, CannotConvertBitsException {
        var bech32Data = Bech32.decode(value);
        var decodedBytes = Bech32.convertBits(bech32Data.data, 5, 8, false);
        var hex = new String(Hex.encode(decodedBytes));
        return new Address(hex);
    }

    public String hex() {
        return this.valueHex;
    }

    public byte[] pubkey() {
        return Hex.decode(this.valueHex);
    }

    public String bech32() throws CannotConvertBitsException {
        var pubkey = this.pubkey();
        var address = Bech32.encode(HRP, Bech32.convertBits(pubkey, 8, 5, true));
        return address;
    }
}
