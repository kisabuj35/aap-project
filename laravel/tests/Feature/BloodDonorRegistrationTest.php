<?php

namespace Tests\Feature;

use App\Models\BloodDonor;
use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BloodDonorRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_donor_registration_and_directory_pages_are_available(): void
    {
        $this->get('/blood-donors/register')
            ->assertOk()
            ->assertSee('রক্তদাতা নিবন্ধন');

        $this->get('/blood-donors')
            ->assertOk()
            ->assertSee('সক্রিয় রক্তদাতা');
    }

    public function test_donor_registration_accepts_the_legacy_payload(): void
    {
        $response = $this->postJson('/blood-donors', [
            'donorType' => 'সাধারণ ডোনার',
            'name' => 'পরীক্ষামূলক রক্তদাতা',
            'phone' => '01710181059',
            'gender' => 'পুরুষ',
            'dob' => '1995-01-15',
            'bloodGroup' => 'B+',
            'lastDonationDate' => '2026-06-01',
            'weight' => '65',
            'district' => 'পটুয়াখালী',
            'upazila' => 'পটুয়াখালী সদর',
            'village' => 'আউলিয়াপুর',
            'consent' => true,
        ]);

        $response->assertCreated()->assertJsonPath('success', true);

        $this->assertDatabaseHas('blood_donors', [
            'name' => 'পরীক্ষামূলক রক্তদাতা',
            'phone' => '01710181059',
            'blood_group' => 'B+',
            'status' => 'সক্রিয়',
        ]);
    }

    public function test_public_donor_list_only_includes_active_donors_with_a_blood_group(): void
    {
        BloodDonor::factory()->create([
            'name' => 'সক্রিয় রক্তদাতা',
            'status' => 'সক্রিয়',
            'blood_group' => 'B+',
        ]);
        BloodDonor::factory()->create([
            'name' => 'অপেক্ষমাণ রক্তদাতা',
            'status' => 'পেন্ডিং',
            'blood_group' => 'O+',
        ]);

        $this->getJson('/blood-donors')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'সক্রিয় রক্তদাতা')
            ->assertJsonPath('data.0.bloodGroup', 'B+');
    }

    public function test_member_donor_must_reference_an_active_member(): void
    {
        Member::factory()->create([
            'member_id' => 'AAP001',
            'status' => 'পেন্ডিং',
        ]);

        $this->postJson('/blood-donors', [
            'donorType' => 'সদস্য',
            'donorId' => 'AAP001',
            'name' => 'সদস্য রক্তদাতা',
            'phone' => '01710181059',
            'bloodGroup' => 'B+',
            'consent' => true,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('donorId');

        $this->assertDatabaseCount('blood_donors', 0);
    }
}
