import { IApiProvider } from "./interface";

/**
 * An object holding Network stats parameters.
 */
export class Stats {
    private static default: Stats;

    /**
     * The number of Shards.
     */
    public Shards: number;

    /**
     * The Number of Blocks.
     */
    public Blocks: number;
    /**
     * The Number of Accounts.
     */
    public Accounts: number;
    /**
     * The Number of transactions.
     */
    public Transactions: number;
    /**
     * The Refresh rate.
     */
    public RefreshRate: number;
    /**
     * The Number of the current Epoch.
     */
    public Epoch: number;
    /**
     * The Number of rounds passed.
     */
    public RoundsPassed: number;
    /**
     * The Number of Rounds per epoch.
     */
    public RoundsPerEpoch: number;

    constructor() {
        this.Shards = 0;
        this.Blocks = 0;
        this.Accounts = 0;
        this.Transactions = 0;
        this.RefreshRate = 0;
        this.Epoch = 0;
        this.RoundsPassed = 0;
        this.RoundsPerEpoch = 0;
    }

    /**
     * Synchronizes a stats object by querying the Network, through a {@link IProvider}.
     * @param provider The provider to use
     */
    async sync(provider: IApiProvider): Promise<void> {
        let fresh: Stats = await provider.getNetworkStats();
        Object.assign(this, fresh);
    }

    /**
     * Constructs a stats object from a HTTP response (as returned by the provider).
     */
    static fromHttpResponse(payload: any): Stats {
        let stats = new Stats();

        stats.Shards = Number(payload["shards"]);
        stats.Blocks = Number(payload["blocks"]);
        stats.Accounts = Number(payload["accounts"]);
        stats.Transactions = Number(payload["transactions"]);
        stats.RefreshRate = Number(payload["refreshRate"]);
        stats.Epoch = Number(payload["epoch"]);
        stats.RoundsPassed = Number(payload["roundsPassed"]);
        stats.RoundsPerEpoch = Number(payload["roundsPerEpoch"]);

        return stats;
    }
}
