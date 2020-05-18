typedef unsigned char byte;
typedef unsigned int u32;
typedef unsigned long long u64;
typedef long long i64;
typedef unsigned int bigInt;

bigInt bigIntNew(long long value);
void bigIntGetUnsignedArgument(int argumentIndex, bigInt argument);
int bigIntGetUnsignedBytes(bigInt reference, byte *byte);
int bigIntStorageLoadUnsigned(byte *key, bigInt value);
int bigIntStorageStoreUnsigned(byte *key, bigInt value);
void bigIntFinishUnsigned(bigInt reference);
void bigIntAdd(bigInt destination, bigInt op1, bigInt op2);
void bigIntSub(bigInt destination, bigInt op1, bigInt op2);
int bigIntCmp(bigInt op1, bigInt op2);

int getNumArguments();
int getArgument(int argumentIndex, byte *argument);
void getCaller(byte *callerAddress);
void signalError(byte *message, int length);
void writeLog(byte *pointer, int length, byte *topicPtr, int numTopics);
void finish(byte *data, int length);
void int64finish(long long value);
 
// global data used in functions, will be statically allocated to WebAssembly memory
byte sender[32]        = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
byte recipient[32]     = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
byte caller[32]        = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
byte currentKey[32]    = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};

byte approveEvent[32]  = {0x71,0x34,0x69,0x2B,0x23,0x0B,0x9E,0x1F,0xFA,0x39,0x09,0x89,0x04,0x72,0x21,0x34,0x15,0x96,0x52,0xB0,0x9C,0x5B,0xC4,0x1D,0x88,0xD6,0x69,0x87,0x79,0xD2,0x28,0xFF};
byte transferEvent[32] = {0xF0,0x99,0xCD,0x8B,0xDE,0x55,0x78,0x14,0x84,0x2A,0x31,0x21,0xE8,0xDD,0xFD,0x43,0x3A,0x53,0x9B,0x8C,0x9F,0x14,0xBF,0x31,0xEB,0xF1,0x08,0xD1,0x2E,0x61,0x96,0xE9};

byte currentTopics[96] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                          0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};
byte currentLogVal[32] = {0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0};


void computeTotalSupplyKey(byte *destination) {
  // only the total supply key starts with byte "0"
  for (int i = 0; i < 32; i++) {
    destination[i] = 0;
  }
}

void computeBalanceKey(byte *destination, byte *address) {
  // reserve one byte of the key to indicate key type
  // "1" is for balance keys
  destination[0] = 1;
  destination[1] = 0;

  // the last 2 bytes of the address are only used to identify the shard, 
  // so they are disposable when constructing the key
  for (int i = 0; i < 30; i++) {
    destination[2+i] = address[i];
  }
}

void computeAllowanceKey(byte *destination, byte *from, byte* to) {
  // reserve one byte of the key to indicate key type
  // "2" is for allowance keys
  destination[0] = 2;

  // Note: in smart contract addresses, the first 10 bytes are all 0
  // therefore we read from byte 10 onwards to provide more significant bytes
  // and to minimize the chance for collisions
  // TODO: switching to a hash instead of a concatenation of addresses might make it safer
  for (int i = 0; i < 15; i++) {
    destination[1+i] = from[10+i];
  }
  for (int i = 0; i < 16; i++) {
    destination[16+i] = to[10+i];
  }
}

// both transfer and approve have 3 topics (event identifier, sender, recipient)
// so both prepare the log the same way
void saveLogWith3Topics(byte *topic1, byte *topic2, byte *topic3, bigInt value) {
  // copy all topics to currentTopics
  for (int i = 0; i < 32; i++) {
    currentTopics[i] = topic1[i];
  }
  for (int i = 0; i < 32; i++) {
    currentTopics[32+i] = topic2[i];
  }
  for (int i = 0; i < 32; i++) {
    currentTopics[64+i] = topic3[i];
  }

  // extract value bytes to memory
  int valueLen = bigIntGetUnsignedBytes(value, currentLogVal);

  // call api
  writeLog(currentLogVal, valueLen, currentTopics, 3);
}

// constructor function
// is called immediately after the contract is created
// will set the fixed global token supply and give all the supply to the creator
void init() {
  if (getNumArguments() != 1) {
    byte message[] = "wrong args num";
    signalError(message, 14);
    return;
  }

  getCaller(sender);
  bigInt totalSupply = bigIntNew(0);
  bigIntGetUnsignedArgument(0, totalSupply);

  // set total supply
  computeTotalSupplyKey(currentKey);
  bigIntStorageStoreUnsigned(currentKey, totalSupply);

  // sender balance <- total supply
  computeBalanceKey(currentKey, sender);
  bigIntStorageStoreUnsigned(currentKey, totalSupply);
}

// getter function: retrieves total token supply
void totalSupply() {
  if (getNumArguments() != 0) {
    byte message[] = "wrong args num";
    signalError(message, 14);
    return;
  }
  
  // load total supply from storage
  computeTotalSupplyKey(currentKey);
  bigInt totalSupply = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, totalSupply);

  // return total supply as big int
  bigIntFinishUnsigned(totalSupply);
}

void name() {
  byte n[] = "Rockets";
  finish(n, 7);
}

void symbol() {
  byte s[] = "RCX";
  finish(s, 3);
}

