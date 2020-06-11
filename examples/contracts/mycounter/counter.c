#include "elrond/context.h"

byte counterKey[32] = {'m','y','c','o','u','n','t','e','r',0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
int KEY_LENGTH = 32;

void init() {
    int64storageStore(counterKey, KEY_LENGTH, 1);
}

void increment() {
    i64 counter = int64storageLoad(counterKey, KEY_LENGTH);
    counter++;
    int64storageStore(counterKey, KEY_LENGTH, counter);
    int64finish(counter);
}

void decrement() {
    i64 counter = int64storageLoad(counterKey, KEY_LENGTH);
    counter--;
    int64storageStore(counterKey, KEY_LENGTH, counter);
    int64finish(counter);
}

void get() {
    i64 counter = int64storageLoad(counterKey, KEY_LENGTH);
    int64finish(counter);
}