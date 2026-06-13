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
    public UploadResponse upload(MultipartFile file) {
        validator.validate(file);

        try {
            String folder = "portfolio/media";
            String resourceType = "auto";
            String publicId = UUID.randomUUID().toString();

            // Determine folder and resource type based on file type
            if (validator.isImage(file)) {
                folder = "portfolio/images";
                resourceType = "image";
            } else if (validator.isVideo(file)) {
                folder = "portfolio/videos";
                resourceType = "video";
            } else if (validator.isAudio(file)) {
                folder = "portfolio/audio";
                resourceType = "video";
            } else if (validator.isDocument(file)) {
                folder = "portfolio/documents";
                resourceType = "raw";
            }

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", folder,
                            "resource_type", resourceType,
                            "public_id", publicId,
                            "overwrite", false
                    )
            );

            String url = uploadResult.get("secure_url").toString();
            String uploadedPublicId = uploadResult.get("public_id").toString();

            return new UploadResponse(url, uploadedPublicId);

        } catch (IOException e) {
            throw new IllegalStateException("File upload failed: " + e.getMessage());
        }
    }

    /*
     * DELETE FILE
     */
    public void delete(String publicId) {
        try {
            String resourceType = "image";
            if (publicId.contains("/videos/")) {
                resourceType = "video";
            } else if (publicId.contains("/documents/")) {
                resourceType = "raw";
            } else if (publicId.contains("/audio/")) {
                resourceType = "video";
            }

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", resourceType)
            );

        } catch (Exception e) {
            throw new IllegalStateException("File delete failed: " + e.getMessage());
        }
    }
}