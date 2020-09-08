/*
 * Copyright 2018 Coinomi Ltd
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package elrond;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.Locale;

public class Bech32 {
    /**
     * The io.nayuki.bitcoin.crypto.Bech32 character set for encoding.
     */
    private static final String CHARSET = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";

    /**
     * The io.nayuki.bitcoin.crypto.Bech32 character set for decoding.
     */
    private static final byte[] CHARSET_REV = { -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
            -1, -1, -1, 15, -1, 10, 17, 21, 20, 26, 30, 7, 5, -1, -1, -1, -1, -1, -1, -1, 29, -1, 24, 13, 25, 9, 8, 23,
            -1, 18, 22, 31, 27, 19, -1, 1, 0, 3, 16, 11, 28, 12, 14, 6, 4, 2, -1, -1, -1, -1, -1, -1, 29, -1, 24, 13,
            25, 9, 8, 23, -1, 18, 22, 31, 27, 19, -1, 1, 0, 3, 16, 11, 28, 12, 14, 6, 4, 2, -1, -1, -1, -1, -1 };

    public static class Bech32Data {
        final String hrp;
        final byte[] data;

        private Bech32Data(final String hrp, final byte[] data) {
            this.hrp = hrp;
            this.data = data;
        }

        public String getHrp() {
            return hrp;
        }

        public byte[] getData() {
            return data;
        }
    }

    /**
     * Internal function that computes the Bech32 checksum
     */
    private static int polymod(final byte[] values) {
        int[] generator = new int[]{0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3};
        int chk = 1;
        
        for (byte value : values) {
            int valueAsInt = value & 0xff;
            int top = chk >>> 25;
            chk = (chk & 0x1ffffff) << 5 ^ valueAsInt;

            for (int i = 0; i < 5; i++) {
                if (((top >>> i) & 1) != 0) {
                    chk ^= generator[i];
                }
            }
        }

        return chk;
    }

    /**
     * Expand a HRP for use in checksum computation.
     */
    private static byte[] expandHrp(final String hrp) {
        int hrpLength = hrp.length();
        byte ret[] = new byte[hrpLength * 2 + 1];
        for (int i = 0; i < hrpLength; ++i) {
            int c = hrp.charAt(i) & 0x7f; // Limit to standard 7-bit ASCII
            ret[i] = (byte) ((c >>> 5) & 0x07);
            ret[i + hrpLength + 1] = (byte) (c & 0x1f);
        }
        ret[hrpLength] = 0;
        return ret;
    }

    /**
     * Verify a checksum.
     */
    private static boolean verifyChecksum(final String hrp, final byte[] values) {
        byte[] hrpExpanded = expandHrp(hrp);
        byte[] combined = new byte[hrpExpanded.length + values.length];
        System.arraycopy(hrpExpanded, 0, combined, 0, hrpExpanded.length);
        System.arraycopy(values, 0, combined, hrpExpanded.length, values.length);
        return polymod(combined) == 1;
    }

    /**
     * Create a checksum.
     */
    private static byte[] createChecksum(final String hrp, final byte[] values) {
        byte[] hrpExpanded = expandHrp(hrp);
        byte[] enc = new byte[hrpExpanded.length + values.length + 6];
        System.arraycopy(hrpExpanded, 0, enc, 0, hrpExpanded.length);
        System.arraycopy(values, 0, enc, hrpExpanded.length, values.length);
        int mod = polymod(enc) ^ 1;
        byte[] ret = new byte[6];
        for (int i = 0; i < 6; ++i) {
            ret[i] = (byte) ((mod >>> (5 * (5 - i))) & 31);
        }
        return ret;
    }

    /**
     * Encode a io.nayuki.bitcoin.crypto.Bech32 string.
     */
    public static String encode(final Bech32Data bech32) {
        return encode(bech32.hrp, bech32.data);
    }

    /**
     * Encode a io.nayuki.bitcoin.crypto.Bech32 string.
     */
    public static String encode(String hrp, final byte[] values) {
        // checkArgument(hrp.length() >= 1, "Human-readable part is too short");
        // checkArgument(hrp.length() <= 83, "Human-readable part is too long");
        hrp = hrp.toLowerCase(Locale.ROOT);
        byte[] checksum = createChecksum(hrp, values);
        byte[] combined = new byte[values.length + checksum.length];
        System.arraycopy(values, 0, combined, 0, values.length);
        System.arraycopy(checksum, 0, combined, values.length, checksum.length);
        StringBuilder sb = new StringBuilder(hrp.length() + 1 + combined.length);
        sb.append(hrp);
        sb.append('1');
        for (byte b : combined) {
            sb.append(CHARSET.charAt(b));
        }
        return sb.toString();
    }

    /**
     * Decode a io.nayuki.bitcoin.crypto.Bech32 string.
     */
    public static Bech32Data decode(final String str) throws AddressFormatException {
        boolean lower = false, upper = false;
        if (str.length() < 8)
            throw new AddressFormatException("input too short");
        if (str.length() > 90)
            throw new AddressFormatException("input too long");
        for (int i = 0; i < str.length(); ++i) {
            char c = str.charAt(i);
            if (c < 33 || c > 126)
                throw new AddressFormatException("invalid character");
            if (c >= 'a' && c <= 'z') {
                if (upper)
                    throw new AddressFormatException("invalid character");
                lower = true;
            }
            if (c >= 'A' && c <= 'Z') {
                if (lower)
                    throw new AddressFormatException("invalid character");
                upper = true;
            }
        }
        final int pos = str.lastIndexOf('1');
        if (pos < 1)
            throw new AddressFormatException("missing hrp");
        final int dataPartLength = str.length() - 1 - pos;
        if (dataPartLength < 6)
            throw new AddressFormatException("data part to short");
        byte[] values = new byte[dataPartLength];
        for (int i = 0; i < dataPartLength; ++i) {
            char c = str.charAt(i + pos + 1);
            if (CHARSET_REV[c] == -1)
                throw new AddressFormatException("invalid character");
            values[i] = CHARSET_REV[c];
        }
        String hrp = str.substring(0, pos).toLowerCase(Locale.ROOT);
        if (!verifyChecksum(hrp, values))
            throw new AddressFormatException("invalid checksum");
        return new Bech32Data(hrp, Arrays.copyOfRange(values, 0, values.length - 6));
    }

    /**
     * General power-of-2 base conversion.
     * 
     * @throws CannotConvertBitsException
     */
    public static byte[] convertBits(byte[] data, int fromBits, int toBits, boolean pad)
            throws CannotConvertBitsException {
        int acc = 0;
        int bits = 0;
        ByteArrayOutputStream ret = new ByteArrayOutputStream();
        int maxv = (1 << toBits) - 1;
        int maxAcc = (1 << (fromBits + toBits - 1)) - 1;

        for (byte value : data) {
            int valueAsInt = value & 0xff;

            if ((valueAsInt < 0) || (valueAsInt >>> fromBits != 0)) {
                throw new CannotConvertBitsException();
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
            throw new CannotConvertBitsException();
        }

        return ret.toByteArray();
    }

    public static class CannotConvertBitsException extends Exception {

        /**
         *
         */
        private static final long serialVersionUID = 7002466269883351644L;
    }

    public static class AddressFormatException extends Exception {
        public AddressFormatException(String message) {
            super(message);
        }
    }
}
