<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Validator; 

class UserController extends Controller
{
    public function create(Request $request)
    {
        // Ukoliko korisnik sa tim emailom vec postoji, vrati poruku
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json(['error' => 'Korisnik sa ovim emailom već postoji.'], 409); // HTTP 409 Conflict
        }

        // Validacija podataka
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'school' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', // password_confirmation
        ]);

        // Ako validacija nije prošla
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Kreiranje korisnika
        $user = User::create([
            'name' => $request->name,
            'surname' => $request->surname,
            'school' => $request->school,
            'city' => $request->city,
            'email' => $request->email,
            'password' => bcrypt($request->password), // enkriptovanje lozinke
            'nickname' => $request->nickname,
        ]);

        return response()->json(['user' => $user], 201); // vrati novog korisnika 
    }

    public function getUserById($id)
    {
        // Pronađi korisnika po ID-u
        $user = User::find($id);

        // Ako korisnik ne postoji, vrati grešku
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        // Vratiti podatke o korisniku
        return response()->json($user, 200);
    }
}
