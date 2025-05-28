<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use App\Models\User;
use Carbon\Carbon;
use App\Providers\PhpMailerServiceProvider;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class ForgotPasswordController extends Controller
{
    public function sendResetLink(Request $request)
    {
        $frontendUrl = env('FRONTEND_URL', 'http://localhost:4200');
        $user = DB::table('users')->where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Ne postoji korisnik sa unetim emailom.'], 404);
        }
        //$request->validate(['email' => 'required|email|exists:users,email']);

        $token = Str::random(60);
        $hashedToken = Hash::make($token);
        $email = $request->email;

        DB::table('password_reset')->updateOrInsert(
            ['email' => $email],
            ['token' => $token, 'created_at' => now()] 
        );

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com'; // SMTP server
            $mail->SMTPAuth   = true;
            $mail->Username   = 'bezgranicakengur@gmail.com'; // SMTP korisnik
            $mail->Password   = 'duqv cwoo logk ftoo'; // SMTP lozinka
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('bezgranicakengur@gmail.com', 'IMI MathCode Duel');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = 'Resetovanje lozinke';
            $mail->Body = "Kliknite na link da resetujete lozinku: <a href='{$frontendUrl}/new-password/$token?email=$email'>Resetuj lozinku</a>";


            $mail->send();
            return response()->json(['message' => 'Link za resetovanje lozinke je poslat na email.']);
        } catch (Exception $e) {
            return response()->json(['error' => 'Greška prilikom slanja emaila: ' . $mail->ErrorInfo], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'token' => 'required',
            'password' => 'required|min:6|confirmed',
        ]);

        $record = DB::table('password_reset')->where('email', $request->email)->first();

        if (!$record || $request->token !== $record->token) {
            return response()->json(['error' => 'Nevažeći token!'], 400);
        }

        if (!$record) {
            return response()->json(['error' => 'Nevažeći token!'], 400);
        }

        $user = User::where('email', $record->email)->first();
        if (!$user) {
            return response()->json(['error' => 'Korisnik nije pronađen!'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        DB::table('password_reset')->where('email', $record->email)->delete();

        return response()->json(['message' => 'Lozinka uspešno resetovana.']);
    }
}
