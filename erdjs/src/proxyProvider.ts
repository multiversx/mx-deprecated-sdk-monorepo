import axios from "axios";
import { IProvider } from "./interface";
import { Transaction, TransactionHash, TransactionOnNetwork, TransactionStatus } from "./transaction";
import { NetworkConfig } from "./networkConfig";
import { Address } from "./address";
import  * as errors from "./errors";
import { AccountOnNetwork } from "./account";
import { Query, QueryResponse } from "./smartcontracts/query";

export class ProxyProvider implements IProvider {
    private url: string;
    private timeoutLimit: number;

    constructor(url: string, timeout?: number) {
        this.url = url;
        this.timeoutLimit = timeout || 1000;
    }

    async getAccount(address: Address): Promise<AccountOnNetwork> {
        let response = await this.doGet(`address/${address.bech32()}`);
        let payload = response.account;
        return AccountOnNetwork.fromHttpResponse(payload);
    }

    /**
     * Queries a Smart Contract - runs a pure function defined by the contract and returns its results.
     */
    async queryContract(query: Query): Promise<QueryResponse> {
        let data = query.toHttpRequest();
        let response = await this.doPost("/vm-values/query", data);
        return QueryResponse.fromHttpResponse(response);
    }

    async sendTransaction(tx: Transaction): Promise<TransactionHash> {
        let response = await this.doPost("transaction/send", tx.toSendable());
        let txHash = response.txHash;
        return new TransactionHash(txHash);
    }

    async simulateTransaction(tx: Transaction): Promise<any> {
        let response = await this.doPost("transaction/simulate", tx.toSendable());
        return response;
    }

    async getTransaction(txHash: TransactionHash): Promise<TransactionOnNetwork> {
        let response = await this.doGet(`transaction/${txHash.toString()}`);
        let payload = response.transaction;
        return TransactionOnNetwork.fromHttpResponse(payload);
    }

    async getTransactionStatus(txHash: TransactionHash): Promise<TransactionStatus> {
        let response = await this.doGet(`transaction/${txHash.toString()}/status`);
        return new TransactionStatus(response.status);
    }

    async getNetworkConfig(): Promise<NetworkConfig> {
        let response = await this.doGet("network/config");
        let payload = response.config;
        return NetworkConfig.fromHttpResponse(payload);
    }

    private async doGet(resourceUrl: string): Promise<any> {
        try {
            let url = `${this.url}/${resourceUrl}`;
            let response = await axios.get(url, {timeout: this.timeoutLimit});
            let payload = response.data.data;
            return payload;
        } catch (error) {
            if (!error.response) {
                console.warn(error);
                throw new errors.ErrProxyProviderGet(resourceUrl, error.toString(), error);
            }

            let originalErrorMessage = error.response.data.error;
            throw new errors.ErrProxyProviderGet(resourceUrl, originalErrorMessage, error);
        }
    }

    private async doPost(resourceUrl: string, payload: any): Promise<any> {
        try {
            let url = `${this.url}/${resourceUrl}`;
            let json = JSON.stringify(payload);
            let response = await axios.post(url, json, {timeout: this.timeoutLimit});
            let responsePayload = response.data.data;
            return responsePayload;
        } catch (error) {
            if (!error.response) {
                console.warn(error);
                throw new errors.ErrProxyProviderPost(resourceUrl, error.toString(), error);
            }

            let originalErrorMessage = error.response.data.error || error.response.data;
            throw new errors.ErrProxyProviderPost(resourceUrl, originalErrorMessage, error);
        }
    }
}
