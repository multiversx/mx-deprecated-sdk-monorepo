
import { Address, SmartContractDeploy } from "@elrondnetwork/erdjs";

declare var $: any;

$(document).ready(async function () {
    main();
});

function main() {
    console.log("Tools");

    let deployment = new SmartContractDeploy();
    deployment.setCode("");
    deployment.addBigIntArgument(BigInt(512));
    deployment.generateArgumentString()
}
