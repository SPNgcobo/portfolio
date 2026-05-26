package com.portfolio.common.exceptions;

public class UnsupportedFileTypeException
        extends RuntimeException {

    public UnsupportedFileTypeException(
            String message
    ) {

        super(message);
    }
}