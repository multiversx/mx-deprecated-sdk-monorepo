window.UserAddressInput = null;

$(document).ready(function() {
    window.UserAddressInput = $('#UserAddressInput');

    window.UserAddressInput.on('keydown', function(ev) {
        if (ev.key == "Enter") {
            ev.preventDefault();
            var address = window.UserAddressInput.val();
            console.log(address);
            SetUserAddress(address);
            UpdateUserAccount();
            var info = GetUserAccountInfo();
            console.log(info);
        }
    });
});
