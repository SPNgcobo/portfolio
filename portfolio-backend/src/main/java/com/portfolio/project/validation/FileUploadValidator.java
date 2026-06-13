package com.portfolio.project.validation;

import com.portfolio.common.exceptions.FileTooLargeException;
import com.portfolio.common.exceptions.InvalidFileException;
import com.portfolio.common.exceptions.UnsupportedFileTypeException;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Component
public class FileUploadValidator {

    /*
     * 10MB
     */
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024;

    /*
     * ALLOWED IMAGE TYPES
     */
    private static final List<String> IMAGE_TYPES = List.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    /*
     * ALLOWED VIDEO TYPES
     */
    private static final List<String> VIDEO_TYPES = List.of(
            "video/mp4",
            "video/webm",
            "video/quicktime"
    );

    /*
     * ALLOWED DOCUMENT TYPES
     */
    private static final List<String> DOCUMENT_TYPES = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    /*
     * ALLOWED AUDIO TYPES
     */
    private static final List<String> AUDIO_TYPES = List.of(
            "audio/mpeg",
            "audio/mp4",
            "audio/wav",
            "audio/ogg",
            "audio/webm"
    );

    /*
     * VALIDATE
     */
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        // SIZE CHECK
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new FileTooLargeException("File exceeds 10MB limit");
        }

        // TYPE CHECK
        String contentType = file.getContentType();

        if (contentType == null) {
            throw new UnsupportedFileTypeException("Unknown file type");
        }

        boolean allowed = IMAGE_TYPES.contains(contentType)
                || VIDEO_TYPES.contains(contentType)
                || DOCUMENT_TYPES.contains(contentType)
                || AUDIO_TYPES.contains(contentType);

        if (!allowed) {
            throw new UnsupportedFileTypeException(
                    "Unsupported file type: " + contentType +
                            ". Allowed: images, videos, PDFs, documents, audio files"
            );
        }
    }

    /*
     * IMAGE CHECK
     */
    public boolean isImage(MultipartFile file) {
        return IMAGE_TYPES.contains(file.getContentType());
    }

    /*
     * VIDEO CHECK
     */
    public boolean isVideo(MultipartFile file) {
        return VIDEO_TYPES.contains(file.getContentType());
    }

    /*
     * DOCUMENT CHECK
     */
    public boolean isDocument(MultipartFile file) {
        return DOCUMENT_TYPES.contains(file.getContentType());
    }

    /*
     * AUDIO CHECK
     */
    public boolean isAudio(MultipartFile file) {
        return AUDIO_TYPES.contains(file.getContentType());
    }
}