package com.elrond.erdkotlin

class Exceptions {

    open class KnownException(message: String? = null) : Exception(message) {
        private val serialVersionUID = 8760300734907152416L
    }

    open class AddressException(message: String? = null) : KnownException(message) {
        private val serialVersionUID = 7303569975530215510L
    }

    class CannotCreateAddressException(input: Any) :
        AddressException("Cannot create address from: $input") {
        private val serialVersionUID = 1249335179408397539L
    }

    class CannotCreateBech32AddressException(input: Any) :
        AddressException("Cannot create bech32 address from: $input") {
        private val serialVersionUID = 1249335179408397539L
    }

    class BadAddressHrpException : AddressException() {
        private val serialVersionUID = 7074540271315613570L
    }

    class EmptyAddressException : AddressException() {
        private val serialVersionUID = -170346454394596227L
    }

    class CannotConvertBitsException : AddressException() {
        private val serialVersionUID = 7002466269883351644L
    }

    class InvalidCharactersException : AddressException() {
        private val serialVersionUID = 440923894748025560L
    }

    class InconsistentCasingException : AddressException() {
        private val serialVersionUID = -6909226964519236168L
    }

    class MissingAddressHrpException : AddressException() {
        private val serialVersionUID = -2279315088416839103L
    }

    class CannotGenerateMnemonicException : KnownException() {
        private val serialVersionUID = -9089149758748689110L
    }

    class CannotDeriveKeysException : KnownException() {
        private val serialVersionUID = 6759812280546343157L
    }

    class CannotSerializeTransactionException : KnownException() {
        private val serialVersionUID = -1322742374396410484L
    }

    class CannotSignTransactionException : KnownException() {
        private val serialVersionUID = -5983779627162656410L
    }

    class ProxyRequestException(message: String? = null) : KnownException(message) {
        private val serialVersionUID = 1344143859356453293L
    }
}
