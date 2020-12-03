import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "../address";
import { ContractFunction } from "./function";
import { describeOnlyIf, getMainnetProvider } from "../testutils";
import { SmartContract } from "./smartContract";
import * as errors from "../errors";
import { Argument } from "./argument";

describeOnlyIf("mainnet")("test queries on mainnet", function () {
    let provider = getMainnetProvider();
    let delegationContract = new SmartContract({ address: new Address("erd1qqqqqqqqqqqqqpgqxwakt2g7u9atsnr03gqcgmhcv38pt7mkd94q6shuwt") });

    it("delegation: should getTotalStakeByType", async () => {
        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getTotalStakeByType")
        });

        assert.isTrue(response.isSuccess());
        assert.lengthOf(response.returnData, 5);
    });

    it("delegation: should getNumUsers", async () => {
        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getNumUsers")
        });

        assert.isTrue(response.isSuccess());
        assert.lengthOf(response.returnData, 1);
        assert.isAtLeast(response.firstResult().asNumber, 5000);
        assert.isAtLeast(response.gasUsed.valueOf(), 25000000);
        assert.isAtMost(response.gasUsed.valueOf(), 35000000);
    });

    it("delegation: should getFullWaitingList", async () => {
        this.timeout(5000);

        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getFullWaitingList")
        });

        assert.isTrue(response.isSuccess());
        assert.isAtLeast(response.returnData.length, 20000);
    });

    it("delegation: should getClaimableRewards", async () => {
        this.timeout(5000);

        // First, expect an error (bad arguments):
        try {
            await delegationContract.runQuery(provider, {
                func: new ContractFunction("getClaimableRewards")
            });

            throw new errors.ErrTest("unexpected");
        } catch (err) {
            assert.instanceOf(err, errors.ErrContractQuery);
            assert.include(err.toString(), "wrong number of arguments");
        }

        // Then do a successful query:
        let response = await delegationContract.runQuery(provider, {
            func: new ContractFunction("getClaimableRewards"),
            args: [Argument.fromPubkey(new Address("erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th"))]
        });

        assert.isTrue(response.isSuccess());
        assert.isAtLeast(response.returnData.length, 1);
    });
});
