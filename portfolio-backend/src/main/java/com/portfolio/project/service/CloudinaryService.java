package com.portfolio.project.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.portfolio.project.dto.UploadResponse;
import com.portfolio.project.validation.FileUploadValidator;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    private final FileUploadValidator validator;

    public CloudinaryService(
            Cloudinary cloudinary,
            FileUploadValidator validator
    ) {

        this.cloudinary = cloudinary;
        this.validator = validator;
    }

    /*
     * UPLOAD FILE
     */
    public UploadResponse upload(
            MultipartFile file
    ) {

        validator.validate(file);

        try {

            boolean isVideo =
                    validator.isVideo(file);

            String resourceType =
                    isVideo
                            ? "video"
                            : "image";

            String folder =
                    isVideo
                            ? "portfolio/videos"
                            : "portfolio/images";

            String publicId =
                    UUID.randomUUID().toString();

            Map uploadResult =
                    cloudinary.uploader().upload(
                            file.getBytes(),
                            ObjectUtils.asMap(
                                    "folder", folder,
                                    "resource_type", resourceType,
                                    "public_id", publicId,
                                    "overwrite", false
                            )
                    );

            String url =
                    uploadResult
                            .get("secure_url")
                            .toString();

            String uploadedPublicId =
                    uploadResult
                            .get("public_id")
                            .toString();

            return new UploadResponse(
                    url,
                    uploadedPublicId
            );

        } catch (IOException e) {

            throw new IllegalStateException(
                    "File upload failed"
            );
        }
    }

    /*
     * DELETE FILE
     */
    public void delete(
            String publicId
    ) {

        try {

            String resourceType =
                    publicId.contains("/videos/")
                            ? "video"
                            : "image";

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap(
                            "resource_type",
                            resourceType
                    )
            );

        } catch (Exception e) {

            throw new IllegalStateException(
                    "File delete failed"
            );
        }
    }
}