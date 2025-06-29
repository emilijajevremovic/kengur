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

    public function sendResetCode(Request $request)
    {
        $email = $request->email;
        $code = $request->code;

        $user = DB::table('users')->where('email', $email)->first();

        if (!$user) {
            return response()->json(['error' => 'Ne postoji korisnik sa unetim emailom.'], 404);
        }

        $mail = new PHPMailer(true);
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com';
            $mail->SMTPAuth   = true;
            $mail->Username   = 'imimathcodeduel@gmail.com';
            $mail->Password   = 'mwrp rbhc time owjm';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port       = 587;

            $mail->setFrom('imimathcodeduel@gmail.com', 'IMI MathCode Duel');
            $mail->addAddress($email);
            $mail->isHTML(true);
            $mail->Subject = 'Verifikacioni kod za reset lozinke';
            $mail->Body = "Vaš verifikacioni kod za resetovanje lozinke je: <b>{$code}</b>";

            $mail->send();
            return response()->json(['message' => 'Verifikacioni kod je poslat na email.']);
        } catch (Exception $e) {
            return response()->json(['error' => 'Greška prilikom slanja emaila: ' . $mail->ErrorInfo], 500);
        }
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'Korisnik nije pronađen!'], 404);
        }

        $user->password = Hash::make($request->password);
        $user->save();

        return response()->json(['message' => 'Lozinka uspešno resetovana.']);
    }

}
