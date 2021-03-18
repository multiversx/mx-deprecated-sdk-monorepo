import { IProvider } from "./interface";

/**
 * An object holding network status configuration parameters.
 */
export class NetworkStatus {
    private static default: NetworkStatus;

    /**
     * The current round.
     */
    public CurrentRound: number;

    /**
     * The epoch number.
     */
    public EpochNumber: number;

    /**
     * The Highest final nonce.
     */
    public HighestFinalNonce: number;

    /**
     * The erd nonce.
     */
    public Nonce: number;

    /**
     * The nonce at epoch start.
     */
    public NonceAtEpochStart: number;

    /**
     * The nonces passed in current epoch.
     */
    public NoncesPassedInCurrentEpoch: number;

    /**
     * The round at epoch start
     */
    public RoundAtEpochStart: number;

    /**
     * The rounds passed in current epoch
     */
    public RoundsPassedInCurrentEpoch: number;

    /**
     * The rounds per epoch
     */
    public RoundsPerEpoch: number;

    constructor() {
        this.CurrentRound = 0;
        this.EpochNumber = 0;
        this.HighestFinalNonce = 0;
        this.Nonce = 0;
        this.NonceAtEpochStart = 0;
        this.NoncesPassedInCurrentEpoch = 0;
        this.RoundAtEpochStart = 0;
        this.RoundsPassedInCurrentEpoch = 0;
        this.RoundsPerEpoch = 0;
    }

    /**
     * Gets the default network status object (think of the Singleton pattern).
     */
    static getDefault(): NetworkStatus {
        if (!NetworkStatus.default) {
            NetworkStatus.default = new NetworkStatus();
        }

        return NetworkStatus.default;
    }

    /**
     * Synchronizes a configuration object by querying the node, through a {@link IProvider}.
     * @param provider The provider to use
     */
    async sync(provider: IProvider): Promise<void> {
        let fresh: NetworkStatus = await provider.getNetworkStatus();
        Object.assign(this, fresh);
    }

    /**
     * Constructs a configuration object from a HTTP response (as returned by the provider).
     */
    static fromHttpResponse(payload: any): NetworkStatus {
        let networkStatus = new NetworkStatus();

        networkStatus.CurrentRound = Number(payload["erd_current_round"]);
        networkStatus.EpochNumber = Number(payload["erd_epoch_number"]);
        networkStatus.HighestFinalNonce = Number(payload["erd_highest_final_nonce"]);
        networkStatus.Nonce = Number(payload["erd_nonce"]);
        networkStatus.NonceAtEpochStart = Number(payload["erd_nonce_at_epoch_start"]);
        networkStatus.NoncesPassedInCurrentEpoch = Number(payload["erd_nonces_passed_in_current_epoch"]);
        networkStatus.RoundAtEpochStart = Number(payload["erd_round_at_epoch_start"]);
        networkStatus.RoundsPassedInCurrentEpoch = Number(payload["erd_rounds_passed_in_current_epoch"]);
        networkStatus.RoundsPerEpoch = Number(payload["erd_rounds_per_epoch"]);

        return networkStatus;
    }
}
