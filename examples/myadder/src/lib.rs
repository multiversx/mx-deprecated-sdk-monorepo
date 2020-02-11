
#![no_std]
#![no_main]
#![allow(non_snake_case)]
#![allow(unused_attributes)]

static A_KEY: [u8; 32] = [0u8; 32];

#[elrond_wasm_derive::contract]
pub trait Adder {

    fn init(&self, initial_value: &BigInt) {
        self.storage_store_big_int(&A_KEY.into(), &initial_value);
    }

    fn add(&self, value: &BigInt) {
        let mut current = self.storage_load_big_int(&A_KEY.into());
        current += value;
        self.storage_store_big_int(&A_KEY.into(), &current);
    }

    fn getSum(&self) -> BigInt {
        let current = self.storage_load_big_int(&A_KEY.into());
        current
    }
}
