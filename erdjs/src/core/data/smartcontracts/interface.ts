export interface ERC20Client {
    name(): string;
    symbol(): string;
    decimals(): number;
    totalSupply(): Promise<bigint>;
    balanceOf(address: string): Promise<bigint>;
    transfer(receiver: string, value: bigint): Promise<boolean>;
    transferFrom(sender: string, receiver: string, value: bigint): Promise<boolean>;
    approve(spender: string, value: bigint): Promise<boolean>;
    allowance(owner: string, spender: string): Promise<bigint>;
}
