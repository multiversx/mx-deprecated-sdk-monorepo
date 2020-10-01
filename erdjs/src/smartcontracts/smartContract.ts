import { Balance } from "../balance";
import { Address } from "../address";
import { GasLimit } from "../networkParams";
import { Transaction } from "../transaction";
import { TransactionPayload } from "../transactionPayload";
import { Abi } from "./abi";
import { Argument } from "./argument";
import { Code } from "./code";
import { CodeMetadata } from "./codeMetadata";
import keccak from "keccak";
import { SmartContract as ISmartContract } from "./interface";
import { ArwenVirtualMachine } from "./transactionPayloadBuilders";
import { Nonce } from "../nonce";
import { ContractFunction } from "./function";

export class SmartContract implements ISmartContract {
    private owner: Address = new Address();
    private address: Address = new Address();
    private abi: Abi = new Abi();
    private code: Code = Code.nothing();
    private codeMetadata: CodeMetadata = new CodeMetadata();
    private readonly trackOfTransactions: Transaction[] = [];

    constructor({ address }: { address?: Address }) {
        if (address) {
            this.address = address;
        }
    }

    setAddress(address: Address) {
        this.address = address;
    }

    getAddress(): Address {
        this.address.assertNotEmpty();
        return this.address;
    }

    getOwner(): Address {
        this.owner.assertNotEmpty();
        return this.owner;
    }

    setAbi(abi: Abi) {
        this.abi = abi;
    }

    getAbi(): Abi {
        return this.abi;
    }

    getCode(): Code {
        return this.code;
    }

    getCodeMetadata(): CodeMetadata {
        return this.codeMetadata;
    }

    deploy({ code, codeMetadata, initArguments, value, gasLimit }
        : { code: Code, codeMetadata?: CodeMetadata, initArguments?: Argument[], value?: Balance, gasLimit: GasLimit }
    ): Transaction {
        codeMetadata = codeMetadata || new CodeMetadata();
        initArguments = initArguments || [];
        value = value || Balance.Zero();

        let payload = TransactionPayload.contractDeploy()
            .setCode(code)
            .setCodeMetadata(codeMetadata)
            .setInitArgs(initArguments)
            .build();

        let transaction = new Transaction({
            receiver: Address.Zero(),
            value: value,
            gasLimit: gasLimit,
            data: payload
        });

        this.code = code;
        this.codeMetadata = codeMetadata;
        transaction.onSigned.on(this.onDeploySigned.bind(this));

        return transaction;
    }

    private onDeploySigned({ transaction, signedBy }: { transaction: Transaction, signedBy: Address }) {
        this.owner = signedBy;
        let nonce = transaction.nonce;
        let address = SmartContract.computeAddress(this.owner, nonce);
        this.setAddress(address);

        this.trackOfTransactions.push(transaction);
    }

    upgrade({ code, codeMetadata, initArgs, value, gasLimit }
        : { code: Code, codeMetadata?: CodeMetadata, initArgs?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction {
        codeMetadata = codeMetadata || new CodeMetadata();
        initArgs = initArgs || [];
        value = value || Balance.Zero();

        let payload = TransactionPayload.contractUpgrade()
            .setCode(code)
            .setCodeMetadata(codeMetadata)
            .setInitArgs(initArgs)
            .build();

        let transaction = new Transaction({
            receiver: this.getAddress(),
            value: value,
            gasLimit: gasLimit,
            data: payload
        });

        this.code = code;
        this.codeMetadata = codeMetadata;
        transaction.onSigned.on(this.onUpgradeSigned.bind(this));

        return transaction;
    }

    private onUpgradeSigned({ transaction }: { transaction: Transaction, signedBy: Address }) {
        this.trackOfTransactions.push(transaction);
    }

    call({ func, args, value, gasLimit }
        : { func: ContractFunction, args?: Argument[], value?: Balance, gasLimit: GasLimit }): Transaction {
        args = args || [];
        value = value || Balance.Zero();

        let payload = TransactionPayload.contractCall()
            .setFunction(func)
            .setArgs(args)
            .build();

        let transaction = new Transaction({
            receiver: this.getAddress(),
            value: value,
            gasLimit: gasLimit,
            data: payload
        });

        transaction.onSigned.on(this.onCallSigned.bind(this));

        return transaction;
    }

    private onCallSigned({ transaction }: { transaction: Transaction, signedBy: Address }) {
        this.trackOfTransactions.push(transaction);
    }

    static computeAddress(owner: Address, nonce: Nonce): Address {
        let initialPadding = Buffer.alloc(8, 0);
        let ownerPubkey = owner.pubkey();
        let shardSelector = ownerPubkey.slice(30);
        let ownerNonceBytes = Buffer.alloc(8);
        ownerNonceBytes.writeBigUInt64LE(BigInt(nonce.value));
        let bytesToHash = Buffer.concat([ownerPubkey, ownerNonceBytes]);
        let hash = keccak("keccak256").update(bytesToHash).digest();
        let vmTypeBytes = Buffer.from(ArwenVirtualMachine, "hex");
        let addressBytes = Buffer.concat([
            initialPadding,
            vmTypeBytes,
            hash.slice(10, 30),
            shardSelector
        ]);

        let address = new Address(addressBytes);
        return address;
    }
}
