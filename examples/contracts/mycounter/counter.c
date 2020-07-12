#include "elrond/context.h"
#include "elrond/util.h"

STORAGE_KEY(COUNTER);

void init() {
    int64storageStore(COUNTER_KEY, COUNTER_KEY_LEN, 1);
}

void increment() {
    i64 counter = int64storageLoad(COUNTER_KEY, COUNTER_KEY_LEN);
    counter++;
    int64storageStore(COUNTER_KEY, COUNTER_KEY_LEN, counter);
    int64finish(counter);
}

void decrement() {
    i64 counter = int64storageLoad(COUNTER_KEY, COUNTER_KEY_LEN);
    counter--;
    int64storageStore(COUNTER_KEY, COUNTER_KEY_LEN, counter);
    int64finish(counter);
}

void get() {
    i64 counter = int64storageLoad(COUNTER_KEY, COUNTER_KEY_LEN);
    int64finish(counter);
}