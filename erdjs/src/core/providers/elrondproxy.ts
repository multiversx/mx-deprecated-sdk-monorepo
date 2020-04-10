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

import fetch, {
    Blob,
    Headers,
    Request,
    RequestInit,
    Response,
    FetchError
} from "node-fetch";

var address: string = "616fdac6b0d17053d077454ef3d5a563cb25ecdbbc4894a73806c3a39079b82a";