// getter function: retrieves balance for an account
void balanceOf() {
  if (getNumArguments() != 1) {
    byte message[] = "wrong args num";
    signalError(message, 14);
    return;
  }

  // argument: account to get the balance for
  getArgument(0, caller); 

  // load balance
  computeBalanceKey(currentKey, caller);
  bigInt balance = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, balance);

  // return balance as big int
  bigIntFinishUnsigned(balance);
}

// getter function: retrieves allowance granted from one account to another
void allowance() {
  if (getNumArguments() != 2) {
    byte message[] = "wrong args num";
    signalError(message, 14);
    return;
  }

  // 1st argument: owner
  getArgument(0, sender);

  // 2nd argument: spender
  getArgument(1, recipient);

  // get allowance
  computeAllowanceKey(currentKey, sender, recipient);
  bigInt allowance = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, allowance);

  // return allowance as big int
  bigIntFinishUnsigned(allowance);
}

// transfers tokens from sender to another account
void transfer() {
  if (getNumArguments() != 2) {
    byte message[] = "wrong args num";
    signalError(message, 14);
    return;
  }

  // sender is the caller
  getCaller(sender);

  // 1st argument: recipient
  getArgument(0, recipient);

  // 2nd argument: amount (should not be negative)
  bigInt amount = bigIntNew(0);
  bigIntGetUnsignedArgument(1, amount);
  if (bigIntCmp(amount, bigIntNew(0)) < 0) {
    byte message[] = "negative amount";
    signalError(message, 15);
    return;
  }

  // load sender balance
  computeBalanceKey(currentKey, sender);
  bigInt senderBalance = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, senderBalance);

  // check if enough funds
  if (bigIntCmp(amount, senderBalance) > 0) {
    byte message[] = "insufficient funds";
    signalError(message, 18);
    return;
  }

  // update sender balance
  bigIntSub(senderBalance, senderBalance, amount);
  bigIntStorageStoreUnsigned(currentKey, senderBalance);

  // load & update receiver balance
  computeBalanceKey(currentKey, recipient);
  bigInt receiverBalance = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, receiverBalance);
  bigIntAdd(receiverBalance, receiverBalance, amount);
  bigIntStorageStoreUnsigned(currentKey, receiverBalance);

  // log operation
  saveLogWith3Topics(transferEvent, sender, recipient, amount);

  // return "true"
  int64finish(1); 
}

// sender allows beneficiary to use given amount of tokens from sender's balance
// it will completely overwrite any previously existing allowance from sender to beneficiary
void approve() {
  if (getNumArguments() != 2) {
    byte message[] = "wrong args num";
    signalError(message, 14);
    return;
  }

  // sender is the caller
  getCaller(sender);

  // 1st argument: spender (beneficiary)
  getArgument(0, recipient);

  // 2nd argument: amount (should not be negative)
  bigInt amount = bigIntNew(0);
  bigIntGetUnsignedArgument(1, amount);
  if (bigIntCmp(amount, bigIntNew(0)) < 0) {
    byte message[] = "negative amount";
    signalError(message, 15);
    return;
  }

  // store allowance
  computeAllowanceKey(currentKey, sender, recipient);
  bigIntStorageStoreUnsigned(currentKey, amount);

  // log operation
  saveLogWith3Topics(approveEvent, sender, recipient, amount);

  // return "true"
  int64finish(1); 
}


// caller uses allowance to transfer funds between 2 other accounts
void transferFrom() {
   if (getNumArguments() != 3) {
    byte message[] = "wrong args num";
    signalError(message, 14);
    return;
  }

  // save caller
  getCaller(caller);

  // 1st argument: sender
  getArgument(0, sender);

  // 2nd argument: recipient
  getArgument(1, recipient);

  // 3rd argument: amount
  bigInt amount = bigIntNew(0);
  bigIntGetUnsignedArgument(2, amount);
  if (bigIntCmp(amount, bigIntNew(0)) < 0) {
    byte message[] = "negative amount";
    signalError(message, 15);
    return;
  }

  // load allowance
  computeAllowanceKey(currentKey, sender, caller);
  bigInt allowance = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, allowance);

  // amount should not exceed allowance
  if (bigIntCmp(amount, allowance) > 0) {
    byte message[] = "allowance exceeded";
    signalError(message, 18);
    return;
  }

  // update allowance
  bigIntSub(allowance, allowance, amount);
  bigIntStorageStoreUnsigned(currentKey, allowance);

  // load sender balance
  computeBalanceKey(currentKey, sender);
  bigInt senderBalance = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, senderBalance);

  // check if enough funds
  if (bigIntCmp(amount, senderBalance) > 0) {
    byte message[] = "insufficient funds";
    signalError(message, 18);
    return;
  }

  // update sender balance
  bigIntSub(senderBalance, senderBalance, amount);
  bigIntStorageStoreUnsigned(currentKey, senderBalance);

  // load & update receiver balance
  computeBalanceKey(currentKey, recipient);
  bigInt receiverBalance = bigIntNew(0);
  bigIntStorageLoadUnsigned(currentKey, receiverBalance);
  bigIntAdd(receiverBalance, receiverBalance, amount);
  bigIntStorageStoreUnsigned(currentKey, receiverBalance);

  // log operation
  saveLogWith3Topics(transferEvent, sender, recipient, amount);

  // return "true"
  int64finish(1); 
}

void _main(void) {
}
