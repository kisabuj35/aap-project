<?php

namespace Database\Seeders;

use App\Models\BloodDonor;
use Illuminate\Database\Seeder;

class BloodDonorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        BloodDonor::firstOrCreate(
            ['phone' => '00000000000'],
            [
                'name' => 'Demo Donor',
                'blood_group' => 'O+',
                'status' => 'পেন্ডিং',
                'donor_type' => 'সাধারণ ডোনার',
            ],
        );
    }
}
