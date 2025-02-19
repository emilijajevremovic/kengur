<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use Carbon\Carbon;

class CheckInactiveUsers extends Command
{
    protected $signature = 'users:check-inactive';
    protected $description = 'Postavlja korisnike offline ako nisu poslali ping u poslednja 2 minuta';

    public function handle()
    {
        $cutoffTime = Carbon::now()->subMinutes(2);

        User::where('last_ping', '<', $cutoffTime)
            ->update(['online' => false]);

        $this->info('Neaktivni korisnici postavljeni na offline.');
    }
}
