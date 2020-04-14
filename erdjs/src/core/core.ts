import fetch, {
    Blob,
    Headers,
    Request,
    RequestInit,
    RequestInfo,
    Response,
    FetchError
} from "node-fetch";

import { AbortController, AbortSignal } from "abort-controller";

export function fetchWithTimeout(resource: RequestInfo, timeout: number, init?: RequestInit): Promise<Response> {
    const timeoutController = new TimeoutController(timeout);

    if (init == null) {
        init = {}; 
    }
    if (init.signal == null) {
        init.signal = timeoutController.start();
    }

    let fetchPromise = fetch(resource, init);
    fetchPromise.finally(() => timeoutController.clear());
    return fetchPromise;
}

export class TimeoutController extends AbortController {
    private timer: NodeJS.Timer;
    private timeout: number;

    constructor(t: number) {
        super();
        this.timeout = t;
    }

    start(): AbortSignal {
        if (this.signal.aborted) {
            throw new Error(`TimeoutController already aborted`);
        }
        this.timer = setTimeout(
            () => this.abort(),
            this.timeout
        );

        return this.signal;
    }

    clear() {
        clearTimeout(this.timer);
    }
}

export function stringToHex(str: string): string {
    const chars = [...str];
    return chars.map(chr => chr.charCodeAt(0).toString(16).padStart(2, "0")).join("");
}

export function bytesToHex(bytes: Array<number>): string {
    return bytes.map(byte => byte.toString(16).padStart(2, "0")).join("");
}
