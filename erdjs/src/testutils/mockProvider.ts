import { IProvider } from "../interface";
import { Transaction, TransactionHash, TransactionStatus } from "../transaction";
import { TransactionOnNetwork } from "../transactionOnNetwork";
import { NetworkConfig } from "../networkConfig";
import { Address } from "../address";
import { Nonce } from "../nonce";
import { AsyncTimer } from "../asyncTimer";
import { AccountOnNetwork } from "../account";
import { Balance } from "../balance";
import * as errors from "../errors";
import { Query } from "../smartcontracts/query";
import { QueryResponse } from "../smartcontracts/queryResponse";
import { Hash } from "../hash";
import { NetworkStatus } from "../networkStatus";
import { TypedEvent } from "../events";

/**
 * A mock {@link IProvider}, used for tests only.
 */
export class MockProvider implements IProvider {
    static AddressOfAlice = new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th");
    static AddressOfBob = new Address("erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx");
    static AddressOfCarol = new Address("erd1k2s324ww2g0yj38qn2ch2jwctdy8mnfxep94q9arncc6xecg3xaq6mjse8");

    private readonly transactions: Map<string, TransactionOnNetwork>;
    private readonly onTransactionSent: TypedEvent<{ transaction: Transaction }>;
    private readonly accounts: Map<string, AccountOnNetwork>;
    private readonly queryResponders: QueryResponder[] = [];

    constructor() {
        this.transactions = new Map<string, TransactionOnNetwork>();
        this.onTransactionSent = new TypedEvent();
        this.accounts = new Map<string, AccountOnNetwork>();

        this.accounts.set(
            MockProvider.AddressOfAlice.bech32(),
            new AccountOnNetwork({ nonce: new Nonce(0), balance: Balance.egld(1000) })
        );
        this.accounts.set(
            MockProvider.AddressOfBob.bech32(),
            new AccountOnNetwork({ nonce: new Nonce(5), balance: Balance.egld(500) })
        );
        this.accounts.set(
            MockProvider.AddressOfCarol.bech32(),
            new AccountOnNetwork({ nonce: new Nonce(42), balance: Balance.egld(300) })
        );
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

    async mockTransactionTimeline(transaction: Transaction, timelinePoints: any[]): Promise<void> {
        await transaction.awaitHashed();
        return this.mockTransactionTimelineByHash(transaction.getHash(), timelinePoints);
    }

    async mockNextTransactionTimeline(timelinePoints: any[]): Promise<void> {
        let transaction = await this.nextTransactionSent();
        return this.mockTransactionTimelineByHash(transaction.getHash(), timelinePoints);
    }

    async nextTransactionSent(): Promise<Transaction> {
        return new Promise<Transaction>((resolve, _reject) => {
            this.onTransactionSent.on((eventArgs) => resolve(eventArgs.transaction));
        });
    }

    async mockTransactionTimelineByHash(hash: TransactionHash, timelinePoints: any[]): Promise<void> {
        let timeline = new AsyncTimer(`mock timeline of ${hash}`);

        await timeline.start(0);

        for (const point of timelinePoints) {
            if (point instanceof TransactionStatus) {
                this.mockUpdateTransaction(hash, (transaction) => {
                    transaction.status = point;
                });
            } else if (point instanceof MarkNotarized) {
                this.mockUpdateTransaction(hash, transaction => {
                    transaction.hyperblockNonce = new Nonce(42);
                    transaction.hyperblockHash = new Hash("a".repeat(32));
                });
            } else if (point instanceof AddImmediateResult) {
                this.mockUpdateTransaction(hash, transaction => {
                    transaction.getSmartContractResults().getImmediate().data = point.data;
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
        this.mockPutTransaction(
            transaction.getHash(),
            new TransactionOnNetwork({
                nonce: transaction.getNonce(),
                sender: transaction.getSender(),
                receiver: transaction.getReceiver(),
                data: transaction.getData(),
                status: new TransactionStatus("pending")
            })
        );

        this.onTransactionSent.emit({ transaction: transaction });

        return transaction.getHash();
    }

    async simulateTransaction(_transaction: Transaction): Promise<any> {
        return {};
    }

    async getTransaction(txHash: TransactionHash, _hintSender?: Address, _withResults?: boolean): Promise<TransactionOnNetwork> {
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

    async getNetworkStatus(): Promise<NetworkStatus> {
        return new NetworkStatus();
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

export class MarkNotarized {
}

export class AddImmediateResult {
    readonly data: string;

    constructor(data: string) {
        this.data = data;
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
