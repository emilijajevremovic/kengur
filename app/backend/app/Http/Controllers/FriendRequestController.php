<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\FriendRequest;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class FriendRequestController extends Controller
{
    // Slanje zahteva 
    public function sendRequest(Request $request)
    {
        $request->validate([
            'receiver_id' => 'required|exists:users,id',
        ]);

        $sender = Auth::user();
        $receiver = User::findOrFail($request->receiver_id);

        // Provera da li već postoji zahtev
        if (FriendRequest::where('sender_id', $sender->id)->where('receiver_id', $receiver->id)->exists()) {
            return response()->json(['message' => 'Zahtev je već poslat.'], 400);
        }

        FriendRequest::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'status' => 'pending',
        ]);

        return response()->json(['message' => 'Zahtev za prijateljstvo poslat.']);
    }

    // Prihvatanje zahteva
    public function acceptRequest(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:friend_requests,id',
        ]);

        $friendRequest = FriendRequest::findOrFail($request->request_id);

        // Provera da li trenutni korisnik prima zahtev
        if ($friendRequest->receiver_id !== Auth::id()) {
            return response()->json(['message' => 'Nemate dozvolu da prihvatite ovaj zahtev.'], 403);
        }

        $friendRequest->update(['status' => 'accepted']);

        return response()->json(['message' => 'Prijateljski zahtev prihvaćen.']);
    }

    // Odbijanje zahteva
    public function rejectRequest(Request $request)
    {
        $request->validate([
            'request_id' => 'required|exists:friend_requests,id',
        ]);

        $friendRequest = FriendRequest::findOrFail($request->request_id);

        if ($friendRequest->receiver_id !== Auth::id()) {
            return response()->json(['message' => 'Nemate dozvolu da odbijete ovaj zahtev.'], 403);
        }

        $friendRequest->delete();

        return response()->json(['message' => 'Prijateljski zahtev odbijen.']);
    }

    // Izlistavanje zahteva korisnika
    public function getFriendRequests()
    {
        $user = auth()->user();

        if (!$user) {
            return response()->json(['error' => 'Niste autentifikovani.'], 401);
        }

        // Pronalazi sve zahteve za prijateljstvo koje je korisnik primio, ali nije još prihvatio/odbio
        $requests = FriendRequest::where('receiver_id', $user->id)
                    ->where('status', 'pending') // Samo oni koji nisu prihvaćeni/odbijeni
                    ->with(['sender:id,nickname,profile_picture,city,school,name,surname,email']) // Prikazuje informacije o pošiljaocu
                    ->get();

        return response()->json($requests);
    }
}
