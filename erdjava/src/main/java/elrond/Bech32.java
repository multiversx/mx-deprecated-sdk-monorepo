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
        int[] generator = new int[] { 0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3 };
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
     * Validate a Bech32 string, and determine HRP and data.
     */
    public static Bech32Data decode(String bech) throws Bech32Exception {
        if (bech.length() > 90) {
            throw new Bech32Exception();
        }

        if ((bech.chars().anyMatch(x -> (x < 33) || (x > 126)))) {
            throw new InvalidCharactersException();
        }

        boolean isFullLower = bech.toLowerCase().equals(bech);
        boolean isFullUpper = bech.toUpperCase().equals(bech);
        if (!isFullLower && !isFullUpper) {
            throw new InconsistentCasingException();
        }

        bech = bech.toLowerCase();
        final int pos = bech.lastIndexOf('1');
        if ((pos < 1) || (pos + 7 > bech.length())) {
            throw new MissingHrpException();
        }

        String dataPart = bech.substring(pos+1);

        boolean hasInvalidChars = dataPart.chars().anyMatch(x -> CHARSET.indexOf(x) < 0);
        if (hasInvalidChars) {
            throw new InvalidCharactersException();
        }

        byte[] dataIndices = Utils.toByteArray(dataPart.chars().map(x -> CHARSET.indexOf(x)).toArray());
        String hrp = bech.substring(0, pos);

        if (!verifyChecksum(hrp, dataIndices)) {
            throw new InvalidChecksumException();
        }

        return new Bech32Data(hrp, Arrays.copyOfRange(dataIndices, 0, dataIndices.length - 6));
    }

    /**
     * General power-of-2 base conversion.
     * 
     * @throws Bech32Exception
     */
    public static byte[] convertBits(byte[] data, int fromBits, int toBits, boolean pad) throws Bech32Exception {
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

    public static class Bech32Exception extends Exception {

        /**
         *
         */
        private static final long serialVersionUID = 3260891634512906120L;

        public Bech32Exception() {
            super();
        }

        public Bech32Exception(String message) {
            super(message);
        }
    }

    public static class CannotConvertBitsException extends Bech32Exception {

        /**
         *
         */
        private static final long serialVersionUID = 7002466269883351644L;
    }

    public static class InvalidCharactersException extends Bech32Exception {

        /**
         *
         */
        private static final long serialVersionUID = 440923894748025560L;
    }

    public static class InconsistentCasingException extends Bech32Exception {

        /**
         *
         */
        private static final long serialVersionUID = -6909226964519236168L;
    }

    public static class MissingHrpException extends Bech32Exception {

        /**
         *
         */
        private static final long serialVersionUID = -2279315088416839103L;
    }

    public static class InvalidChecksumException extends Bech32Exception {

        /**
         *
         */
        private static final long serialVersionUID = 1194101021531173712L;
    }
}
