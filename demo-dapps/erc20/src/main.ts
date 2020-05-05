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
            await erc20.UpdateUserAccount();
            var info = erc20.GetUserAccountInfo();
            console.log(info);
        }
    });
});
