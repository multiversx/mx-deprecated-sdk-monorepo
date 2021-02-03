package com.elrond.erdkotlin.data.api

import com.elrond.erdkotlin.Exceptions
import com.google.gson.Gson
import com.google.gson.reflect.TypeToken
import okhttp3.MediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import java.io.IOException

internal class ElrondClient(
    var url: String,
    private val gson: Gson
) {

    private val httpClient = OkHttpClient()

    @Throws(IOException::class)
    inline fun <reified T : ResponseBase<*>> doGet(resourceUrl: String): T {
        val url = "$url/$resourceUrl"
        val request: Request = Request.Builder().url(url).build()
        val responseJson = httpClient.newCall(request).execute().use { response ->
            response.body()?.string()
        }
        val response: T? = responseJson?.let { gson.fromJson(it) }
        requireNotNull(response).throwIfError()
        return response
    }

    @Throws(IOException::class)
    inline fun <reified T : ResponseBase<*>> doPost(resourceUrl: String, json: String): T {
        val url = "$url/$resourceUrl"
        val body = RequestBody.create(JSON, json)
        val request: Request = Request.Builder().url(url).post(body).build()
        val responseJson =  httpClient.newCall(request).execute().use { response ->
            response.body()?.string()
        }
        val response: T? = responseJson?.let { gson.fromJson(it) }
        requireNotNull(response).throwIfError()
        return response
    }

    private inline fun <reified T> Gson.fromJson(json: String) =
        this.fromJson<T>(json, object : TypeToken<T>() {}.type)!!

    companion object {
        private val JSON = MediaType.get("application/json; charset=utf-8")
    }

    class ResponseBase<T> {
        val data: T? = null
        val error: String? = null
        val code: String = "" // ex: "successful"

        @Throws(Exceptions.ProxyRequestException::class)
        fun throwIfError() {
            if (!error.isNullOrEmpty()) {
                throw Exceptions.ProxyRequestException(error)
            }
            if (code != "successful") {
                throw Exceptions.ProxyRequestException(code)
            }
        }
    }

}
