<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'surname',
        'school',
        'city',
        'nickname',
        'profile_picture',
        'online', 
        'role',
        'last_ping',
        'game',
        'wins', 
        'losses',
        'class',
        'math_grade',
        'info_grade',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];

    // public function getIsOnlineAttribute()
    // {
    //     $onlineUsers = Cache::get('online_users', []);
    //     return in_array($this->id, $onlineUsers);
    // }
    public function getIsOnlineAttribute()
    {
        return $this->online; 
    }
    
}
