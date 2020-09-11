package elrond;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Arrays;
import java.util.List;

import org.bitcoinj.crypto.MnemonicCode;
import org.bitcoinj.crypto.MnemonicException.MnemonicLengthException;
import org.bouncycastle.crypto.digests.SHA512Digest;
import org.bouncycastle.crypto.generators.PKCS5S2ParametersGenerator;
import org.bouncycastle.crypto.macs.HMac;
import org.bouncycastle.crypto.params.Ed25519PrivateKeyParameters;
import org.bouncycastle.crypto.params.Ed25519PublicKeyParameters;
import org.bouncycastle.crypto.params.KeyParameter;
import org.bouncycastle.crypto.signers.Ed25519Signer;
import org.bouncycastle.util.encoders.Hex;

import elrond.Exceptions.CannotDeriveKeysException;
import elrond.Exceptions.CannotGenerateMnemonicException;

public class Wallet {
    static final int DEFAULT_ENTROPY_BITS = 256; // this leads to 24-words mnemonics
    static final String BIP39_SALT_MODIFIER = "mnemonic";
    static final int BIP39_PBKDF2_ROUNDS = 2048;
    static final String BIP32_SEED_MODIFIER = "ed25519 seed";
    static final long[] ELROND_DERIVATION_PATH = { 44, 508, 0, 0, 0 };
    static final long HARDENED_OFFSET = 0x80000000;

    private final byte[] publicKey;
    private final byte[] privateKey;

    public Wallet(String privateKeyHex) {
        this(Hex.decode(privateKeyHex));
    }

    public Wallet(byte[] privateKey) {
        Ed25519PrivateKeyParameters privateKeyParameters = new Ed25519PrivateKeyParameters(privateKey, 0);
        Ed25519PublicKeyParameters publicKeyParameters = privateKeyParameters.generatePublicKey();

        this.publicKey = publicKeyParameters.getEncoded();
        this.privateKey = privateKey;
    }

    public static List<String> generateMnemonic() throws CannotGenerateMnemonicException {
        try {
            byte[] entropy = generateEntropy();
            MnemonicCode mnemonicCode = new MnemonicCode();
            List<String> mnemonic = mnemonicCode.toMnemonic(entropy);
            return mnemonic;
        } catch (IOException | MnemonicLengthException error) {
            throw new Exceptions.CannotGenerateMnemonicException();
        }
    }

    private static byte[] generateEntropy() {
        SecureRandom random = new SecureRandom();
        byte[] entropy = new byte[DEFAULT_ENTROPY_BITS / 8];
        random.nextBytes(entropy);
        return entropy;
    }

    public static Wallet deriveFromMnemonic(String mnemonic, long accountIndex) throws CannotDeriveKeysException {
        try {
            byte[] seed = mnemonicToBip39Seed(mnemonic);
            byte[] privateKey = bip39SeedToPrivateKey(seed, accountIndex);
            return new Wallet(privateKey);
        } catch (IOException error) {
            throw new Exceptions.CannotDeriveKeysException();
        }
    }

    private static byte[] mnemonicToBip39Seed(String mnemonic) {
        byte[] mnemonicBytes = mnemonic.getBytes(StandardCharsets.UTF_8);
        byte[] passphrase = BIP39_SALT_MODIFIER.getBytes(StandardCharsets.UTF_8);
        PKCS5S2ParametersGenerator generator = new PKCS5S2ParametersGenerator(new SHA512Digest());

        generator.init(mnemonicBytes, passphrase, BIP39_PBKDF2_ROUNDS);
        byte[] seed = ((KeyParameter) generator.generateDerivedParameters(512)).getKey();
        return seed;
    }

    private static byte[] bip39SeedToPrivateKey(byte[] seed, long accountIndex) throws IOException {
        KeyAndChainCode keyAndChainCode = bip39SeedToMasterKey(seed);
        byte[] key = keyAndChainCode.key;
        byte[] chainCode = keyAndChainCode.chainCode;

        long[] derivationPath = Arrays.copyOf(ELROND_DERIVATION_PATH, ELROND_DERIVATION_PATH.length);
        derivationPath[derivationPath.length - 1] = accountIndex;

        for (long segment : derivationPath) {
            keyAndChainCode = ckdPriv(key, chainCode, segment + HARDENED_OFFSET);
            key = keyAndChainCode.key;
            chainCode = keyAndChainCode.chainCode;
        }

        return key;
    }

    private static KeyAndChainCode bip39SeedToMasterKey(byte[] seed) {
        byte[] result = hmacSHA512(BIP32_SEED_MODIFIER.getBytes(StandardCharsets.UTF_8), seed);
        byte[] masterKey = Arrays.copyOfRange(result, 0, 32);
        byte[] chainCode = Arrays.copyOfRange(result, 32, 64);
        return new KeyAndChainCode(masterKey, chainCode);
    }

    private static class KeyAndChainCode {
        public final byte[] key;
        public final byte[] chainCode;

        public KeyAndChainCode(byte[] key, byte[] chainCode) {
            this.key = key;
            this.chainCode = chainCode;
        }
    }

    private static KeyAndChainCode ckdPriv(byte[] key, byte[] chainCode, long index) throws IOException {
        ByteBuffer indexBuffer = ByteBuffer.allocate(4);
        indexBuffer.order(ByteOrder.BIG_ENDIAN);
        indexBuffer.putInt((int) (index & 0xffffffffL));
        byte[] indexBytes = indexBuffer.array();

        ByteArrayOutputStream dataStream = new ByteArrayOutputStream();
        dataStream.write(new byte[] { 0 });
        dataStream.write(key);
        dataStream.write(indexBytes);
        byte[] data = dataStream.toByteArray();
        byte[] result = hmacSHA512(chainCode, data);

        return new KeyAndChainCode(Arrays.copyOfRange(result, 0, 32), Arrays.copyOfRange(result, 32, 64));
    }

    private static byte[] hmacSHA512(byte[] key, byte[] message) {
        byte[] result = new byte[64];

        HMac hmac = new HMac(new SHA512Digest());
        hmac.init(new KeyParameter(key));
        hmac.update(message, 0, message.length);
        hmac.doFinal(result, 0);
        return result;
    }

    public String sign(String data) {
        return this.sign(data.getBytes(StandardCharsets.UTF_8));
    }

    public String sign(byte[] data) {
        Ed25519Signer signer = this.createEd25519Signer();
        signer.update(data, 0, data.length);
        byte[] signature = signer.generateSignature();
        byte[] hex = Hex.encode(signature);
        return new String(hex);
    }

    private Ed25519Signer createEd25519Signer() {
        Ed25519PrivateKeyParameters parameters = new Ed25519PrivateKeyParameters(this.privateKey, 0);
        Ed25519Signer signer = new Ed25519Signer();
        signer.init(true, parameters);
        return signer;
    }

    public byte[] getPrivateKey() {
        return privateKey;
    }

    public byte[] getPublicKey() {
        return publicKey;
    }
}