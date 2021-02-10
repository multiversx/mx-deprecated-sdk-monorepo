package com.elrond.erdkotlin.domain.vm

data class SmartContractQuery(
    val scAddress: String,
    val funcName: String,
    val args: List<String>,
    val caller: String? = null,
    val value: String? = null
)
