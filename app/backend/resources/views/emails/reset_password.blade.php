<!DOCTYPE html>
<html lang="sr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Resetovanje lozinke</title>
</head>
<body>
    <p>Pozdrav,</p>
    <p>Kliknite na link ispod da resetujete vašu lozinku:</p>
    <p>
        <a href="{{ env('FRONTEND_URL') }}/new-password?token={{ $token }}&email={{ $email }}">
            Resetuj lozinku
        </a>
    </p>
    <p>Ako niste zahtevali reset lozinke, ignorišite ovaj email.</p>
</body>
</html>
