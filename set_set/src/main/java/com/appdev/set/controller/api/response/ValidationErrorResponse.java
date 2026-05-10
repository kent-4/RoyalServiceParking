package com.appdev.set.controller.api.response;

import java.util.Map;

public record ValidationErrorResponse(String message, Map<String, String> fieldErrors) {

    public static ValidationErrorResponse of(String message, Map<String, String> fieldErrors) {
        return new ValidationErrorResponse(message, fieldErrors);
    }
}
