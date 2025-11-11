package com.codesolutions.pmt.service;

import com.codesolutions.pmt.entity.Invitation;
import com.codesolutions.pmt.entity.Task;
import com.codesolutions.pmt.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Service for sending professional HTML emails
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    
    private final JavaMailSender mailSender;
    
    @Value("${mail.from:aminedibsn@gmail.com}")
    private String fromEmail;
    
    /**
     * Send task assignment notification with professional HTML template
     */
    public void sendTaskAssignmentNotification(User user, Task task) {
        try {
            log.info("Sending task assignment notification to: {}", user.getEmail());
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("🎯 Nouvelle tâche assignée : " + task.getTitle());
            
            String htmlContent = buildTaskAssignmentEmail(user, task);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("Task assignment notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send task assignment notification", e);
            // Don't throw exception - email failure shouldn't break the flow
        }
    }
    
    /**
     * Send task status change notification
     */
    public void sendTaskStatusChangeNotification(User user, Task task, String oldStatus, String newStatus) {
        try {
            log.info("Sending task status change notification to: {}", user.getEmail());
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(user.getEmail());
            helper.setSubject("📋 Statut de tâche mis à jour : " + task.getTitle());
            
            String htmlContent = buildTaskStatusChangeEmail(user, task, oldStatus, newStatus);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("Task status change notification sent successfully");
        } catch (Exception e) {
            log.error("Failed to send task status change notification", e);
        }
    }
    
    private String buildTaskAssignmentEmail(User user, Task task) {
        String priorityColor = getPriorityColor(task.getPriority() != null ? task.getPriority().toString() : "LOW");
        String priorityBadge = task.getPriority() != null ? task.getPriority().toString() : "Not set";
        
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <meta charset='UTF-8'>" +
            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px;'>" +
            "  <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);'>" +
            "    " +
            "    <!-- Header -->" +
            "    <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;'>" +
            "      <div style='background: white; width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;'>" +
            "        <span style='font-size: 48px;'>🎯</span>" +
            "      </div>" +
            "      <h1 style='color: white; margin: 0; font-size: 28px; font-weight: bold;'>Nouvelle tâche assignée !</h1>" +
            "      <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;'>Une nouvelle tâche vous attend</p>" +
            "    </div>" +
            "    " +
            "    <!-- Content -->" +
            "    <div style='padding: 40px 30px;'>" +
            "      <p style='color: #374151; font-size: 16px; margin: 0 0 30px;'>Bonjour <strong>" + user.getFirstName() + "</strong>,</p>" +
            "      " +
            "      <!-- Task Card -->" +
            "      <div style='background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 16px; padding: 24px; margin-bottom: 30px;'>" +
            "        <h2 style='color: #1f2937; margin: 0 0 20px; font-size: 22px; font-weight: bold;'>" + task.getTitle() + "</h2>" +
            "        " +
            "        <!-- Task Details -->" +
            "        <table style='width: 100%; border-collapse: collapse;'>" +
            "          <tr>" +
            "            <td style='padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1);'>" +
            "              <span style='color: #6b7280; font-size: 14px;'>📁 Projet</span>" +
            "            </td>" +
            "            <td style='padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1); text-align: right;'>" +
            "              <strong style='color: #1f2937; font-size: 14px;'>" + task.getProject().getName() + "</strong>" +
            "            </td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style='padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1);'>" +
            "              <span style='color: #6b7280; font-size: 14px;'>🚦 Statut</span>" +
            "            </td>" +
            "            <td style='padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1); text-align: right;'>" +
            "              <span style='background: #dbeafe; color: #1e40af; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;'>" + task.getStatus() + "</span>" +
            "            </td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style='padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1);'>" +
            "              <span style='color: #6b7280; font-size: 14px;'>⚡ Priorité</span>" +
            "            </td>" +
            "            <td style='padding: 12px 0; border-bottom: 1px solid rgba(0,0,0,0.1); text-align: right;'>" +
            "              <span style='background: " + priorityColor + "; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;'>" + priorityBadge + "</span>" +
            "            </td>" +
            "          </tr>" +
            "          <tr>" +
            "            <td style='padding: 12px 0;'>" +
            "              <span style='color: #6b7280; font-size: 14px;'>📅 Date d'échéance</span>" +
            "            </td>" +
            "            <td style='padding: 12px 0; text-align: right;'>" +
            "              <strong style='color: #1f2937; font-size: 14px;'>" + (task.getDueDate() != null ? task.getDueDate().toString() : "Non définie") + "</strong>" +
            "            </td>" +
            "          </tr>" +
            "        </table>" +
            "        " +
            "        <!-- Description -->" +
            "        <div style='margin-top: 20px; padding: 16px; background: white; border-radius: 12px;'>" +
            "          <p style='color: #6b7280; margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase;'>Description</p>" +
            "          <p style='color: #374151; margin: 0; font-size: 14px; line-height: 1.6;'>" + (task.getDescription() != null ? task.getDescription() : "Aucune description fournie") + "</p>" +
            "        </div>" +
            "      </div>" +
            "      " +
            "      <!-- CTA Button -->" +
            "      <div style='text-align: center; margin: 30px 0;'>" +
            "        <a href='http://localhost:4200/projects/" + task.getProject().getId() + "' style='display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);'>Voir la tâche dans PMT →</a>" +
            "      </div>" +
            "      " +
            "      <p style='color: #6b7280; font-size: 14px; margin: 20px 0 0; line-height: 1.6;'>Si vous avez des questions sur cette tâche, veuillez contacter votre chef de projet.</p>" +
            "    </div>" +
            "    " +
            "    <!-- Footer -->" +
            "    <div style='background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;'>" +
            "      <p style='color: #9ca3af; font-size: 12px; margin: 0 0 10px;'>© 2025 PMT - Outil de gestion de projets</p>" +
            "      <p style='color: #9ca3af; font-size: 12px; margin: 0;'>Gestion professionnelle de projets et tâches</p>" +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>";
    }
    
    private String buildTaskStatusChangeEmail(User user, Task task, String oldStatus, String newStatus) {
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <meta charset='UTF-8'>" +
            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px;'>" +
            "  <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);'>" +
            "    " +
            "    <!-- Header -->" +
            "    <div style='background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;'>" +
            "      <div style='background: white; width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;'>" +
            "        <span style='font-size: 48px;'>📋</span>" +
            "      </div>" +
            "      <h1 style='color: white; margin: 0; font-size: 28px; font-weight: bold;'>Statut de tâche mis à jour</h1>" +
            "      <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;'>Votre tâche a progressé</p>" +
            "    </div>" +
            "    " +
            "    <!-- Content -->" +
            "    <div style='padding: 40px 30px;'>" +
            "      <p style='color: #374151; font-size: 16px; margin: 0 0 30px;'>Bonjour <strong>" + user.getFirstName() + "</strong>,</p>" +
            "      " +
            "      <p style='color: #6b7280; font-size: 14px; margin: 0 0 20px;'>Le statut de votre tâche a été mis à jour :</p>" +
            "      " +
            "      <!-- Task Info -->" +
            "      <div style='background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); border-radius: 16px; padding: 24px; margin-bottom: 30px;'>" +
            "        <h2 style='color: #1f2937; margin: 0 0 20px; font-size: 20px;'>" + task.getTitle() + "</h2>" +
            "        " +
            "        <!-- Status Change -->" +
            "        <div style='background: white; border-radius: 12px; padding: 20px; margin-bottom: 16px;'>" +
            "          <div style='display: flex; align-items: center; justify-content: space-between;'>" +
            "            <div style='text-align: center; flex: 1;'>" +
            "              <p style='color: #6b7280; font-size: 12px; margin: 0 0 8px;'>Statut précédent</p>" +
            "              <span style='background: #fee2e2; color: #991b1b; padding: 6px 16px; border-radius: 12px; font-size: 13px; font-weight: 600;'>" + oldStatus + "</span>" +
            "            </div>" +
            "            <div style='font-size: 24px; margin: 0 20px;'>→</div>" +
            "            <div style='text-align: center; flex: 1;'>" +
            "              <p style='color: #6b7280; font-size: 12px; margin: 0 0 8px;'>Nouveau statut</p>" +
            "              <span style='background: #dcfce7; color: #166534; padding: 6px 16px; border-radius: 12px; font-size: 13px; font-weight: 600;'>" + newStatus + "</span>" +
            "            </div>" +
            "          </div>" +
            "        </div>" +
            "        " +
            "        <p style='color: #6b7280; margin: 0; font-size: 13px;'><strong>Projet :</strong> " + task.getProject().getName() + "</p>" +
            "      </div>" +
            "      " +
            "      <!-- CTA Button -->" +
            "      <div style='text-align: center; margin: 30px 0;'>" +
            "        <a href='http://localhost:4200/projects/" + task.getProject().getId() + "' style='display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);'>Voir les détails →</a>" +
            "      </div>" +
            "    </div>" +
            "    " +
            "    <!-- Footer -->" +
            "    <div style='background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;'>" +
            "      <p style='color: #9ca3af; font-size: 12px; margin: 0 0 10px;'>© 2025 PMT - Project Management Tool</p>" +
            "      <p style='color: #9ca3af; font-size: 12px; margin: 0;'>Stay productive, stay organized</p>" +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>";
    }
    
    private String getPriorityColor(String priority) {
        switch (priority.toUpperCase()) {
            case "HIGH":
                return "#dc2626";
            case "MEDIUM":
                return "#f59e0b";
            case "LOW":
                return "#10b981";
            default:
                return "#6b7280";
        }
    }
    
    /**
     * Send professional invitation email with HTML template
     */
    public void sendInvitationEmail(Invitation invitation) {
        try {
            log.info("Sending invitation email to: {}", invitation.getEmail());
            
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(invitation.getEmail());
            helper.setSubject("✉️ Invitation au projet : " + invitation.getProject().getName());
            
            String htmlContent = buildInvitationEmail(invitation);
            helper.setText(htmlContent, true);
            
            mailSender.send(mimeMessage);
            log.info("Invitation email sent successfully");
        } catch (Exception e) {
            log.error("Failed to send invitation email", e);
            // Don't throw exception - email failure shouldn't break the flow
        }
    }
    
    private String buildInvitationEmail(Invitation invitation) {
        String roleColor = getRoleColor(invitation.getRole().toString());
        
        return "<!DOCTYPE html>" +
            "<html>" +
            "<head>" +
            "  <meta charset='UTF-8'>" +
            "  <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "</head>" +
            "<body style='margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px 20px;'>" +
            "  <div style='max-width: 600px; margin: 0 auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.3);'>" +
            "    " +
            "    <!-- Header -->" +
            "    <div style='background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px 30px; text-align: center;'>" +
            "      <div style='background: white; width: 80px; height: 80px; border-radius: 20px; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;'>" +
            "        <span style='font-size: 48px;'>✉️</span>" +
            "      </div>" +
            "      <h1 style='color: white; margin: 0; font-size: 28px; font-weight: bold;'>Vous êtes invité !</h1>" +
            "      <p style='color: rgba(255,255,255,0.9); margin: 10px 0 0; font-size: 16px;'>Rejoignez l'équipe et commencez à collaborer</p>" +
            "    </div>" +
            "    " +
            "    <!-- Content -->" +
            "    <div style='padding: 40px 30px;'>" +
            "      <p style='color: #374151; font-size: 16px; margin: 0 0 30px;'>Bonjour,</p>" +
            "      " +
            "      <p style='color: #6b7280; font-size: 14px; margin: 0 0 30px; line-height: 1.6;'>" +
            "        <strong>" + invitation.getInvitedBy().getFullName() + "</strong> vous a invité à rejoindre le projet <strong>" + invitation.getProject().getName() + "</strong>." +
            "      </p>" +
            "      " +
            "      <!-- Project Card -->" +
            "      <div style='background: linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%); border-radius: 16px; padding: 24px; margin-bottom: 30px; border: 2px solid #fbcfe8;'>" +
            "        <h2 style='color: #1f2937; margin: 0 0 16px; font-size: 20px; font-weight: bold;'>" + invitation.getProject().getName() + "</h2>" +
            "        " +
            "        <table style='width: 100%; border-collapse: collapse;'>" +
            "          <tr>" +
            "            <td style='padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.1);'>" +
            "              <span style='color: #6b7280; font-size: 14px;'>👤 Votre rôle</span>" +
            "            </td>" +
            "            <td style='padding: 10px 0; border-bottom: 1px solid rgba(0,0,0,0.1); text-align: right;'>" +
            "              <span style='background: " + roleColor + "; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;'>" + invitation.getRole() + "</span>" +
            "            </td>" +
            "          </tr>" +
            "        </table>" +
            "      </div>" +
            "      " +
            "      <!-- Invitation Token -->" +
            "      <div style='background: #f3f4f6; border-radius: 12px; padding: 20px; margin-bottom: 30px; border: 2px dashed #9ca3af;'>" +
            "        <p style='color: #6b7280; margin: 0 0 8px; font-size: 12px; font-weight: 600; text-transform: uppercase; text-align: center;'>Votre jeton d'invitation</p>" +
            "        <p style='color: #1f2937; margin: 0; font-size: 18px; font-weight: bold; text-align: center; font-family: monospace; letter-spacing: 2px;'>" + invitation.getToken() + "</p>" +
            "      </div>" +
            "      " +
            "      <!-- Instructions -->" +
            "      <div style='background: #eff6ff; border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #3b82f6;'>" +
            "        <p style='color: #1e40af; margin: 0 0 12px; font-size: 14px; font-weight: 600;'>📌 Comment accepter cette invitation :</p>" +
            "        <ol style='color: #1e3a8a; margin: 0; padding-left: 20px; font-size: 13px; line-height: 1.8;'>" +
            "          <li>Si vous n'avez pas de compte, <a href='http://localhost:4200/register' style='color: #2563eb; font-weight: 600;'>inscrivez-vous ici</a></li>" +
            "          <li>Rendez-vous sur la <a href='http://localhost:4200/invitations' style='color: #2563eb; font-weight: 600;'>page invitations</a></li>" +
            "          <li>Entrez votre jeton d'invitation</li>" +
            "          <li>Commencez à collaborer avec votre équipe !</li>" +
            "        </ol>" +
            "      </div>" +
            "      " +
            "      <!-- CTA Buttons -->" +
            "      <div style='text-align: center; margin: 30px 0;'>" +
            "        <a href='http://localhost:4200/register' style='display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 12px rgba(236, 72, 153, 0.4); margin: 0 10px;'>Créer un compte</a>" +
            "        <a href='http://localhost:4200/login' style='display: inline-block; background: white; color: #8b5cf6; text-decoration: none; padding: 16px 40px; border-radius: 12px; font-weight: bold; font-size: 16px; border: 2px solid #8b5cf6; margin: 0 10px;'>Se connecter</a>" +
            "      </div>" +
            "    </div>" +
            "    " +
            "    <!-- Footer -->" +
            "    <div style='background: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;'>" +
            "      <p style='color: #9ca3af; font-size: 12px; margin: 0 0 10px;'>© 2025 PMT - Project Management Tool</p>" +
            "      <p style='color: #9ca3af; font-size: 12px; margin: 0;'>Collaborate better, achieve more</p>" +
            "    </div>" +
            "  </div>" +
            "</body>" +
            "</html>";
    }
    
    private String getRoleColor(String role) {
        switch (role.toUpperCase()) {
            case "ADMIN":
                return "#dc2626";
            case "MEMBER":
                return "#2563eb";
            case "OBSERVER":
                return "#059669";
            default:
                return "#6b7280";
        }
    }
}
