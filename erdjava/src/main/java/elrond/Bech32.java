/*
 * ============================================================================
 * The code in this file is a composite work of the following:
 * ============================================================================
 *  1) The reference Python implementation by Pieter Wuille:
 *  - URL: https://github.com/sipa/bech32/blob/master/ref/python/segwit_addr.py
 *  - Notes: translated (partly) in Java
 *  - Original copyright:
 *  # Copyright (c) 2017 Pieter Wuille
 *  #
 *  # Permission is hereby granted, free of charge, to any person obtaining a copy
 *  # of this software and associated documentation files (the "Software"), to deal
 *  # in the Software without restriction, including without limitation the rights
 *  # to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  # copies of the Software, and to permit persons to whom the Software is
 *  # furnished to do so, subject to the following conditions:
 * 
 *  # The above copyright notice and this permission notice shall be included in
 *  # all copies or substantial portions of the Software.
 * 
 *  # THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  # IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  # FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  # AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  # LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  # OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  # THE SOFTWARE.
 * ============================================================================
 * 2) A Java implementation by Coinomi Ltd:
 *  - URL (bitcoinj): https://github.com/bitcoinj/bitcoinj/blob/master/core/src/main/java/org/bitcoinj/core/Bech32.java
 *  - Alternate URL (binance-chain): https://github.com/binance-chain/java-sdk/blob/master/src/main/java/com/binance/dex/api/client/encoding/Bech32.java
 *  - Notes: replaced (partly) with the reference Python implementation (translated); refactored.
 *  - Original copyright:
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
 * ============================================================================
 */

package elrond;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;
import java.util.Locale;

public class Bech32 {
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
        /*-
        Reference Python implementation by Pieter Wuille:
        
        def bech32_polymod(values):
            """Internal function that computes the Bech32 checksum."""
            generator = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3]
            chk = 1
            for value in values:
                top = chk >> 25
                chk = (chk & 0x1ffffff) << 5 ^ value
                for i in range(5):
                    chk ^= generator[i] if ((top >> i) & 1) else 0
            return chk
        */
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
     * Expand the HRP into values for checksum computation.
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
     * Verify a checksum given HRP and converted data characters.
     */
    private static boolean verifyChecksum(final String hrp, final byte[] values) {
        /*-
        Reference Python implementation by Pieter Wuille:
        
        def bech32_verify_checksum(hrp, data):
            """Verify a checksum given HRP and converted data characters."""
            return bech32_polymod(bech32_hrp_expand(hrp) + data) == 1
        */

        byte[] hrpExpanded = expandHrp(hrp);
        byte[] combined = org.bouncycastle.util.Arrays.concatenate(hrpExpanded, values);
        return polymod(combined) == 1;
    }

    /**
     * Compute the checksum values given HRP and data.
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
     * Compute a Bech32 string given HRP and data values.
     */
    public static String encode(String hrp, final byte[] values) {
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
    public static Bech32Data decode(String bech) throws Exceptions.AddressException {
        /*-
        Reference Python implementation by Pieter Wuille:
        
        def bech32_decode(bech):
            if ((any(ord(x) < 33 or ord(x) > 126 for x in bech)) or (bech.lower() != bech and bech.upper() != bech)):
                return (None, None)
            bech = bech.lower()
            pos = bech.rfind('1')
            if pos < 1 or pos + 7 > len(bech) or len(bech) > 90:
                return (None, None)
            if not all(x in CHARSET for x in bech[pos + 1:]):
                return (None, None)
            hrp = bech[:pos]
            data = [CHARSET.find(x) for x in bech[pos + 1:]]
            if not bech32_verify_checksum(hrp, data):
                return (None, None)
            return (hrp, data[:-6])
        */

        if (bech.length() > 90) {
            throw new Exceptions.AddressException();
        }

        if ((bech.chars().anyMatch(x -> (x < 33) || (x > 126)))) {
            throw new Exceptions.InvalidCharactersException();
        }

        boolean isFullLower = bech.toLowerCase().equals(bech);
        boolean isFullUpper = bech.toUpperCase().equals(bech);
        if (!isFullLower && !isFullUpper) {
            throw new Exceptions.InconsistentCasingException();
        }

        bech = bech.toLowerCase();
        final int pos = bech.lastIndexOf('1');
        if ((pos < 1) || (pos + 7 > bech.length())) {
            throw new Exceptions.MissingAddressHrpException();
        }

        String dataPart = bech.substring(pos + 1);

        boolean hasInvalidChars = dataPart.chars().anyMatch(x -> CHARSET.indexOf(x) < 0);
        if (hasInvalidChars) {
            throw new Exceptions.InvalidCharactersException();
        }

        byte[] dataIndices = Utils.toByteArray(dataPart.chars().map(x -> CHARSET.indexOf(x)).toArray());
        String hrp = bech.substring(0, pos);

        if (!verifyChecksum(hrp, dataIndices)) {
            throw new Exceptions.InvalidAddressChecksumException();
        }

        return new Bech32Data(hrp, Arrays.copyOfRange(dataIndices, 0, dataIndices.length - 6));
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
