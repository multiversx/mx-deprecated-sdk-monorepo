// QuarkChain client library built on web3.js
//
// Call QuarkChain.injectWeb3(web3, jrpcUrl) to inject qkc object.
// The functions provided by the web3.qkc object mirror the corresponding ones in web3.eth.
// One notable difference is that the qkc functions accepts QuarkChain address (48 hex chars).
//
// Available functions:
//     getBalance: $QKC_ADDRESS
//     getTransactionCount: $QKC_ADDRESS
//     call: {to: $QKC_ADDRESS, ...}
//     sendTransaction:
//     {
//       to: $QKC_ADDRESS,
//       fromFullShardKey: $NUMBER,
//       toFullShardKey: $NUMBER,
//       ...
//     }, nonce is fetched from network
//     getTransactionReceipt: $TX_ID
//     contract: $ABI
//         new:
//         at: $QKC_ADDRESS
//
// Example:
//     QuarkChain.injectWeb3(web3, "http://jrpc.quarkchain.io:38391");
//     const ethAddr = web3.eth.accounts[0];
//     const qkcAddr = ethAddr + "00000001";  // Default to chain 0.
//     web3.qkc.getBalance(qkcAddr).toString(10);
//
// Also for now this package needs `Web3` global variable from MetaMask, which means it can
// only work in browser.

import ethUtil from 'ethereumjs-util';

import Transaction from './quarkchain-ethereum-tx';

let Web3;
if (typeof window === 'undefined') {
  Web3 = require("web3"); // eslint-disable-line
} else {
  Web3 = window.Web3; // eslint-disable-line
}

const defaultTokenSetting = {
  transferTokenId: '0x8bb0',
  gasTokenId: '0x8bb0',
};

function assert(condition, msg) {
  if (!condition) {
    throw msg;
  }
}

function getFullShardKeyFromQkcAddress(qkcAddress) {
  assert(qkcAddress.length === 50, 'Invalid qkc address');
  return `0x${qkcAddress.slice(-8)}`;
}

function getEthAddressFromQkcAddress(qkcAddress) {
  assert(qkcAddress.length === 50, 'Invalid qkc address');
  return qkcAddress.slice(0, 42);
}

