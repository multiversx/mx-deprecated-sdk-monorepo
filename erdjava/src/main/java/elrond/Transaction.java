package elrond;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import com.google.gson.Gson;

import org.bouncycastle.util.encoders.Base64;

public class Transaction {
    public static final int VERSION = 1;

    private long nonce;
    private BigInteger value;
    private String sender;
    private String receiver;
    private long gasPrice;
    private long gasLimit;
    private String data = "";
    private String chainID;
    private String signature = "";

    public String serialize() {
        Map<String, Object> map = this.toMap();
        Gson gson = new Gson();
        String json = gson.toJson(map);
        return json;
    }

    public Map<String, Object> toMap() {
        Map<String, Object> map = new LinkedHashMap<String, Object>();

        map.put("nonce", this.nonce);
        map.put("value", this.value.toString(10));
        map.put("receiver", this.receiver);
        map.put("sender", this.sender);
        map.put("gasPrice", this.gasPrice);
        map.put("gasLimit", this.gasLimit);

        if (this.data.length() > 0) {
            map.put("data", this.getDataEncoded());
        }

        map.put("chainID", this.chainID);
        map.put("version", VERSION);

        if (this.signature.length() > 0) {
            map.put("signature", this.signature);
        }

        return map;
    }

    public void sign(Signer signer) {
        String serialized = this.serialize();
        this.signature = signer.sign(serialized);
    }

    public void setNonce(long nonce) {
        this.nonce = nonce;
    }

    public long getNonce() {
        return nonce;
    }

    public void setValue(BigInteger value) {
        this.value = value;
    }

    public BigInteger getValue() {
        return value;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getSender() {
        return sender;
    }

    public void setReceiver(String receiver) {
        this.receiver = receiver;
    }

    public String getReceiver() {
        return receiver;
    }

    public void setGasPrice(long gasPrice) {
        this.gasPrice = gasPrice;
    }

    public long getGasPrice() {
        return gasPrice;
    }

    public void setGasLimit(long gasLimit) {
        this.gasLimit = gasLimit;
    }

    public long getGasLimit() {
        return gasLimit;
    }

    public void setData(String data) {
        this.data = data;
    }

    public String getData() {
        return data;
    }

    public String getDataEncoded() {
        byte[] dataAsBytes = this.data.getBytes(StandardCharsets.UTF_8);
        byte[] encodedAsBytes = Base64.encode(dataAsBytes);
        return new String(encodedAsBytes);
    }

    public void setChainID(String chainID) {
        this.chainID = chainID;
    }

    public String getChainID() {
        return chainID;
    }

    public String getSignature() {
        return signature;
    }
}
