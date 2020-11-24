import { describe } from "mocha";
import { assert } from "chai";
import { Address } from "../address";
import { AbiRegistry, StructureDefinition } from "./abi";
import { BinarySerializer, BinaryReader } from "./serialization";
import { PrimitiveType } from "./types";


describe("test serialization", () => {
    it("should deserialize struct", async () => {
        let definition = new StructureDefinition();
        definition.addField("ticket_price", PrimitiveType.BigUInt);
        definition.addField("tickets_left", PrimitiveType.U32);
        definition.addField("deadline", PrimitiveType.U64);
        definition.addField("max_entries_per_user", PrimitiveType.U32);
        definition.addField("prize_distribution", PrimitiveType.U8, true);
        definition.addField("whitelist", PrimitiveType.Address, true);
        definition.addField("current_ticket_number", PrimitiveType.U32);
        definition.addField("prize_pool", PrimitiveType.BigUInt);

        class Foo {
            ticket_price: BigInt = BigInt(0);
            tickets_left: number = 0;
            deadline: BigInt = BigInt(0);
            max_entries_per_user: number = 0;
            prize_distribution: number[] = [];
            whitelist: Address[] = [];
            current_ticket_number: number = 0;
            prize_pool: BigInt = BigInt(0);
        }

        let foo = new Foo();

        let serializer = new BinarySerializer();
        let data = serialized("[00000008|8ac7230489e80000] [00000000] [000000005fc2b9db] [ffffffff] [00000001|64] [00000000] [00002500] [0000000a|140ec80fa7ee88000000]");
        serializer.deserialize(data, foo, definition);

        assert.deepEqual(foo, {
            ticket_price: BigInt("10000000000000000000"),
            tickets_left: 0,
            deadline: BigInt("0x000000005fc2b9db"),
            max_entries_per_user: parseInt("ffffffff", 16),
            prize_distribution: [100],
            whitelist: [],
            current_ticket_number: 9472,
            prize_pool: BigInt("94720000000000000000000")
        });
    });
});

describe("test reader", () => {
    it("should read big ints", async () => {
        let data = serialized("00000008|8ac7230489e80000");
        let reader = new BinaryReader(data);
        let result = reader.readBigUInt();
        assert.equal(result, BigInt("10000000000000000000"));

        data = serialized("0000000a|140ec80fa7ee88000000");
        reader = new BinaryReader(data);
        result = reader.readBigUInt();
        assert.equal(result, BigInt("94720000000000000000000"));

        // Now read both
        data = serialized("[00000008|8ac7230489e80000] [0000000a|140ec80fa7ee88000000]");
        reader = new BinaryReader(data);
        assert.equal(reader.readBigUInt(), BigInt("10000000000000000000"));
        assert.equal(reader.readBigUInt(), BigInt("94720000000000000000000"));

        // TODO: Also read signed big ints.
    });
});

function serialized(prettyHex: string): Buffer {
    let uglyHex = prettyHex.replace(/[\|\s\[\]]/gi, "");
    let buffer = Buffer.from(uglyHex, "hex");
    return buffer;
}
