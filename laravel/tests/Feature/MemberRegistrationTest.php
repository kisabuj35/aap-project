<?php

namespace Tests\Feature;

use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MemberRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_registration_form_is_available(): void
    {
        $this->get('/members/register')
            ->assertOk()
            ->assertSee('সদস্য নিবন্ধন')
            ->assertSee('নাম', false);
    }

    public function test_registration_creates_a_pending_member_from_the_legacy_payload(): void
    {
        $response = $this->postJson('/members', [
            'name' => 'মোঃ পরীক্ষামূলক সদস্য',
            'fatherName' => 'পরীক্ষামূলক পিতা',
            'designation' => 'সাধারণ সদস্য',
            'address' => 'আউলিয়াপুর',
            'phone' => '01710181059',
            'joinDate' => '2026-10-18',
            'bloodGroup' => 'O+',
            'monthlyFee' => '200',
            'memberType' => 'সাধারণ সদস্য',
            'consent' => true,
        ]);

        $response->assertCreated()
            ->assertJsonPath('success', true)
            ->assertJsonPath('memberId', 'AAP001');

        $this->assertDatabaseHas('members', [
            'member_id' => 'AAP001',
            'name' => 'মোঃ পরীক্ষামূলক সদস্য',
            'phone' => '01710181059',
            'status' => 'পেন্ডিং',
        ]);
    }

    public function test_public_member_list_only_returns_active_members(): void
    {
        Member::factory()->create([
            'member_id' => 'AAP001',
            'name' => 'অনুমোদিত সদস্য',
            'blood_group' => 'O+',
            'status' => 'সক্রিয়',
        ]);
        Member::factory()->create([
            'member_id' => 'AAP002',
            'name' => 'অপেক্ষমাণ সদস্য',
            'status' => 'পেন্ডিং',
        ]);

        $this->getJson('/members')
            ->assertOk()
            ->assertExactJson([
                'data' => [[
                    'id' => 'AAP001',
                    'name' => 'অনুমোদিত সদস্য',
                    'bloodGroup' => 'O+',
                ]],
            ]);
    }

    public function test_registration_rejects_missing_required_fields_without_writing(): void
    {
        $this->postJson('/members', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'phone']);

        $this->assertDatabaseCount('members', 0);
    }

    public function test_browser_registration_redirects_with_the_member_id(): void
    {
        $this->post('/members', [
            'name' => 'নতুন সদস্য',
            'phone' => '01710181059',
            'consent' => true,
        ])->assertRedirect(route('members.create'))
            ->assertSessionHas('member_id', 'AAP001');
    }
}
