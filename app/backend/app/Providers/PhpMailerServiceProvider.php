<?php

namespace App\Services;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class PhpMailerServiceProvider
{
    public function sendEmail($to, $subject, $body)
    {
        $mail = new PHPMailer(true);

        try {
            //Server settings
            $mail->isSMTP();
            $mail->Host = 'smtp.yourmailserver.com';  // Set SMTP server
            $mail->SMTPAuth = true;
            $mail->Username = 'your_email@example.com'; // SMTP username
            $mail->Password = 'your_email_password';  // SMTP password
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = 587;

            //Recipients
            $mail->setFrom('from_email@example.com', 'Mailer');
            $mail->addAddress($to);  // Add a recipient

            // Content
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}
