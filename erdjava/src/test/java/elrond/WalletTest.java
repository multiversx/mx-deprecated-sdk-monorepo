package elrond;

import org.junit.Test;

import java.io.IOException;

import org.bouncycastle.util.encoders.Hex;

import static org.junit.Assert.assertEquals;

public class WalletTest {
    @Test
    public void deriveKeys() throws IOException {
        // Emotion spare
        var mnemonic = "emotion spare multiply lecture rude machine raise radio ability doll depend equip pass ghost cabin delay birth opera shoe force any slow fluid old";
        var expectedPrivateKey = "4d6fbfd1fa028afee050068f08c46b95754fd27a06f429b308ba326fff094349";
        var expectedPublicKey = "10afb6ed5c730bff355db7958ae19a466d4c78be8780db271192eec1b266c2a4";

        var keys = Wallet.deriveKeys(mnemonic, 0);
        assertEquals(expectedPrivateKey, new String(Hex.encode(keys.privateKey)));
        assertEquals(expectedPublicKey, new String(Hex.encode(keys.publicKey)));

        // Real reveal
        mnemonic = "real reveal sausage puppy artefact chapter original enough cinnamon run pledge awake fall double antenna admit keep melody celery since hood hurry achieve fee";
        expectedPrivateKey = "33306aa0bf13a02057ece15e07dc8e9cfff2b77147d5a007d205d782fc90e362";
        expectedPublicKey = "fd41097cdc0462dfb4fc96c1f04410ad13407e012290c73bbb85d8a96d28aa22";
        
        keys = Wallet.deriveKeys(mnemonic, 0);
        assertEquals(expectedPrivateKey, new String(Hex.encode(keys.privateKey)));
        assertEquals(expectedPublicKey, new String(Hex.encode(keys.publicKey)));
    }
}
