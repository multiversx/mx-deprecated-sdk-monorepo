import * as erc20 from "./erc20";

declare var $: any;
var UserAddressInput: any = null;

$(document).ready(function() {
    UserAddressInput = $('#UserAddressInput');

    UserAddressInput.on('keydown', async function(ev: any) {
        if (ev.key == "Enter") {
            ev.preventDefault();
            var address = UserAddressInput.val();
            console.log(address);
            erc20.SetUserAddress(address);
            erc20.UpdateUserAccount().then(info => {
                console.log(info);
                $('#UserBalance').text(info.balance.toString());
                $('#UserNonce').text(info.nonce);

                erc20.GetUserTokenBalance().then(tokenBalance => {
                    console.log('token balance:', tokenBalance);
                    $('#UserTokenBalance').text(tokenBalance.toString());
                });

                erc20.GetERC20TotalSupply().then(totalSupply => {
                    $('#ERC20TotalSupply').text(totalSupply.toString());
                });
            });

        }
    });
});
