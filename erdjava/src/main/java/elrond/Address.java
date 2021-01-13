package elrond;

import java.io.ByteArrayOutputStream;

import org.bitcoinj.core.Bech32;
import org.bouncycastle.util.encoders.DecoderException;
import org.bouncycastle.util.encoders.Hex;

import elrond.Exceptions.AddressException;

public class Address {
    static final String HRP = "erd";
    static final int PUBKEY_LENGTH = 32;
    static final int PUBKEY_STRING_LENGTH = PUBKEY_LENGTH * 2; // hex-encoded
    static final int BECH32_LENGTH = 62;
    static final String ZERO_PUBKEY_STRING = "0000000000000000000000000000000000000000000000000000000000000000";

    private final String valueHex;

    private Address(String valueHex) {
        this.valueHex = valueHex;
    }

    public static Address createZeroAddress() {
        return new Address(ZERO_PUBKEY_STRING);
    }

    public static Address fromBech32(String value) throws Exceptions.AddressException {
        Bech32.Bech32Data bech32Data;
        try {
            bech32Data = Bech32.decode(value);
        }
        catch(Exception e) {
            throw new Exceptions.CannotCreateBech32AddressException(value);
        }
        if (!bech32Data.hrp.equals(HRP)) {
            throw new Exceptions.BadAddressHrpException();
        }

        byte[] decodedBytes = convertBits(bech32Data.data, 5, 8, false);
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

    public String bech32() throws AddressException {
        byte[] pubkey = this.pubkey();
        String address = Bech32.encode(HRP, convertBits(pubkey, 8, 5, true));
        return address;
    }

    public static boolean isValidBech32(String value) {
        try {
            Address.fromBech32(value);
            return true;
        } catch (AddressException error) {
            return false;
        }
    }

    /**
     * General power-of-2 base conversion.
     */
    public static byte[] convertBits(byte[] data, int fromBits, int toBits, boolean pad) throws Exceptions.AddressException {
        /*-
        Reference Python implementation by Pieter Wuille:
        
        def convertbits(data, frombits, tobits, pad=True):
            acc = 0
            bits = 0
            ret = []
            maxv = (1 << tobits) - 1
            max_acc = (1 << (frombits + tobits - 1)) - 1
            for value in data:
                if value < 0 or (value >> frombits):
                    return None
                acc = ((acc << frombits) | value) & max_acc
                bits += frombits
                while bits >= tobits:
                    bits -= tobits
                    ret.append((acc >> bits) & maxv)
            if pad:
                if bits:
                    ret.append((acc << (tobits - bits)) & maxv)
            elif bits >= frombits or ((acc << (tobits - bits)) & maxv):
                return None
            return ret
        */
        int acc = 0;
        int bits = 0;
        ByteArrayOutputStream ret = new ByteArrayOutputStream();
        int maxv = (1 << toBits) - 1;
        int maxAcc = (1 << (fromBits + toBits - 1)) - 1;

        for (byte value : data) {
            int valueAsInt = value & 0xff;

            if ((valueAsInt < 0) || (valueAsInt >>> fromBits != 0)) {
                throw new Exceptions.CannotConvertBitsException();
            }

            acc = ((acc << fromBits) | valueAsInt) & maxAcc;
            bits += fromBits;

            while (bits >= toBits) {
                bits -= toBits;
                ret.write((acc >>> bits) & maxv);
            }
        }

        if (pad) {
            if (bits > 0) {
                ret.write((acc << (toBits - bits)) & maxv);
            }
        } else if (bits >= fromBits || ((acc << (toBits - bits)) & maxv) != 0) {
            throw new Exceptions.CannotConvertBitsException();
        }

        return ret.toByteArray();
    }
}
