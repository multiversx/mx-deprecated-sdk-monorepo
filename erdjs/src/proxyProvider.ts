import axios from "axios";
import { IProvider } from "./interface";
import { Transaction, TransactionHash, TransactionStatus } from "./transaction";
import { NetworkConfig } from "./networkConfig";
import { Address } from "./address";
import * as errors from "./errors";
import { AccountOnNetwork } from "./account";
import { Query } from "./smartcontracts/query";
import { QueryResponse } from "./smartcontracts/queryResponse";
import { Logger } from "./logger";
import { NetworkStatus } from "./networkStatus";
import { TransactionOnNetwork } from "./transactionOnNetwork";
const JSONbig = require("json-bigint");

/**
 * This will be deprecated once all the endpoints move to ApiProvider
 */
export class ProxyProvider implements IProvider {
    private url: string;
    private timeoutLimit: number;

    /**
     * Creates a new ProxyProvider.
     * @param url the URL of the Elrond Proxy
     * @param timeout the timeout for any request-response, in milliseconds
     */
    constructor(url: string, timeout?: number) {
        this.url = url;
        this.timeoutLimit = timeout || 1000;
    }

    /**
     * Fetches the state of an {@link Account}.
     */
    async getAccount(address: Address): Promise<AccountOnNetwork> {
        let response = await this.doGet(`address/${address.bech32()}`);
        let payload = response.account;
        return AccountOnNetwork.fromHttpResponse(payload);
    }

    /**
     * Queries a Smart Contract - runs a pure function defined by the contract and returns its results.
     */
    async queryContract(query: Query): Promise<QueryResponse> {
        try {
            let data = query.toHttpRequest();
            let response = await this.doPost("vm-values/query", data);
            let payload = response.data || response.vmOutput;
            return QueryResponse.fromHttpResponse(payload);
        } catch (err) {
            throw errors.ErrContractQuery.increaseSpecificity(err);
        }
    }

    /**
     * Broadcasts an already-signed {@link Transaction}.
     */
    async sendTransaction(tx: Transaction): Promise<TransactionHash> {
        let response = await this.doPost("transaction/send", tx.toSendable());
        let txHash = response.txHash;
        return new TransactionHash(txHash);
    }

    /**
     * Simulates the processing of an already-signed {@link Transaction}.
     */
    async simulateTransaction(tx: Transaction): Promise<any> {
        let response = await this.doPost("transaction/simulate", tx.toSendable());
        return response;
    }

    /**
     * Fetches the state of a {@link Transaction}.
     */
    async getTransaction(txHash: TransactionHash, hintSender?: Address, withResults?: boolean): Promise<TransactionOnNetwork> {
        let url = this.buildUrlWithQueryParameters(`transaction/${txHash.toString()}`, {
            "withSender": hintSender ? hintSender.bech32() : "",
            "withResults": withResults ? "true" : ""
        });

        let { transaction } = await this.doGet(url);
        return TransactionOnNetwork.fromHttpResponse(transaction);
    }

    /**
     * Queries the status of a {@link Transaction}.
     */
    async getTransactionStatus(txHash: TransactionHash): Promise<TransactionStatus> {
        let response = await this.doGet(`transaction/${txHash.toString()}/status`);
        return new TransactionStatus(response.status);
    }

    /**
     * Fetches the Network configuration.
     */
    async getNetworkConfig(): Promise<NetworkConfig> {
        let response = await this.doGet("network/config");
        let payload = response.config;
        return NetworkConfig.fromHttpResponse(payload);
    }

    /**
     * Fetches the network status configuration.
     */
    async getNetworkStatus(): Promise<NetworkStatus> {
        let response = await this.doGet("network/status/4294967295");
        let payload = response.status;
        return NetworkStatus.fromHttpResponse(payload);
    }

    private async doGet(resourceUrl: string): Promise<any> {
        try {
            let url = `${this.url}/${resourceUrl}`;
            let response = await axios.get(url, { timeout: this.timeoutLimit });
            let payload = response.data.data;
            return payload;
        } catch (error) {
            if (!error.response) {
                Logger.warn(error);
                throw new errors.ErrApiProviderGet(resourceUrl, error.toString(), error);
            }

            let errorData = error.response.data;
            let originalErrorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
            throw new errors.ErrApiProviderGet(resourceUrl, originalErrorMessage, error);
        }
    }

    private async doPost(resourceUrl: string, payload: any): Promise<any> {
        try {
            let url = `${this.url}/${resourceUrl}`;
            let response = await axios.post(url, payload, {
                timeout: this.timeoutLimit,
                headers: {
                    "Content-Type": "application/json",
                },
            });
            let responsePayload = response.data.data;
            return responsePayload;
        } catch (error) {
            if (!error.response) {
                Logger.warn(error);
                throw new errors.ErrApiProviderPost(resourceUrl, error.toString(), error);
            }

            let errorData = error.response.data;
            let originalErrorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
            throw new errors.ErrApiProviderPost(resourceUrl, originalErrorMessage, error);
        }
    }

    private buildUrlWithQueryParameters(endpoint: string, params: Record<string, string>): string {
        let searchParams = new URLSearchParams();

        for (let [key, value] of Object.entries(params)) {
            if (value) {
                searchParams.append(key, value);
            }
        }

        return `${endpoint}?${searchParams.toString()}`;
    }
}

// See: https://github.com/axios/axios/issues/983
axios.defaults.transformResponse = [
    function (data) {
        return JSONbig.parse(data);
    },
];
