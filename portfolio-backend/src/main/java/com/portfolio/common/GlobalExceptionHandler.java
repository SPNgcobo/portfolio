package com.portfolio.common;

import com.portfolio.common.exceptions.AuthenticationException;
import com.portfolio.common.exceptions.AuthorizationException;
import com.portfolio.common.exceptions.ResourceNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.resource.NoResourceFoundException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /*
     * RESOURCE NOT FOUND
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse<Object>>
    handleNotFound(
            ResourceNotFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new ApiResponse<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }

    /*
     * AUTHENTICATION
     */
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>>
    handleAuthentication(
            AuthenticationException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(
                        new ApiResponse<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }

    /*
     * AUTHORIZATION
     */
    @ExceptionHandler(AuthorizationException.class)
    public ResponseEntity<ApiResponse<Object>>
    handleAuthorization(
            AuthorizationException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        new ApiResponse<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }

    /*
     * ACCESS DENIED
     */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>>
    handleAccessDenied(
            AccessDeniedException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(
                        new ApiResponse<>(
                                false,
                                "Access denied",
                                null
                        )
                );
    }

    /*
     * ILLEGAL STATE
     */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ApiResponse<Object>>
    handleIllegalState(
            IllegalStateException ex
    ) {

        return ResponseEntity
                .badRequest()
                .body(
                        new ApiResponse<>(
                                false,
                                ex.getMessage(),
                                null
                        )
                );
    }

    /*
     * ROUTE NOT FOUND
     */
    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Object>>
    handleNoResourceFound(
            NoResourceFoundException ex
    ) {

        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(
                        new ApiResponse<>(
                                false,
                                "Endpoint not found",
                                null
                        )
                );
    }

    /*
     * UNKNOWN ERRORS
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>>
    handleException(
            Exception ex
    ) {

        /*
         * PRINT REAL ERROR
         */
        ex.printStackTrace();

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(
                        new ApiResponse<>(
                                false,

                                /*
                                 * RETURN REAL ERROR MESSAGE
                                 * FOR DEVELOPMENT DEBUGGING
                                 */
                                ex.getMessage(),

                                null
                        )
                );
    }
}