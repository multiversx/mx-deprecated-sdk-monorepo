package elrond;

import org.junit.Test;


import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;

public class AddressTest {
    @Test
    public void shouldCreate() throws Exception {
        final String aliceBech32 = "erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz";
        final String bobBech32 = "erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r";
        final String aliceHex = "fd691bb5e85d102687d81079dffce842d4dc328276d2d4c60d8fd1c3433c3293";
        final String bobHex = "c70cf50b238372fffaf7b7c5723b06b57859d424a2da621bcc1b2f317543aa36";

        assertEquals(aliceHex, Address.fromBech32(aliceBech32).hex());
        assertEquals(bobHex, Address.fromBech32(bobBech32).hex());

        assertEquals(aliceBech32, Address.fromHex(aliceHex).bech32());
        assertEquals(bobBech32, Address.fromHex(bobHex).bech32());
    }

    @Test
    public void isValidBech32() throws Exception {
        assertTrue(Address.isValidBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"));
        assertTrue(Address.isValidBech32("erd1cux02zersde0l7hhklzhywcxk4u9n4py5tdxyx7vrvhnza2r4gmq4vw35r"));
        assertTrue(Address.isValidBech32("ERD1CUX02ZERSDE0L7HHKLZHYWCXK4U9N4PY5TDXYX7VRVHNZA2R4GMQ4VW35R"));

        assertFalse(Address.isValidBech32(""));
        assertFalse(Address.isValidBech32("erd1."));
        assertFalse(Address.isValidBech32("tbnb1uzqphymsp539lc8s2pucqwdphzydmr2a76jm8w"));
        assertFalse(Address.isValidBech32("erd1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldy"));
        assertFalse(Address.isValidBech32("bad1l453hd0gt5gzdp7czpuall8ggt2dcv5zwmfdf3sd3lguxseux2fsmsgldz"));
        assertFalse(Address.isValidBech32("erd1CUX02ZERSDE0L7HHKLZHYWCXK4U9N4PY5TDXYX7VRVHNZA2R4GMQ4VW35R"));
    }
}
