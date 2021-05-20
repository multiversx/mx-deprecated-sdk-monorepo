import { loadAndSyncTestWallets, MockProvider, setupUnitTestWatcherTimeouts, TestWallet } from "../../testutils";
import { Address } from "../../address";
import { assert } from "chai";
import { Egld, NonFungibleToken } from "../../balance";
import { ContractWrapper } from "./contractWrapper";

describe("test smart contract wrapper", async function () {
    let dummyAddress = new Address("erd1qqqqqqqqqqqqqpgqak8zt22wl2ph4tswtyc39namqx6ysa2sd8ss4xmlj3");
    let provider = new MockProvider();
    let alice: TestWallet;
    let market: ContractWrapper;
    before(async function () {
        ({ alice } = await loadAndSyncTestWallets(provider));
        market = await ContractWrapper.loadAbi(provider, "src/testdata/esdt-nft-marketplace.abi.json", null);
        market.address(dummyAddress).sender(alice).gas(500_000);
    });

    it("calling ", async function () {
        setupUnitTestWatcherTimeouts();

        let minBid = 100;
        let maxBid = 500;
        let deadline = 1_000_000;
        let acceptedToken = "TEST-1234";
        let acceptedTokenNonce = 5_000;

        let egldCallBuffers = market.value(Egld(0.5)).format.auctionToken(minBid, maxBid, deadline, acceptedToken, acceptedTokenNonce).toCallBuffers();
        assert.deepEqual(callBuffersToStrings(egldCallBuffers), ["auctionToken", "64", "01f4", "0f4240", "544553542d31323334", "1388"]);

        let MyNFT = NonFungibleToken("TEST-1234", 18);
        let nonFungibleCallBuffers = market.value(MyNFT(1000)).format.auctionToken(minBid, maxBid, deadline, acceptedToken, acceptedTokenNonce).toCallBuffers();
        assert.deepEqual(callBuffersToStrings(nonFungibleCallBuffers), [
            "ESDTNFTTransfer",
            "544553542d31323334",
            "03e8",
            "01",
            "00000000000000000500ed8e25a94efa837aae0e593112cfbb01b448755069e1",
            "61756374696f6e546f6b656e",
            "64",
            "01f4",
            "0f4240",
            "544553542d31323334",
            "1388"
        ]);
    });

});

function callBuffersToStrings(values: Buffer[]): string[] {
    let [func, ...args] = values;
    return [func.toString(), ...argBuffersToStrings(args)];
}

function argBuffersToStrings(values: Buffer[]): string[] {
    return values.map(buffer => buffer.toString("hex"));
}
