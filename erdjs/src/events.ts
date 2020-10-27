import { Disposable } from "./interface";

/**
 * An interface that defines a Listener (an "Observer", in the context of the Observer pattern).
 */
export interface Listener<T> {
    (event: T): any;
}

/**
 * An event (a "Subject" in the context of the Observer pattern).
 * One or more {@link Listener} objects can register to this.
 * 
 * Based on: https://basarat.gitbook.io/typescript/main-1/typed-event
 */
export class TypedEvent<T> {
    private listeners: Listener<T>[] = [];
    private listenersOnce: Listener<T>[] = [];

    /**
     * Registers a listener to this event.
     */
    on(listener: Listener<T>): Disposable {
        this.listeners.push(listener);
        return {
            dispose: () => this.off(listener)
        };
    }

    /**
     * Registers a one-time listener to this event.
     */
    once(listener: Listener<T>): void {
        this.listenersOnce.push(listener);
    }

    /**
     * Unregisters a listener from this event.
     */
    off(listener: Listener<T>) {
        var callbackIndex = this.listeners.indexOf(listener);
        if (callbackIndex > -1) {
            this.listeners.splice(callbackIndex, 1);
        }
    }

    /**
     * Emits an event (with a payload).
     */
    emit(event: T) {
        // Notify all listeners
        this.listeners.forEach((listener) => listener(event));

        // Notify (then clear) "once" listeners
        this.listenersOnce.forEach((listener) => listener(event));
        this.listenersOnce = [];
    }
}