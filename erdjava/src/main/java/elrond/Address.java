package elrond;

import org.bouncycastle.util.encoders.DecoderException;
import org.bouncycastle.util.encoders.Hex;

import elrond.Bech32.Bech32Data;
import elrond.Exceptions.AddressException;

public class Address {
    static final String HRP = "erd";
    static final int PUBKEY_LENGTH = 32;
    static final int PUBKEY_STRING_LENGTH = PUBKEY_LENGTH * 2; // hex-encoded
    static final int BECH32_LENGTH = 62;

    private final String valueHex;

    private Address(String valueHex) {
        this.valueHex = valueHex;
    }

    public static Address createEmptyAddress() {
        return new Address("");
    }

    public static Address fromBech32(String value) throws Exceptions.AddressException {
        Bech32Data bech32Data = Bech32.decode(value);
        if (!bech32Data.hrp.equals(HRP)) {
            throw new Exceptions.BadAddressHrpException();
        }

        byte[] decodedBytes = Bech32.convertBits(bech32Data.data, 5, 8, false);
        String hex = new String(Hex.encode(decodedBytes));
        return new Address(hex);
    }

    public static Address fromHex(String value) throws Exceptions.AddressException {
        if (value.length() != PUBKEY_STRING_LENGTH || !isValidHex(value)) {
            throw new Exceptions.CannotCreateAddressException(value);
        }

        return new Address(value);
    }

    private static boolean isValidHex(String value) {
        try {
            Hex.decode(value);
            return true;
        } catch (DecoderException error) {
            return false;
        }
    }

    public String hex() {
        return this.valueHex;
    }

    public byte[] pubkey() {
        return Hex.decode(this.valueHex);
    }

    public String bech32() throws Exceptions.AddressException {
        byte[] pubkey = this.pubkey();
        String address = Bech32.encode(HRP, Bech32.convertBits(pubkey, 8, 5, true));
        return address;
    }

    public static boolean isValidBech32(String value) {
        try {
            Address.fromBech32(value);
            return true;
        } catch(AddressException error){
            return false;
        }
    }
}
