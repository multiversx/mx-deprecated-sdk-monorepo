export interface Listener<T> {
    (event: T): any;
}

export interface Disposable {
    dispose(): void;
}

/**
 * Based on: https://basarat.gitbook.io/typescript/main-1/typed-event
 */
export class TypedEvent<T> {
    private listeners: Listener<T>[] = [];
    private listenersOnce: Listener<T>[] = [];

    on(listener: Listener<T>): Disposable {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener)
        };
    }

    once(listener: Listener<T>): void {
        this.listenersOnce.push(listener);
    }

    off(listener: Listener<T>) {
        var callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) {
            this.listeners.splice(callbackIndex, 1);
        }
    }

    emit(event: T) {
        // Notify all listeners
        this.listeners.forEach((listener) => listener(event));

        // Notify (then clear) "once" listeners
        this.listenersOnce.forEach((listener) => listener(event));
        this.listenersOnce = [];
    }
}