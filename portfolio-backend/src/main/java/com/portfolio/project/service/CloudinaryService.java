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
            String originalFilename = file.getOriginalFilename();

            String extension = "";
            String contentType = file.getContentType();
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

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

                if (contentType != null && contentType.equals("application/pdf")) {
                    resourceType = "image";
                } else {
                    resourceType = "raw";
                }
            }

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType,
                    "public_id", publicId,
                    "overwrite", false,
                    "use_filename", true,
                    "unique_filename", true
            );

            if (resourceType.equals("image") && contentType != null && contentType.equals("application/pdf")) {
                uploadParams.put("format", "pdf");
            }

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    uploadParams
            );

            String url = uploadResult.get("secure_url").toString();
            String uploadedPublicId = uploadResult.get("public_id").toString();

            System.out.println("📤 Uploaded URL: " + url);
            System.out.println("📤 Public ID: " + uploadedPublicId);
            System.out.println("📤 Resource Type: " + resourceType);

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
                resourceType = "image";
            } else if (publicId.contains("/audio/")) {
                resourceType = "video";
            }

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.asMap("resource_type", resourceType)
            );

        } catch (Exception e) {
            System.err.println("Delete failed: " + e.getMessage());
            try {
                cloudinary.uploader().destroy(
                        publicId,
                        ObjectUtils.asMap("resource_type", "raw")
                );
            } catch (Exception ex) {
                throw new IllegalStateException("File delete failed: " + ex.getMessage());
            }
        }
    }
}