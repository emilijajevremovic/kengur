<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\FriendRequest;
use Validator; 
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use App\Events\ChallengeUser;
use App\Events\ChallengeRejected;
use App\Events\GameStarted;
use Illuminate\Support\Facades\Response;

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
            'nickname' => 'required|string|min:4|max:255',
            'class' => 'required|integer|between:1,12',
            'math_grade' => 'required|integer|between:1,5',
            'info_grade' => 'required|integer|between:1,5'

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
            'wins' => 0, 
            'losses' => 0,
            'class' => $request->class,
            'math_grade' => $request->math_grade,
            'info_grade' => $request->info_grade,
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

        return response()->json(['token' => $token, 'role' => $user->role], 200);
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
                    ->where('role', '!=', 'admin')
                    ->where('id', '!=', $userAuth->id)
                    ->get()
                    ->map(function ($user) use ($userAuth) {
                        $isFriend = FriendRequest::where(function ($query) use ($userAuth, $user) {
                            $query->where('sender_id', $userAuth->id)
                                ->where('receiver_id', $user->id);
                        })->orWhere(function ($query) use ($userAuth, $user) {
                            $query->where('sender_id', $user->id)
                                ->where('receiver_id', $userAuth->id);
                        })->where('status', 'accepted')->exists();

                        $user->is_friend = $isFriend;
                        return $user;
                    });

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
            'class' => 'required|integer|between:1,12',
            'math_grade' => 'required|integer|between:1,5',
            'info_grade' => 'required|integer|between:1,5',

        ]);

        if (User::where('nickname', $request->nickname)->where('id', '!=', $user->id)->exists()) {
            return response()->json(['error' => 'Korisničko ime već postoji.'], 400);
        }

        if ($request->hasFile('profile_picture')) {
            if ($user->profile_picture && basename($user->profile_picture) !== 'default_profile_picture.png') {
                $relativePath = str_replace('storage/', '', $user->profile_picture);
                $oldImagePath = storage_path('app/public/' . $relativePath);

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
        $user->class = $request->class;
        $user->math_grade = $request->math_grade;
        $user->info_grade = $request->info_grade;

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
                    ->where('role', '!=', 'admin')
                     ->select('id', 'name', 'nickname', 'profile_picture', 'surname', 'school', 'city', 'email', 'game', 'class', 'math_grade', 'info_grade') 
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
        
        $onlineUsers = User::where('online', true)->where('role', '!=', 'admin')->pluck('id')->toArray();
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

        $onlineUsers = User::where('online', true)->where('role', '!=', 'admin')->pluck('id')->toArray();

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
                        ->where('role', '!=', 'admin')
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

    public function updateGameResult(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'result' => 'required|in:win,loss', 
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = Auth::user(); 

        if (!$user) {
            return response()->json(['error' => 'Neautorizovan pristup.'], 401);
        }

        if ($request->result === 'win') {
            $user->increment('wins');
        } elseif ($request->result === 'loss') {
            $user->increment('losses');
        }

        return response()->json([
            'message' => 'Rezultat uspešno ažuriran.',
            'wins' => $user->wins,
            'losses' => $user->losses
        ]);
    }

    public function getUsersAdmin(Request $request)
    {
        $query = User::where('role', 'user'); 

        if ($request->has('name')) {
            $query->where('name', 'like', '%' . $request->name . '%');
        }

        if ($request->has('surname')) {
            $query->where('surname', 'like', '%' . $request->surname . '%');
        }

        if ($request->has('city')) {
            $query->where('city', 'like', '%' . $request->city . '%');
        }

        if ($request->has('school')) {
            $query->where('school', 'like', '%' . $request->school . '%');
        }

        if ($request->has('class')) {
            $query->where('class', $request->class);
        }
        
        if ($request->has('math_grade')) {
            $query->where('math_grade', $request->math_grade);
        }
        
        if ($request->has('info_grade')) {
            $query->where('info_grade', $request->info_grade);
        }

        if ($request->has('wins') && !is_null($request->wins) && $request->wins !== '') {
            $query->where('wins', '>=', $request->wins);
        }
    
        if ($request->has('losses') && !is_null($request->losses) && $request->losses !== '') {
            $query->where('losses', '>=', $request->losses);
        }

        $users = $query->select('id', 'name', 'surname', 'school', 'class', 'math_grade', 'info_grade', 'city', 'nickname', 'profile_picture', 'wins', 'losses', 'email')
                        ->get();

        return response()->json($users);
    }

}
