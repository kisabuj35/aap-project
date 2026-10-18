<?php

namespace Database\Seeders;

use App\Models\Member;
use Illuminate\Database\Seeder;

class MemberSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Member::firstOrCreate(
            ['member_id' => 'AAP-DEMO-001'],
            [
                'name' => 'Demo Member',
                'phone' => '00000000000',
                'status' => 'পেন্ডিং',
                'member_type' => 'সাধারণ সদস্য',
            ],
        );
    }
}
