import axios from "axios";
import { IApiProvider } from "./interface";
import * as errors from "./errors";
import { Logger } from "./logger";
import { NetworkStake } from "./networkStake";
const JSONbig = require("json-bigint");

/*
 * This is a temporary change, this will be the only provider used, ProxyProvider will be deprecated
 */
export class ApiProvider implements IApiProvider {
  private url: string;
  private timeoutLimit: number;

  /**
   * Creates a new ApiProvider.
   * @param url the URL of the Elrond Api
   * @param timeout the timeout for any request-response, in milliseconds
   */
  constructor(url: string, timeout?: number) {
    this.url = url;
    this.timeoutLimit = timeout || 1000;
  }

  /**
   * Fetches the Network Stake.
   */
  async getNetworkStake(): Promise<NetworkStake> {
    let response = await this.doGet(`stake`);
    let payload = response;
    console.log("Netwoork Stake,  ", payload);
    return NetworkStake.fromHttpResponse(payload);
  }

  private async doGet(resourceUrl: string): Promise<any> {
    try {
      let url = `${this.url}/${resourceUrl}`;
      console.log("url ", url);
      let response = await axios.get(url, { timeout: this.timeoutLimit });
      let payload = response.data;

      return payload;
    } catch (error) {
      if (!error.response) {
        Logger.warn(error);
        throw new errors.ErrApiProviderGet(
          resourceUrl,
          error.toString(),
          error
        );
      }

      let errorData = error.response.data;
      let originalErrorMessage =
        errorData.error || errorData.message || JSON.stringify(errorData);
      throw new errors.ErrApiProviderGet(
        resourceUrl,
        originalErrorMessage,
        error
      );
    }
  }
}

// See: https://github.com/axios/axios/issues/983
axios.defaults.transformResponse = [
  function(data) {
    return JSONbig.parse(data);
  },
];
