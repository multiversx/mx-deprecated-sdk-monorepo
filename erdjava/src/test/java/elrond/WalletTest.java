package elrond;

import org.junit.Test;

import static org.junit.Assert.assertTrue;

import java.io.IOException;

import org.bouncycastle.util.encoders.Hex;

import static org.junit.Assert.assertEquals;

public class WalletTest {
    @Test
    public void mnemonicToBip39Seed() throws IOException {
        var mnemonic = "emotion spare multiply lecture rude machine raise radio ability doll depend equip pass ghost cabin delay birth opera shoe force any slow fluid old";
        var expectedSeed = "2c3afb9202816c0ad8cfffbfe60b086c3b0600e7e96eddb589ca6bfcb2826a073c823b1c73200f152bd768c47754d7bc1daa82f860024c9916f2eab04ac50da9";
        var actualSeed = Wallet.mnemonicToBip39Seed(mnemonic);
        assertEquals(expectedSeed, new String(Hex.encode(actualSeed)));
        
        var expectedPrivateKey = "4d6fbfd1fa028afee050068f08c46b95754fd27a06f429b308ba326fff094349";
        var actualPrivateKey = Wallet.bip39SeedToPrivateKey(actualSeed, 0);
        assertEquals(expectedPrivateKey, new String(Hex.encode(actualPrivateKey)));

        // doll depend equip pass ghost cabin delay birth opera shoe force any slow
        // fluid old"
        // def test_derive_private_key(self):
        // # password = "Password1!"
        // # keystore_file =
        // "erd1zzhmdm2uwv9l7d2ak72c4cv6gek5c797s7qdkfc3jthvrvnxc2jqdsnp9y.json"
        // mnemonic = "emotion spare multiply lecture rude machine raise radio ability
        // doll depend equip pass ghost cabin delay birth opera shoe force any slow
        // fluid old"
        // mnemonic_seed =
        // "2c3afb9202816c0ad8cfffbfe60b086c3b0600e7e96eddb589ca6bfcb2826a073c823b1c73200f152bd768c47754d7bc1daa82f860024c9916f2eab04ac50da9"
        // private_key =
        // "4d6fbfd1fa028afee050068f08c46b95754fd27a06f429b308ba326fff094349"
        // public_key =
        // "10afb6ed5c730bff355db7958ae19a466d4c78be8780db271192eec1b266c2a4"
        // # address = "erd1zzhmdm2uwv9l7d2ak72c4cv6gek5c797s7qdkfc3jthvrvnxc2jqdsnp9y"

        // actual_mnemonic_seed = mnemonic_to_bip39seed(mnemonic)
        // actual_private_key = bip39seed_to_private_key(actual_mnemonic_seed)
        // signing_key = nacl.signing.SigningKey(actual_private_key)
        // actual_public_key = bytes(signing_key.verify_key)

        // self.assertEqual(mnemonic_seed, actual_mnemonic_seed.hex())
        // self.assertEqual(private_key, actual_private_key.hex())
        // self.assertEqual(public_key, actual_public_key.hex())

        // # password = "Password1!"
        // # keystore_file =
        // "erd1l4qsjlxuq33dld8ujmqlq3qs45f5qlspy2gvwwamshv2jmfg4g3q77yr0p.json"
        // mnemonic = "real reveal sausage puppy artefact chapter original enough
        // cinnamon run pledge awake fall double antenna admit keep melody celery since
        // hood hurry achieve fee"
        // mnemonic_seed =
        // "9a8a5cfe7e4e7cfea54431aa80b9179985bfbf0af29ce75aff9bc4f5766ec2f5fb308486bb702e7465467a94792d16fd66f9307a95c1912526d08b21b6cc41b8"
        // private_key =
        // "33306aa0bf13a02057ece15e07dc8e9cfff2b77147d5a007d205d782fc90e362"
        // public_key =
        // "fd41097cdc0462dfb4fc96c1f04410ad13407e012290c73bbb85d8a96d28aa22"
        // # address = "erd1l4qsjlxuq33dld8ujmqlq3qs45f5qlspy2gvwwamshv2jmfg4g3q77yr0p"

        // actual_mnemonic_seed = mnemonic_to_bip39seed(mnemonic)
        // actual_private_key = bip39seed_to_private_key(actual_mnemonic_seed)
        // signing_key: Any = nacl.signing.SigningKey(actual_private_key)
        // actual_public_key = bytes(signing_key.verify_key)

        // self.assertEqual(mnemonic_seed, actual_mnemonic_seed.hex())
        // self.assertEqual(private_key, actual_private_key.hex())
        // self.assertEqual(public_key, actual_public_key.hex())
    }
}
