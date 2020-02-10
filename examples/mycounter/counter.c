#include "elrond/context.h"

byte counterKey[32] = {'m','y','c','o','u','n','t','e','r',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};

void init() {
    int64storageStore(counterKey, 1);
}

void increment() {
    i64 counter = int64storageLoad(counterKey);
    counter++;
    int64storageStore(counterKey, counter);
    int64finish(counter);
}

void decrement() {
    i64 counter = int64storageLoad(counterKey);
    counter--;
    int64storageStore(counterKey, counter);
    int64finish(counter);
}

void get() {
    i64 counter = int64storageLoad(counterKey);
    int64finish(counter);
}