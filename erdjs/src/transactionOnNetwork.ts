import { Provider } from "./interface";

export class TransactionOnNetwork {
    private model: any;

    constructor(model: any) {
        this.model = model;
    }

    async fetch(provider: Provider): Promise<void> {

    }

    async fetchStatus(provider: Provider): Promise<void> {
        
    }
}