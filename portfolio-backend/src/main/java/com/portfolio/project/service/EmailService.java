package com.portfolio.project.service;

import com.portfolio.project.dto.ContactMessageRequest;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final Resend resend;

    public EmailService(
            Resend resend
    ) {

        this.resend = resend;
    }

    /*
     * CONTACT EMAIL TO ADMIN
     */
    public void sendContactEmail(
            ContactMessageRequest request
    ) {

        try {

            CreateEmailOptions params =
                    CreateEmailOptions.builder()

                            .from("Portfolio <onboarding@resend.dev>")

                            .to("samkelop.dev@gmail.com")

                            .subject(
                                    "Portfolio Contact: "
                                            + request.getSubject()
                            )

                            .html(
                                    """
                                    <h2>New Portfolio Contact</h2>

                                    <p><strong>Name:</strong> %s</p>

                                    <p><strong>Email:</strong> %s</p>

                                    <p><strong>Message:</strong></p>

                                    <p>%s</p>
                                    """
                                            .formatted(
                                                    request.getName(),
                                                    request.getEmail(),
                                                    request.getMessage()
                                            )
                            )

                            .build();

            resend.emails().send(params);

        } catch (ResendException e) {

            throw new RuntimeException(
                    "Failed to send contact email"
            );
        }
    }

    /*
     * AUTO REPLY
     */
    public void sendAutoReply(
            ContactMessageRequest request
    ) {

        try {

            CreateEmailOptions params =
                    CreateEmailOptions.builder()

                            .from("Portfolio <onboarding@resend.dev>")

                            .to(request.getEmail())

                            .subject(
                                    "We received your message"
                            )

                            .html(
                                    """
                                    <h2>Hello %s</h2>

                                    <p>
                                    Thank you for contacting me.
                                    </p>

                                    <p>
                                    I received your message and
                                    will respond soon.
                                    </p>

                                    <br/>

                                    <p>
                                    - Samkelo Ngcobo
                                    </p>
                                    """
                                            .formatted(
                                                    request.getName()
                                            )
                            )

                            .build();

            resend.emails().send(params);

        } catch (ResendException e) {

            throw new RuntimeException(
                    "Failed to send auto reply"
            );
        }
    }

    /*
     * COMMENT MODERATION ALERT
     */
    public void sendModerationAlert(
            String content
    ) {

        try {

            CreateEmailOptions params =
                    CreateEmailOptions.builder()

                            .from("Portfolio <onboarding@resend.dev>")

                            .to("samkelop.dev@gmail.com")

                            .subject(
                                    "New Comment Awaiting Moderation"
                            )

                            .html(
                                    """
                                    <h2>Moderation Alert</h2>

                                    <p>
                                    A new comment requires approval:
                                    </p>

                                    <blockquote>
                                    %s
                                    </blockquote>
                                    """
                                            .formatted(content)
                            )

                            .build();

            resend.emails().send(params);

        } catch (ResendException e) {

            throw new RuntimeException(
                    "Failed to send moderation alert"
            );
        }
    }

    /*
     * PASSWORD RESET EMAIL
     */
    public void sendPasswordResetEmail(
            String email,
            String resetToken
    ) {

        try {

            String resetUrl =
                    "https://samkelongcobo.is-a.dev/reset-password?token="
                            + resetToken;

            CreateEmailOptions params =
                    CreateEmailOptions.builder()

                            .from("Portfolio <onboarding@resend.dev>")

                            .to(email)

                            .subject(
                                    "Reset Your Password"
                            )

                            .html(
                                    """
                                    <h2>Password Reset</h2>

                                    <p>
                                    You requested a password reset.
                                    </p>

                                    <p>
                                    Click the link below to reset your password:
                                    </p>

                                    <p>
                                    <a href="%s">
                                        Reset Password
                                    </a>
                                    </p>

                                    <p>
                                    This link expires in 15 minutes.
                                    </p>

                                    <br/>

                                    <p>
                                    If you did not request this,
                                    ignore this email.
                                    </p>
                                    """
                                            .formatted(
                                                    resetUrl
                                            )
                            )

                            .build();

            resend.emails().send(params);

        } catch (ResendException e) {

            throw new RuntimeException(
                    "Failed to send password reset email"
            );
        }
    }
}