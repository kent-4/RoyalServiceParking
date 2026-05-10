package com.appdev.set.controller.api.response;

public record ApiErrorResponse(String message) {

    public static ApiErrorResponse of(String message) {
        return new ApiErrorResponse(message);
    }
}
