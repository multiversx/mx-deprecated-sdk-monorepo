
export class ESDTToken {
    token: string = '';
    name: string = '';
    owner: string = '';
    minted: string = '';
    burnt: string = '';
    decimals: number = 18;
    isPaused: boolean = false;
    canUpgrade: boolean = false;
    canMint: boolean = false;
    canBurn: boolean = false;
    canChangeOwner: boolean = false;
    canPause: boolean = false;
    canFreeze: boolean = false;
    canWipe: boolean = false;

    constructor(init?: Partial<ESDTToken>) {
        Object.assign(this, init);
    }

    static fromHttpResponse(response: {
        token: string,
        name: string,
        owner: string,
        minted: string,
        burnt: string,
        decimals: number,
        isPaused: boolean,
        canUpgrade: boolean,
        canMint: boolean,
        canBurn: boolean,
        canChangeOwner: boolean,
        canPause: boolean,
        canFreeze: boolean,
        canWipe: boolean
    }) {
        let esdtToken = new ESDTToken(response);
        return esdtToken
    }

    getTokenName() {
        return this.name;
    }

    getTokenIdentifier() {
        return this.token;
    }

}