import { IApiProvider } from "./interface";
import BigNumber from "bignumber.js";

/**
 * An object holding Network stake parameters.
 */
export class NetworkStake {
  private static default: NetworkStake;

  /**
   * The Total Validators Number.
   */
  public TotalValidators: number;

  /**
   * The Active Validators Number.
   */
  public ActiveValidators: number;
  /**
   * The Queue Size.
   */
  public QueueSize: number;
  /**
   * The Total Validators Number.
   */
  public TotalStaked: BigNumber;

  constructor() {
    this.TotalValidators = 0;
    this.ActiveValidators = 0;
    this.QueueSize = 0;
    this.TotalStaked = new BigNumber(0);
  }

  /**
   * Gets the default configuration object (think of the Singleton pattern).
   */
  static getDefault(): NetworkStake {
    if (!NetworkStake.default) {
      NetworkStake.default = new NetworkStake();
    }

    return NetworkStake.default;
  }

  /**
   * Synchronizes a configuration object by querying the Network, through a {@link IProvider}.
   * @param provider The provider to use
   */
  async sync(provider: IApiProvider): Promise<void> {
    let fresh: NetworkStake = await provider.getNetworkStake();
    Object.assign(this, fresh);
  }

  /**
   * Constructs a configuration object from a HTTP response (as returned by the provider).
   */
  static fromHttpResponse(payload: any): NetworkStake {
    let networkStake = new NetworkStake();

    networkStake.TotalValidators = Number(payload["totalValidators"]);
    networkStake.ActiveValidators = Number(payload["activeValidators"]);
    networkStake.QueueSize = Number(payload["queueSize"]);
    networkStake.TotalStaked = new BigNumber(payload["totalStaked"]);

    return networkStake;
  }
}
