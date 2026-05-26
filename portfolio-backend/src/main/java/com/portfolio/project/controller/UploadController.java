package com.portfolio.project.controller;

import com.portfolio.common.ApiResponse;
import com.portfolio.project.dto.UploadResponse;
import com.portfolio.project.service.CloudinaryService;
import com.portfolio.security.RateLimitService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@CrossOrigin(origins = "*")
public class UploadController {

    private final CloudinaryService service;

    private final RateLimitService
            rateLimitService;

    public UploadController(
            CloudinaryService service,
            RateLimitService rateLimitService
    ) {

        this.service = service;

        this.rateLimitService =
                rateLimitService;
    }

    /*
     * UPLOAD FILE
     */
    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ApiResponse<UploadResponse> upload(

            @RequestParam("file")
            MultipartFile file,

            HttpServletRequest request
    ) {

        String ip =
                request.getRemoteAddr();

        /*
         * RATE LIMIT
         */
        boolean allowed =
                rateLimitService.isAllowed(
                        "UPLOAD_" + ip
                );

        if (!allowed) {

            throw new RuntimeException(
                    "Too many upload requests"
            );
        }

        return new ApiResponse<>(
                true,
                "File uploaded successfully",
                service.upload(file)
        );
    }

    /*
     * DELETE FILE
     */
    @DeleteMapping
    public ApiResponse<Void> delete(

            @RequestParam String publicId
    ) {

        service.delete(publicId);

        return new ApiResponse<>(
                true,
                "File deleted successfully",
                null
        );
    }
}