function getTypedTx(tx) {
  const msgParams = [
    {
      type: 'uint256',
      name: 'nonce',
      value: `0x${tx.nonce.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'gasPrice',
      value: `0x${tx.gasPrice.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'gasLimit',
      value: `0x${tx.gasLimit.toString('hex')}`,
    },
    {
      type: 'uint160',
      name: 'to',
      value: `0x${tx.to.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'value',
      value: `0x${tx.value.toString('hex')}`,
    },
    {
      type: 'bytes',
      name: 'data',
      value: `0x${tx.data.toString('hex')}`,
    },
    {
      type: 'uint256',
      name: 'networkId',
      value: `0x${tx.networkId.toString('hex')}`,
    },
    {
      type: 'uint32',
      name: 'fromFullShardKey',
      value: `0x${tx.fromFullShardKey.toString('hex')}`,
    },
    {
      type: 'uint32',
      name: 'toFullShardKey',
      value: `0x${tx.toFullShardKey.toString('hex')}`,
    },
    {
      type: 'uint64',
      name: 'gasTokenId',
      value: `0x${tx.gasTokenId.toString('hex')}`,
    },
    {
      type: 'uint64',
      name: 'transferTokenId',
      value: `0x${tx.transferTokenId.toString('hex')}`,
    },

    {
      type: 'string',
      name: 'qkcDomain',
      value: 'bottom-quark',
    },
  ];
  return msgParams;
}

async function metaMaskSignTyped(web3in, tx) {
  return new Promise((resolve, reject) => {
    const from = web3in.eth.accounts[0];
    const params = [getTypedTx(tx), from];
    const method = 'eth_signTypedData';
    web3in.currentProvider.sendAsync(
      {
        method,
        params,
        from,
      },
      (err, result) => {
        if (err) {
          return reject(err);
        }
        if (result.error !== undefined) {
          return reject(result.error);
        }
        return resolve(result.result);
      },
    );
  });
}

function decodeSignature(sig) {
  const ret = {};
  const signature = sig.slice(2);
  ret.r = ethUtil.toBuffer(`0x${signature.slice(0, 64)}`);
  ret.s = ethUtil.toBuffer(`0x${signature.slice(64, 128)}`);
  ret.v = ethUtil.toBuffer(`0x${signature.slice(128, 130)}`);
  return ret;
}

function loadContract(abi, contractAddress, web3in, web3http) {
  const web3contract = new Web3(web3http.currentProvider);

  // Override call and sendTransaction to include full shard id
  web3contract.eth.call = (obj, blockId, callback) => {
    const ret = web3in.qkc.call(
      Object.assign({}, obj, { to: contractAddress }),
      callback,
    );
    return ret;
  };

  web3contract.eth.sendTransaction = async (obj, callback) => {
    const ret = await web3in.qkc.sendTransaction(
      Object.assign({}, obj, { to: contractAddress }),
      callback,
    );
    return ret;
  };
  return web3contract.eth.contract(abi).at(contractAddress.slice(0, 42));
}

export default {
  getFullShardKeyFromQkcAddress,

  getEthAddressFromQkcAddress,

  injectWeb3(web3in, jrpcUrl) {
    // Inject QuarkChain specific logic into the provided web3 instance.
    //
    // The web3 instance passed in will be used for account management and signing transactions.
    // It should have a provider implementing RPC eth_signTypedData (https://github.com/ethereum/EIPs/pull/712)
    // Normally you should just pass in a web3 instance with provider from MetaMask.
    //
    // Args:
    //     web3in: web3 instance
    //     jrpcUrl: QuarkChain JSON RPC endpoint (e.g., http://localhost:38391)
    const web3http = new Web3(new Web3.providers.HttpProvider(jrpcUrl));

    Object.defineProperty(web3in, 'qkc', {
      value: {
        getBalance(qkcAddress, callback) {
          const ethAddress = getEthAddressFromQkcAddress(qkcAddress);
          const shard = getFullShardKeyFromQkcAddress(qkcAddress);
          return web3http.eth.getBalance(ethAddress, shard, callback);
        },

        getTransactionCount(qkcAddress, callback) {
          const ethAddress = getEthAddressFromQkcAddress(qkcAddress);
          const shard = getFullShardKeyFromQkcAddress(qkcAddress);
          return web3http.eth.getTransactionCount(ethAddress, shard, callback);
        },

        call(obj, callback) {
          const qkcAddress = obj.to;
          const rawTx = Object.assign({}, obj, {
            to: getEthAddressFromQkcAddress(qkcAddress),
          });
          const shard = getFullShardKeyFromQkcAddress(qkcAddress);
          return web3http.eth.call(rawTx, shard, callback);
        },

        setPrivateKey(privateKey) {
          if (privateKey.length !== 66) {
            throw new Error('Invalid key');
          }
          this.key = privateKey;
          this.address = `0x${ethUtil.privateToAddress(ethUtil.toBuffer(privateKey)).toString('hex')}`;
        },

        unsetPrivateKey() {
          this.key = null;
          this.address = null;
        },

        async sendTransaction(obj, callback) {
          let fromEthAddress;
          if (this.address) {
            fromEthAddress = this.address;
          } else {
            fromEthAddress = web3in.eth.accounts[0];
          }
          if (obj.fromFullShardKey === undefined || obj.toFullShardKey === undefined) {
            throw new Error('`fromFullShardKey` and `toFullShardKey` are required');
          }

          const rawTx = Object.assign({}, defaultTokenSetting, obj);
          if (obj.to !== undefined) {
            if (obj.to.length === 42) {
              rawTx.to = obj.to;
            } else {
              rawTx.to = getEthAddressFromQkcAddress(obj.to);
              if (getFullShardKeyFromQkcAddress(obj.to) !== obj.toFullShardKey) {
                throw new Error('Target shard key mismatch');
              }
            }
          }

          // FIXME: make this async
          if (rawTx.nonce == undefined) {
            rawTx.nonce = web3http.eth.getTransactionCount(
              fromEthAddress,
              rawTx.fromFullShardKey,
            );
          }
          if (!rawTx.networkId) {
            // default network is devnet
            rawTx.networkId = '0xff';
          }
          // rawTx.version is part of transaction sent to QuarkChain Network but not part of
          // signature it determines the signature version:
          //    '0x0' RLP-encoded transaction of all fields in Transaction (minus version, v, r, s)
          //    '0x1' typed encoding matching MetaMask initial implementation of EIP-712
          rawTx.version = '0x1';

          const tx = new Transaction(rawTx);

          if (this.key) {
            // sign with a key
            tx.version = '0x0';
            tx.sign(ethUtil.toBuffer(this.key));
          } else {
            const sig = await metaMaskSignTyped(web3in, tx);
            Object.assign(tx, decodeSignature(sig));
          }
          const payload = `0x${tx.serialize().toString('hex')}`;
          return web3http.eth.sendRawTransaction(payload, callback);
        },

        getTransactionReceipt: web3http.eth.getTransactionReceipt,

        getCode(qkcAddress, callback) {
          const ethAddress = getEthAddressFromQkcAddress(qkcAddress);
          const shard = getFullShardKeyFromQkcAddress(qkcAddress);
          return web3http.eth.getCode(ethAddress, shard, callback);
        },

        contract(abi) {
          const contractFactory = web3in.eth.contract(abi);
          const originalFactory = web3in.eth.contract(abi);
          contractFactory.at = addr => loadContract(abi, addr, web3in, web3http);
          contractFactory.new = (...args) => {
            const size = args.length;
            const callback = args[size - 1];
            const newArguments = [...args.slice(0, -1)];
            return originalFactory.new(...newArguments, (err, contract) => {
              if (!contract) {
                callback(err, contract);
              }
              if (!contract.address) {
                // The transactionHash returned from eth_sendRawTransaction is already a tx id
                contract.transactionId = contract.transactionHash; // eslint-disable-line
              }
              callback(err, contract);
            });
          };
          contractFactory.new.getData = originalFactory.new.getData;
          return contractFactory;
        },
      },
    });

    // Override to support `contract.new`
    web3in.eth.sendTransaction = web3in.qkc.sendTransaction.bind(web3in.qkc); // eslint-disable-line
    web3in.eth.getTransactionReceipt = web3in.qkc.getTransactionReceipt; // eslint-disable-line
    web3in.eth.getCode = web3in.qkc.getCode; // eslint-disable-line
  },
};
