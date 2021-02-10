package com.elrond.erdkotlin

import org.junit.Assert
import org.junit.Test

class CheckUsernameUsecaseTest {

    private val checkUsernameUsecase = ErdSdk.checkUsernameUsecase()

    @Test
    fun `valid alphanumeric`() {
        val isUsernameValid = checkUsernameUsecase.execute("abc123.elrond")
        Assert.assertTrue(isUsernameValid)
    }

    @Test
    fun `valid 3 chars`() {
        val isUsernameValid = checkUsernameUsecase.execute("abc.elrond")
        Assert.assertTrue(isUsernameValid)
    }

    @Test
    fun `valid 25 chars`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abcdefghiklmnopqrstuvwxyz.elrond"
        )
        Assert.assertTrue(isUsernameValid)
    }

    @Test
    fun `wrong less than 3 chars`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "ab.elrond"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong more than 25 chars`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abcdefghiklmnopqrstuvwxyz1.elrond"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong maj not allowed`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "ABC.elrond"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong elrond suffix is required`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abcde"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong elrond must be the suffix`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abc.elrond.com"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong underscore not allowed`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abc_123.elrond"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong dash not allowed`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abc-123.elrond"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong @ not allowed`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abc@123.elrond"
        )
        Assert.assertFalse(isUsernameValid)
    }

    @Test
    fun `wrong space not allowed`() {
        val isUsernameValid = checkUsernameUsecase.execute(
            "abc 123.elrond"
        )
        Assert.assertFalse(isUsernameValid)
    }
}