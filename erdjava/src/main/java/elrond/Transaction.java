package elrond;

import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;

import com.google.gson.Gson;

import org.bouncycastle.util.encoders.Base64;

import elrond.Exceptions.ErrAddress;
import elrond.Exceptions.ErrCannotSerializeTransaction;
import elrond.Exceptions.ErrCannotSignTransaction;
import elrond.Exceptions.ErrProxyRequest;

public class Transaction {
    public static final int VERSION = 1;

    private long nonce;
    private BigInteger value;
    private Address sender;
    private Address receiver;
    private long gasPrice;
    private long gasLimit;
    private String data;
    private String chainID;
    private String signature;
    private String txHash;

    public Transaction() {
        this.value = BigInteger.valueOf(0);
        this.sender = Address.createEmptyAddress();
        this.receiver = Address.createEmptyAddress();
        this.data = "";
        this.gasPrice = NetworkConfig.getDefault().getMinGasPrice();
        this.gasLimit = NetworkConfig.getDefault().getMinGasLimit();
        this.chainID = NetworkConfig.getDefault().getChainID();
        this.signature = "";
        this.txHash = "";
    }

    public String serialize() throws ErrCannotSerializeTransaction {
        try {
            Map<String, Object> map = this.toMap();
            Gson gson = new Gson();
            String json = gson.toJson(map);
            return json;
        } catch (ErrAddress error) {
            throw new ErrCannotSerializeTransaction();
        }
    }

    private Map<String, Object> toMap() throws ErrAddress {
        Map<String, Object> map = new LinkedHashMap<>();

        map.put("nonce", this.nonce);
        map.put("value", this.value.toString(10));
        map.put("receiver", this.receiver.bech32());
        map.put("sender", this.sender.bech32());
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

    public void sign(Wallet wallet) throws ErrCannotSignTransaction {
        try {
            String serialized = this.serialize();
            this.signature = wallet.sign(serialized);
        } catch (ErrCannotSerializeTransaction error) {
            throw new ErrCannotSignTransaction();
        }
    }

    public void send(IProvider provider) throws ErrCannotSerializeTransaction, IOException, ErrProxyRequest {
        this.txHash = provider.sendTransaction(this);
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

    public void setSender(Address sender) {
        this.sender = sender;
    }

    public Address getSender() {
        return sender;
    }

    public void setReceiver(Address receiver) {
        this.receiver = receiver;
    }

    public Address getReceiver() {
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

    public String getTxHash() {
        return txHash;
    }
}
