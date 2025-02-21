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
use App\Events\ChallengeRejected;
use App\Events\GameStarted;

class UserController extends Controller
{
    public function create(Request $request)
    {
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json(['error' => 'Korisnik sa ovim emailom već postoji.'], 409); 
        }

        $existingNickname = User::where('nickname', $request->nickname)->first();
        if ($existingNickname) {
            return response()->json(['error' => 'Korisnik sa ovim nadimkom već postoji.'], 410); 
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'school' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed', 
            'nickname' => 'required|string|min:4|max:255'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'surname' => $request->surname,
            'school' => $request->school,
            'city' => $request->city,
            'email' => $request->email,
            'password' => bcrypt($request->password),
            'nickname' => $request->nickname,
            'profile_picture' => 'storage/profile_images/default_profile_picture.png',
        ]);

        return response()->json(['user' => $user], 201); 
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        $user = User::where('email', $request->email)->first();
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['error' => 'Neispravan email ili šifra.'], 401); 
        }

        $token = $user->createToken('UserLoginToken')->plainTextToken;

        return response()->json(['token' => $token], 200);
    }

    public function getUserById($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json($user, 200);
    }

    public function getUser(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'success' => true,
            'user' => $user,
        ], 200);
    }

    public function getUserId(Request $request)
    {
        $user = $request->user();

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
                 ->where('id', '!=', $userAuth->id) 
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
            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'nickname' => 'required|string|min:4|max:255',
            'name' => 'required|string|max:255',
            'surname' => 'required|string|max:255',
            'school' => 'required|string|max:255',
            'city' => 'required|string|max:255',
        ]);

        if (User::where('nickname', $request->nickname)->where('id', '!=', $user->id)->exists()) {
            return response()->json(['error' => 'Nickname već postoji.'], 400);
        }

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture && basename($user->profile_picture) !== 'default_profile_picture.png') {
                $oldImagePath = public_path($user->profile_picture);
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }
        
            $imageName = time() . '.' . $request->file('profile_picture')->extension();
            $request->file('profile_picture')->storeAs('public/profile_images', $imageName);
            $user->profile_picture = 'storage/profile_images/' . $imageName;
        }

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
                     ->select('id', 'name', 'nickname', 'profile_picture', 'surname', 'school', 'city', 'email', 'game') 
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

        $user->update(['online' => true, 'game' => false]);
        
        $onlineUsers = User::where('online', true)->pluck('id')->toArray();
        broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers));

        return response()->json(['message' => 'Korisnik je online']);
    }

    public function setOffline(Request $request)
    {
        $token = $request->input('token'); 

        if (!$token) {
            return response()->json(['error' => 'Token nije poslat.'], 401);
        }

        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
        
        if (!$accessToken || !$accessToken->tokenable) {
            return response()->json(['error' => 'Nevažeći token.'], 401);
        }

        $user = $accessToken->tokenable;

        $user->update(['online' => false, 'game' => false]);

        $onlineUsers = User::where('online', true)->pluck('id')->toArray();

        broadcast(new \App\Events\OnlineUsersUpdated($onlineUsers));

        return response()->json(['message' => 'Korisnik je offline']);
    }

    public function getOnlineUsers()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        $onlineUsers = User::where('online', true)
                        ->select('id', 'name', 'nickname', 'profile_picture', 'surname', 'school', 'city', 'game')
                        ->get();

        return response()->json($onlineUsers);
    }

    public function pingUser()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        $user->update(['online' => true, 'last_ping' => now()]);

        return response()->json(['message' => 'Ping primljen']);
    }

    public function getInGameUsers()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        $inGameUsers = User::where('game', true)
                            ->select('id', 'name', 'nickname', 'profile_picture', 'surname', 'school', 'city', 'game')
                            ->get();

        return response()->json($inGameUsers);
    }

}
