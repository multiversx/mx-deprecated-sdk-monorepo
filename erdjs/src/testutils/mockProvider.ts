
import { IProvider } from "../interface";
import { Transaction, TransactionHash, TransactionOnNetwork, TransactionStatus } from "../transaction";
import { NetworkConfig } from "../networkConfig";
import { Address } from "../address";
import { Nonce } from "../nonce";
import { AsyncTimer } from "../asyncTimer";
import { AccountOnNetwork } from "../account";
import { Balance } from "../balance";
import * as errors from "../errors";
import { Query } from "../smartcontracts/query";
import { QueryResponse } from "../smartcontracts/queryResponse";

/**
 * A mock {@link IProvider}, used for tests only.
 */
export class MockProvider implements IProvider {
    static AddressOfAlice = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
    static AddressOfBob = new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx");
    static AddressOfCarol = new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8");

    private readonly accounts: Map<string, AccountOnNetwork>;
    private readonly transactions: Map<string, TransactionOnNetwork>;
    private readonly queryResponders: QueryResponder[] = [];

    constructor() {
        this.accounts = new Map<string, AccountOnNetwork>();
        this.transactions = new Map<string, TransactionOnNetwork>();

        this.accounts.set(MockProvider.AddressOfAlice.bech32(), new AccountOnNetwork({ nonce: new Nonce(0), balance: Balance.eGLD(1000) }));
        this.accounts.set(MockProvider.AddressOfBob.bech32(), new AccountOnNetwork({ nonce: new Nonce(5), balance: Balance.eGLD(500) }));
        this.accounts.set(MockProvider.AddressOfCarol.bech32(), new AccountOnNetwork({ nonce: new Nonce(42), balance: Balance.eGLD(300) }));
    }

    mockUpdateAccount(address: Address, mutate: (item: AccountOnNetwork) => void) {
        let account = this.accounts.get(address.bech32());
        if (account) {
            mutate(account);
        }
    }

    mockUpdateTransaction(hash: TransactionHash, mutate: (item: TransactionOnNetwork) => void) {
        let transaction = this.transactions.get(hash.toString());
        if (transaction) {
            mutate(transaction);
        }
    }

    mockPutTransaction(hash: TransactionHash, item: TransactionOnNetwork) {
        this.transactions.set(hash.toString(), item);
    }

    mockQueryResponseOnFunction(functionName: string, response: QueryResponse) {
        let predicate = (query: Query) => query.func.name == functionName;
        this.queryResponders.push(new QueryResponder(predicate, response));
    }

    mockQueryResponse(predicate: (query: Query) => boolean, response: QueryResponse) {
        this.queryResponders.push(new QueryResponder(predicate, response));
    }

    async mockTransactionTimeline(transactionOrHash: Transaction | TransactionHash, timelinePoints: any[]): Promise<void> {
        let hash = transactionOrHash instanceof TransactionHash ? transactionOrHash : transactionOrHash.hash;
        let timeline = new AsyncTimer(`mock timeline of ${hash}`);

        await timeline.start(0);

        for (const point of timelinePoints) {
            if (point instanceof TransactionStatus) {
                this.mockUpdateTransaction(hash, transaction => {
                    transaction.status = point;
                });
            } else if (point instanceof Wait) {
                await timeline.start(point.milliseconds);
            }
        }
    }

    async getAccount(address: Address): Promise<AccountOnNetwork> {
        let account = this.accounts.get(address.bech32());
        if (account) {
            return account;
        }

        return new AccountOnNetwork();
    }

    async sendTransaction(transaction: Transaction): Promise<TransactionHash> {
        this.mockPutTransaction(transaction.hash, new TransactionOnNetwork({
            nonce: transaction.nonce,
            sender: transaction.sender,
            receiver: transaction.receiver,
            data: transaction.data,
            status: new TransactionStatus("pending")
        }));

        return transaction.hash;
    }

    async simulateTransaction(_transaction: Transaction): Promise<any> {
        return {};
    }

    async getTransaction(txHash: TransactionHash): Promise<TransactionOnNetwork> {
        let transaction = this.transactions.get(txHash.toString());
        if (transaction) {
            return transaction;
        }

        throw new errors.ErrMock("Transaction not found");
    }

    async getTransactionStatus(txHash: TransactionHash): Promise<TransactionStatus> {
        let transaction = this.transactions.get(txHash.toString());
        if (transaction) {
            return transaction.status;
        }

        throw new errors.ErrMock("Transaction not found");
    }

    async getNetworkConfig(): Promise<NetworkConfig> {
        return new NetworkConfig();
    }

    async queryContract(query: Query): Promise<QueryResponse> {
        for (const responder of this.queryResponders) {
            if (responder.matches(query)) {
                return responder.response;
            }
        }

        return new QueryResponse();
    }
}

export class Wait {
    readonly milliseconds: number;

    constructor(milliseconds: number) {
        this.milliseconds = milliseconds;
    }
}

class QueryResponder {
    readonly matches: (query: Query) => boolean;
    readonly response: QueryResponse;

    constructor(matches: (query: Query) => boolean, response: QueryResponse) {
        this.matches = matches || (_ => true);
        this.response = response || new QueryResponse();
    }
}
