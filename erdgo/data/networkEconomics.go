package data

// NetworkEconomicsResponse holds the network economics endpoint response
type NetworkEconomicsResponse struct {
	Data struct {
		Economics *NetworkEconomics `json:"metrics"`
	} `json:"data"`
	Error string `json:"error"`
	Code  string `json:"code"`
}

// NetworkEconomics holds the network economics details
type NetworkEconomics struct {
	DevRewards            string `json:"erd_dev_rewards"`
	EpochForEconomicsData uint32 `json:"erd_epoch_for_economics_data"`
	Inflation             string `json:"erd_inflation"`
	TotalFees             string `json:"erd_total_fees"`
	TotalStakedValue      string `json:"erd_total_staked_value"`
	TotalSupply           string `json:"erd_total_supply"`
	TotalTopUpValue       string `json:"erd_total_top_up_value"`
}
