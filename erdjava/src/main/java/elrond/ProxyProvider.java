package elrond;

import java.io.IOException;
import java.math.BigInteger;

import com.google.gson.Gson;
import com.google.gson.annotations.SerializedName;

import elrond.Exceptions.AddressException;
import elrond.Exceptions.CannotSerializeTransactionException;
import elrond.Exceptions.ProxyRequestException;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;

public class ProxyProvider implements IProvider {
    private static final MediaType JSON = MediaType.get("application/json; charset=utf-8");
    private static final Gson gson = new Gson();

    private final String url;
    private final OkHttpClient httpClient;

    public ProxyProvider(String url) {
        this.url = url;
        this.httpClient = new OkHttpClient();
    }

    public NetworkConfig getNetworkConfig() throws IOException, ProxyRequestException {
        String responseJson = this.doGet("network/config");
        ResponseOfGetNetworkConfig typedResponse = gson.fromJson(responseJson, ResponseOfGetNetworkConfig.class);
        typedResponse.throwIfError();

        PayloadOfGetNetworkConfig payload = typedResponse.data.config;
        return NetworkConfig.fromProviderPayload(payload);
    }

    public AccountOnNetwork getAccount(Address address) throws IOException, AddressException, ProxyRequestException {
        String responseJson = this.doGet(String.format("address/%s", address.bech32()));
        ResponseOfGetAccount typedResponse = gson.fromJson(responseJson, ResponseOfGetAccount.class);
        typedResponse.throwIfError();

        PayloadOfGetAccount payload = typedResponse.data.account;
        return AccountOnNetwork.fromProviderPayload(payload);
    }

    public String sendTransaction(Transaction transaction) throws IOException, CannotSerializeTransactionException,
            ProxyRequestException {
        String requestJson = transaction.serialize();
        String responseJson = this.doPost("transaction/send", requestJson);
        ResponseOfSendTransaction typedResponse = gson.fromJson(responseJson, ResponseOfSendTransaction.class);
        typedResponse.throwIfError();
        
        PayloadOfSendTransactionResponse payload = typedResponse.data;
        return payload.txHash;
    }

    private String doGet(String resourceUrl) throws IOException {
        String getUrl = String.format("%s/%s", this.url, resourceUrl);
        Request request = new Request.Builder().url(getUrl).build();

        try (Response response = this.httpClient.newCall(request).execute()) {
            String responseJson = response.body().string();
            return responseJson;
        }
    }

    private String doPost(String resourceUrl, String json) throws IOException {
        String postUrl = String.format("%s/%s", this.url, resourceUrl);
        RequestBody body = RequestBody.create(JSON, json);
        Request request = new Request.Builder().url(postUrl).post(body).build();

        try (Response response = this.httpClient.newCall(request).execute()) {
            String responseJson = response.body().string();
            return responseJson;
        }
    }

    public static class ResponseBase<T> {
        @SerializedName(value = "data")
        public T data;

        @SerializedName(value = "error")
        public String error;

        @SerializedName(value = "code")
        public String code;

        public void throwIfError() throws ProxyRequestException {
            if (this.error != null && !this.error.isEmpty()) {
                throw new ProxyRequestException(this.error);
            }

            if (!"successful".equals(this.code)) {
                throw new ProxyRequestException(this.code);
            }
        }
    }

    public static class ResponseOfGetNetworkConfig extends ResponseBase<WrapperOfGetNetworkConfig> {}

    public static class WrapperOfGetNetworkConfig {
        @SerializedName(value = "config")
        public PayloadOfGetNetworkConfig config;
    }

    public static class PayloadOfGetNetworkConfig {
        @SerializedName(value = "erd_chain_id")
        public String chainID;

        @SerializedName(value = "erd_gas_per_data_byte")
        public int gasPerDataByte;

        @SerializedName(value = "erd_min_gas_limit")
        public long minGasLimit;

        @SerializedName(value = "erd_min_gas_price")
        public long minGasPrice;

        @SerializedName(value = "erd_min_transaction_version")
        public int minTransactionVersion;
    }

    public static class ResponseOfGetAccount extends ResponseBase<WrapperOfGetAccount> {}

    public static class WrapperOfGetAccount {
        @SerializedName(value = "account")
        public PayloadOfGetAccount account;
    }

    public static class PayloadOfGetAccount {
        @SerializedName(value = "nonce")
        public long nonce;

        @SerializedName(value = "balance")
        public BigInteger balance;
    }

    public static class ResponseOfSendTransaction extends ResponseBase<PayloadOfSendTransactionResponse> {}

    public static class PayloadOfSendTransactionResponse {
        @SerializedName(value = "txHash")
        public String txHash;
    }
}
