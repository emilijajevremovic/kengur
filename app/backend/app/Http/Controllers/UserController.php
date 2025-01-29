<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Validator; 
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    public function create(Request $request)
    {
        // Ukoliko korisnik sa tim emailom vec postoji, vrati poruku
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json(['error' => 'Korisnik sa ovim emailom već postoji.'], 409); 
        }

        $existingNickname = User::where('nickname', $request->nickname)->first();
        if ($existingNickname) {
            return response()->json(['error' => 'Korisnik sa ovim nadimkom već postoji.'], 410); 
        }

        // Validacija podataka
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'school' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', 
            'nickname' => 'required|string|min:4|max:255'
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
            'profile_picture' => 'storage/profile_images/default_profile_picture.png',
        ]);

        return response()->json(['user' => $user], 201); // vrati novog korisnika 
    }

    public function login(Request $request)
    {
        // Validacija unetih podataka
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        // Pokušaj autentifikacije
        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Neispravan email ili šifra.'], 401); // Unauthorized
        }

        // Kreiranje tokena za autentifikaciju
        $token = $user->createToken('UserLoginToken')->plainTextToken;

        return response()->json(['token' => $token], 200);
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

    public function getUser(Request $request)
    {
        // Dohvata trenutno autentifikovanog korisnika
        $user = $request->user();

        // Vraća korisničke podatke
        return response()->json([
            'success' => true,
            'user' => $user,
        ], 200);
    }

    public function searchUsers(Request $request)
    {
        $userAuth = Auth::user();

        if (!$userAuth) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        $searchTerm = $request->query('nickname');

        $user = User::where('nickname', 'like', '%' . $searchTerm . '%')->first();

        if (!$user) {
            return response()->json(['error' => 'Korisnik sa tim nickname-om nije pronađen.'], 404);
        }

        return response()->json($user);
    }

    public function updateUserProfile(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'nickname' => 'required|string|max:255',
        ]);

        if ($user->profile_picture) {
            Storage::delete('public/' . $user->profile_picture);
        }

        $imageName = time() . '.' . $request->profile_picture->extension();
        $request->profile_picture->storeAs('public/profile_images', $imageName);

        $user->profile_picture = 'storage/profile_images/' . $imageName;

        $user->nickname = $request->nickname;

        $user->save();

        return response()->json(['message' => 'User profile updated successfully!']);
    }


}
