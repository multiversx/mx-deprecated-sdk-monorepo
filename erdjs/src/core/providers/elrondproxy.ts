/*
GET    /address/:address            --> github.com/ElrondNetwork/elrond-proxy-go/api/address.GetAccount (5 handlers)
GET    /address/:address/balance    --> github.com/ElrondNetwork/elrond-proxy-go/api/address.GetBalance (5 handlers)
GET    /address/:address/nonce      --> github.com/ElrondNetwork/elrond-proxy-go/api/address.GetNonce (5 handlers)
POST   /transaction/send            --> github.com/ElrondNetwork/elrond-proxy-go/api/transaction.SendTransaction (5 handlers)
POST   /transaction/send-multiple   --> github.com/ElrondNetwork/elrond-proxy-go/api/transaction.SendMultipleTransactions (5 handlers)
POST   /transaction/send-user-funds --> github.com/ElrondNetwork/elrond-proxy-go/api/transaction.SendUserFunds (5 handlers)
POST   /transaction/cost            --> github.com/ElrondNetwork/elrond-proxy-go/api/transaction.RequestTransactionCost (5 handlers)
POST   /vm-values/hex               --> github.com/ElrondNetwork/elrond-proxy-go/api/vmValues.getHex (5 handlers)
POST   /vm-values/string            --> github.com/ElrondNetwork/elrond-proxy-go/api/vmValues.getString (5 handlers)
POST   /vm-values/int               --> github.com/ElrondNetwork/elrond-proxy-go/api/vmValues.getInt (5 handlers)
POST   /vm-values/query             --> github.com/ElrondNetwork/elrond-proxy-go/api/vmValues.executeQuery (5 handlers)
GET    /node/heartbeatstatus        --> github.com/ElrondNetwork/elrond-proxy-go/api/node.GetHeartbeatData (5 handlers)
GET    /node/status/:shard          --> github.com/ElrondNetwork/elrond-proxy-go/api/node.GetNodeStatus (5 handlers)
GET    /node/epoch/:shard           --> github.com/ElrondNetwork/elrond-proxy-go/api/node.GetEpochData (5 handlers)
GET    /validator/statistics        --> github.com/ElrondNetwork/elrond-proxy-go/api/validator.Statistics (5 handlers)
*/

import axios, { AxiosResponse } from "axios";
import { Account } from "../data/account";


export interface Provider {
    getAccount(address: string): Promise<Account>;
    getBalance(address: string): Promise<bigint>;
    getNonce(address: string): Promise<number>;
    getVMValueString(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueInt(address: string, funcName: string, args: string[]): Promise<bigint>;
    getVMValueHex(address: string, funcName: string, args: string[]): Promise<string>;
    getVMValueQuery(address: string, funcName: string, args: string[]): Promise<any>;
}

export class ElrondProxy implements Provider {
    private URL: string;
    private TimeoutLimit: number;

    constructor(config: any) {
        // TODO validate proper structure of url
        this.URL = config.url;
        this.TimeoutLimit = config.timeout;
    }

    getAccount(address: string): Promise<Account> {
        // TODO add error handling:
        //  * if the GET request fails
        //  * if the retrieved data cannot be set to an Account
        return axios.get(
            this.URL + `/address/${address}`,
            { timeout: this.TimeoutLimit }
        ).then(response => new Account(response.data.account));
    }

    getBalance(address: string): Promise<bigint> {
        // TODO add error handling:
        //  * if the GET request fails
        //  * if the retrieved data cannot be used as a bigint
        return axios.get(
            this.URL + `/address/${address}/balance`,
            { timeout: this.TimeoutLimit }
        ).then(response => BigInt(response.data.balance));
    }

    getNonce(address: string): Promise<number> {
        // TODO add error handling:
        //  * if the GET request fails
        //  * if the retrieved data is an invalid nonce
        return axios.get(
            this.URL + `/address/${address}/nonce`,
            { timeout: this.TimeoutLimit }
        ).then(response => response.data.nonce);
    }

    getVMValueString(address: string, funcName: string, args: string[]): Promise<string> {
        // TODO add error handling:
        //  * if the POST request fails
        let postBody = {
            "scAddress": address,
            "funcName": funcName,
            "args": args
        };
        return axios.post(
            this.URL + `/vm-values/string`,
            postBody,
            { timeout: this.TimeoutLimit }
        ).then(response => response.data.data);
    }

    getVMValueInt(address: string, funcName: string, args: string[]): Promise<bigint> {
        // TODO add error handling:
        //  * if the POST request fails
        let postBody = {
            "scAddress": address,
            "funcName": funcName,
            "args": args
        };
        return axios.post(
            this.URL + `/vm-values/int`,
            postBody,
            { timeout: this.TimeoutLimit }
        ).then(response => BigInt(response.data.data));
    }

    getVMValueHex(address: string, funcName: string, args: string[]): Promise<string> {
        // TODO add error handling:
        //  * if the POST request fails
        let postBody = {
            "scAddress": address,
            "funcName": funcName,
            "args": args
        };
        return axios.post(
            this.URL + `/vm-values/hex`,
            postBody,
            { timeout: this.TimeoutLimit }
        ).then(response => response.data.data);
    }

    getVMValueQuery(address: string, funcName: string, args: string[]): Promise<any> {
        // TODO add error handling:
        //  * if the POST request fails
        let postBody = {
            "scAddress": address,
            "funcName": funcName,
            "args": args
        };
        return axios.post(
            this.URL + `/vm-values/query`,
            postBody,
            { timeout: this.TimeoutLimit }
        ).then(response => response.data.data);
    }

}
