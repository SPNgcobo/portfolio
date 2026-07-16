package com.portfolio.project.service;

import com.portfolio.project.dto.ContactMessageRequest;
import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class EmailService {

    private final Resend resend;

    @Value("${app.email.from:noreply@samkelongcobo.is-a.dev}")
    private String fromEmail;

    @Value("${app.email.admin:samkelop.dev@gmail.com}")
    private String adminEmail;

    @Value("${app.email.webapp-url:https://samkelongcobo.is-a.dev}")
    private String webappUrl;

    public EmailService(Resend resend) {
        this.resend = resend;
    }

    /*
     * CONTACT EMAIL TO ADMIN
     */
    public void sendContactEmail(ContactMessageRequest request) throws ResendException {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(adminEmail)
                .subject("Portfolio Contact: " + request.getSubject())
                .html(buildContactEmailHtml(request))
                .build();

        resend.emails().send(params);
        log.info("✅ Contact email sent from: {}", request.getEmail());
    }

    /*
     * AUTO REPLY TO USER
     */
    public void sendAutoReply(ContactMessageRequest request) throws ResendException {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(request.getEmail())
                .subject("Thank you for contacting me")
                .html(buildAutoReplyHtml(request))
                .build();

        resend.emails().send(params);
        log.info("✅ Auto-reply sent to: {}", request.getEmail());
    }

    /*
     * COMMENT MODERATION ALERT TO ADMIN
     */
    public void sendModerationAlert(String content, String authorEmail, String projectTitle) throws ResendException {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(adminEmail)
                .subject("New Comment Awaiting Moderation")
                .html(buildModerationAlertHtml(content, authorEmail, projectTitle))
                .build();

        resend.emails().send(params);
        log.info("✅ Moderation alert sent for comment by: {}", authorEmail);
    }

    /*
     * ACCOUNT DELETION CONFIRMATION EMAIL TO USER
     */
    public void sendAccountDeletionConfirmation(String email, String username) throws ResendException {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(email)
                .subject("Account Deletion Confirmation - Samkelo Ngcobo Portfolio")
                .html(buildAccountDeletionHtml(username))
                .build();

        resend.emails().send(params);
        log.info("✅ Account deletion confirmation sent to: {}", email);
    }

    /*
     * ACCOUNT DELETION NOTIFICATION TO ADMIN
     */
    public void sendAccountDeletionNotification(String email, String username, String reason, String feedback) throws ResendException {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(adminEmail)
                .subject("Account Deleted: " + email)
                .html(buildAccountDeletionNotificationHtml(username, email, reason, feedback))
                .build();

        resend.emails().send(params);
        log.info("✅ Account deletion notification sent to admin for: {}", email);
    }

    /*
     * PASSWORD RESET EMAIL TO USER
     */
    public void sendPasswordResetEmail(String email, String resetToken) throws ResendException {
        String resetUrl = webappUrl + "/reset-password?token=" + resetToken;

        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(email)
                .subject("Reset Your Password - Samkelo Ngcobo Portfolio")
                .html(buildPasswordResetHtml(resetUrl))
                .build();

        resend.emails().send(params);
        log.info("✅ Password reset email sent to: {}", email);
    }

    /*
     * WELCOME EMAIL TO NEW USER
     */
    public void sendWelcomeEmail(String email, String username) throws ResendException {
        CreateEmailOptions params = CreateEmailOptions.builder()
                .from(fromEmail)
                .to(email)
                .subject("Welcome to Samkelo Ngcobo's Portfolio!")
                .html(buildWelcomeEmailHtml(username))
                .build();

        resend.emails().send(params);
        log.info("✅ Welcome email sent to: {}", email);
    }

    // ==================== HTML BUILDERS ====================

    private String buildContactEmailHtml(ContactMessageRequest request) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6366f1;">New Portfolio Contact</h2>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 12px;">
                    <p><strong>Name:</strong> %s</p>
                    <p><strong>Email:</strong> %s</p>
                    <p><strong>Subject:</strong> %s</p>
                    <hr style="margin: 20px 0;">
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">%s</p>
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    Sent from the portfolio contact form.
                </p>
                <p style="color: #6b7280; font-size: 12px;">
                    — Samkelo Ngcobo Portfolio
                </p>
            </body>
            </html>
            """.formatted(
                escapeHtml(request.getName()),
                escapeHtml(request.getEmail()),
                escapeHtml(request.getSubject()),
                escapeHtml(request.getMessage())
        );
    }

    private String buildAutoReplyHtml(ContactMessageRequest request) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6366f1;">Hello %s!</h2>
                <p>Thank you for reaching out to me.</p>
                <p>I have received your message and will get back to you as soon as possible (usually within 24-48 hours).</p>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; color: #4b5563;"><strong>Your message:</strong></p>
                    <p style="margin: 10px 0 0 0; white-space: pre-wrap;">%s</p>
                </div>
                <p>In the meantime, you can:</p>
                <ul>
                    <li>Check out my <a href="https://github.com/SPNgcobo" style="color: #6366f1;">GitHub</a></li>
                    <li>Browse more <a href="https://samkelongcobo.is-a.dev/projects" style="color: #6366f1;">projects</a></li>
                </ul>
                <hr style="margin: 20px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                    Best regards,<br>
                    <strong>Samkelo Ngcobo</strong><br>
                    Full-stack Developer
                </p>
            </body>
            </html>
            """.formatted(
                escapeHtml(request.getName()),
                escapeHtml(request.getMessage())
        );
    }

    private String buildModerationAlertHtml(String content, String authorEmail, String projectTitle) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #f59e0b;">⚠️ New Comment Pending Moderation</h2>
                <div style="background: #fef3c7; padding: 20px; border-radius: 12px;">
                    <p><strong>Project:</strong> %s</p>
                    <p><strong>Author:</strong> %s</p>
                    <hr style="margin: 15px 0;">
                    <p><strong>Comment:</strong></p>
                    <p style="white-space: pre-wrap;">%s</p>
                </div>
                <p style="margin-top: 20px;">
                    <a href="https://samkelongcobo.is-a.dev/admin/comments" 
                       style="background: #6366f1; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">
                        Review Comment
                    </a>
                </p>
                <p style="color: #6b7280; font-size: 12px;">
                    — Samkelo Ngcobo Portfolio
                </p>
            </body>
            </html>
            """.formatted(
                escapeHtml(projectTitle),
                escapeHtml(authorEmail),
                escapeHtml(content)
        );
    }

    private String buildAccountDeletionHtml(String username) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6366f1;">Account Deletion Confirmation</h2>
                <p>Hello %s,</p>
                <p>This email confirms that your account has been successfully deleted from the <strong>Samkelo Ngcobo Portfolio</strong> website.</p>
                <div style="background: #fef3c7; padding: 15px; border-radius: 12px; margin: 20px 0;">
                    <p style="margin: 0; color: #92400e;">
                        <strong>⚠️ Important:</strong> All your personal data has been permanently removed from our systems.
                    </p>
                </div>
                <p>If you did not request this deletion, please contact us immediately.</p>
                <hr style="margin: 30px 0 20px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                    Best regards,<br>
                    <strong>Samkelo Ngcobo</strong><br>
                    Full-stack Developer
                </p>
            </body>
            </html>
            """.formatted(escapeHtml(username));
    }

    private String buildAccountDeletionNotificationHtml(String username, String email, String reason, String feedback) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #ef4444;">🗑️ Account Deleted</h2>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 12px;">
                    <p><strong>User:</strong> %s</p>
                    <p><strong>Email:</strong> %s</p>
                    <p><strong>Reason:</strong> %s</p>
                    %s
                </div>
                <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                    This account was permanently deleted from the system.
                </p>
                <p style="color: #6b7280; font-size: 12px;">
                    — Samkelo Ngcobo Portfolio
                </p>
            </body>
            </html>
            """.formatted(
                escapeHtml(username),
                escapeHtml(email),
                escapeHtml(reason),
                feedback.isEmpty() ? "" : "<p><strong>Feedback:</strong> " + escapeHtml(feedback) + "</p>"
        );
    }

    private String buildPasswordResetHtml(String resetUrl) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6366f1;">Password Reset Request</h2>
                <p>We received a request to reset your password for your Samkelo Ngcobo Portfolio account.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="%s" 
                       style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block;">
                        Reset Your Password
                    </a>
                </div>
                <p>This link will expire in <strong>15 minutes</strong> for security reasons.</p>
                <p>If you did not request this password reset, please ignore this email or contact support if you have concerns.</p>
                <hr style="margin: 30px 0 20px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="%s" style="color: #6366f1; word-break: break-all;">%s</a>
                </p>
                <p style="color: #6b7280; font-size: 12px;">
                    — Samkelo Ngcobo Portfolio Team
                </p>
            </body>
            </html>
            """.formatted(resetUrl, resetUrl, resetUrl);
    }

    private String buildWelcomeEmailHtml(String username) {
        return """
            <!DOCTYPE html>
            <html>
            <head><meta charset="UTF-8"></head>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #6366f1;">Welcome %s! 🎉</h2>
                <p>Thank you for creating an account on my portfolio website.</p>
                <p>You now have access to:</p>
                <ul>
                    <li>Comment on projects</li>
                    <li>Request access to private repositories</li>
                    <li>Receive updates about new projects</li>
                </ul>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="https://samkelongcobo.is-a.dev/projects" 
                       style="background: #6366f1; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px;">
                        Explore Projects
                    </a>
                </div>
                <p>If you have any questions, feel free to reach out through the contact form.</p>
                <hr style="margin: 30px 0 20px 0;">
                <p style="color: #6b7280; font-size: 12px;">
                    Best regards,<br>
                    <strong>Samkelo Ngcobo</strong>
                </p>
            </body>
            </html>
            """.formatted(escapeHtml(username));
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&#39;");
    }
}