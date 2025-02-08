<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Validator; 
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Events\ChallengeUser;

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

    public function getUserId(Request $request)
    {
        // Dohvata trenutno autentifikovanog korisnika
        $user = $request->user();

        // Vraća korisničke podatke
        return response()->json([
            'id' => $user->id,
        ], 200);
    }

    public function searchUsers(Request $request)
    {
        $userAuth = Auth::user();

        if (!$userAuth) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        $searchTerm = $request->query('nickname');

        $users = User::where('nickname', 'like', '%' . $searchTerm . '%')
                 ->where('id', '!=', $userAuth->id) // Isključivanje trenutno prijavljenog korisnika
                 ->get();

        if ($users->isEmpty()) {
            return response()->json(['error' => 'Korisnik sa tim korisničkim imenom nije pronađen.'], 404);
        }
    
        return response()->json($users);
    }

    public function updateUserProfile(Request $request)
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'User not authenticated'], 401);
        }

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:2048',
            'nickname' => 'required|string|min:4|max:255',
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'school' => 'required|string|max:255',
            'city' => 'required|string|max:255',
        ]);

        // Provera da li već postoji korisnik sa istim nadimkom
        if (User::where('nickname', $request->nickname)->where('id', '!=', $user->id)->exists()) {
            return response()->json(['error' => 'Nickname već postoji.'], 400);
        }

        if ($user->profile_picture && basename($user->profile_picture) !== 'default_profile_picture.png') {
            $oldImagePath = public_path($user->profile_picture); 
    
            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);  // Brisanje stare slike
            }
        }

        $imageName = time() . '.' . $request->profile_picture->extension();
        $request->profile_picture->storeAs('public/profile_images', $imageName);

        $user->profile_picture = 'storage/profile_images/' . $imageName;

        $user->nickname = $request->nickname;
        $user->name = $request->name;
        $user->surname = $request->surname;
        $user->school = $request->school;
        $user->city = $request->city;

        $user->save();

        return response()->json(['message' => 'User profile updated successfully!']);
    }

    public function getUsers(Request $request)
    {
        $userAuth = Auth::user();

        if (!$userAuth) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        $users = User::where('id', '!=', $userAuth->id)
                     ->select('id', 'name', 'nickname', 'profile_picture', 'surname', 'school', 'city', 'email') 
                     ->get()
                     ->map(function ($user) {
                        $user->is_online = $user->is_online; 
                        return $user;
                    });

        return response()->json($users);
    }

    public function setOnline()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        // Dohvatanje trenutnih online korisnika
        $onlineUsers = cache()->get('online_users', []);
        //Log::info("UPRAVO SE PRIJAVIO KORISNIK, PRE NJEGA SU ONLINE BILI:", ['onlineUsers' => $onlineUsers]);

        // Dodavanje novog korisnika u listu
        if (!in_array($user->id, $onlineUsers)) {
            $onlineUsers[] = $user->id;
        }

        // Ažuriranje liste u cache-u
        cache()->put('online_users', $onlineUsers, now()->addMinutes(30));
        //sleep(1);

        // Emitovanje ažurirane liste online korisnika
        broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers));
        //Log::info("Emitovan OnlineUsersUpdated event nakon prijave", ['onlineUsers' => $onlineUsers]);

        return response()->json(['message' => 'Korisnik je online']);
    }


    public function setOffline()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        $onlineUsers = cache()->get('online_users', []);
        $onlineUsers = array_diff($onlineUsers, [$user->id]); 

        cache()->put('online_users', $onlineUsers, now()->addMinutes(30));

        // Emituj događaj kada se korisnik odjavi
        broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers));
        //Log::info("Emitovan OnlineUsersUpdated event (setOffline)", ['onlineUsers' => $onlineUsers]);

        return response()->json(['message' => 'Korisnik je offline']);
    }

    public function getOnlineUsers()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        // Dohvatanje svih online korisnika iz cache-a
        $onlineUserIds = cache()->get('online_users', []);

        // Dohvatanje podataka o online korisnicima
        $onlineUsers = User::whereIn('id', $onlineUserIds)
                            ->select('id', 'name', 'nickname', 'profile_picture', 'surname', 'school', 'city')
                            ->get();

        return response()->json($onlineUsers);
    }

    public function sendChallenge(Request $request)
    {
        $data = $request->validate([
            'challenger_name' => 'required|string',
            'opponent_id' => 'required|integer',
            'category' => 'required|string',
            'class' => 'required|string',
        ]);

        $challenger = auth()->user();
        if (!$challenger) {
            return response()->json(['error' => 'Challenger not found'], 404);
        }

        broadcast(new ChallengeUser(
            $data['challenger_name'], 
            $challenger->id, 
            $data['opponent_id'],
            $data['category'], 
            $data['class'],
            $challenger->profile_picture 
        ))->toOthers();

        return response()->json([
            'message' => 'Challenge sent successfully!',
            'challenger_name' => $data['challenger_name'],
            'challenger_id' => $challenger->id,
            'opponent_id' => $data['opponent_id'],
            'category' => $data['category'],
            'class' => $data['class'],
            'profile_picture' => $challenger->profile_picture
        ]);
    }

    public function rejectChallenge(Request $request)
    {
        $data = $request->validate([
            'challenger_id' => 'required|integer',
            'opponent_nickname' => 'required|string',
        ]);

        broadcast(new ChallengeRejected($data['challenger_id'], $data['opponent_nickname']));

        return response()->json(['message' => 'Challenge rejected']);
    }

}
