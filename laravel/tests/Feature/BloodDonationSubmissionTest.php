<?php

namespace Tests\Feature;

use App\Models\BloodDonation;
use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BloodDonationSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_report_form_and_public_log_pages_are_available(): void
    {
        $this->get('/blood-donation-logs/report')
            ->assertOk()
            ->assertSee('রক্তদান রিপোর্ট');

        $this->get('/blood-donation-logs')
            ->assertOk()
            ->assertSee('অনুমোদিত রক্তদান খতিয়ান');
    }

    public function test_blood_donation_report_is_saved_pending_after_consent(): void
    {
        Member::factory()->create([
            'member_id' => 'AAP001',
            'name' => 'সক্রিয় সদস্য',
            'status' => 'সক্রিয়',
        ]);

        $response = $this->postJson('/blood-donation-logs', [
            'donorType' => 'সদস্য',
            'donorId' => 'AAP001',
            'donorName' => 'সক্রিয় সদস্য',
            'donorFather' => 'পিতা',
            'donorBlood' => 'B+',
            'donorPhone' => '01710181059',
            'donationDate' => '2026-10-18',
            'recipientName' => 'রক্তগ্রহীতা',
            'recipientPhone' => '01710181060',
            'recipientAddress' => 'পটুয়াখালী',
            'recipientDisease' => 'জরুরি চিকিৎসা',
            'remarks' => 'তথ্য যাচাইযোগ্য',
            'consent' => true,
        ]);

        $response->assertCreated()->assertJsonPath('success', true);

        $this->assertDatabaseHas('blood_donations', [
            'donor_id' => 'AAP001',
            'donor_name' => 'সক্রিয় সদস্য',
            'recipient_name' => 'রক্তগ্রহীতা',
            'status' => 'পেন্ডিং',
        ]);
        $this->assertDatabaseMissing('blood_donations', ['consented_at' => null]);
    }

    public function test_public_log_only_returns_approved_donations(): void
    {
        BloodDonation::factory()->create([
            'donor_name' => 'অনুমোদিত দাতা',
            'status' => 'অনুমোদিত',
        ]);
        BloodDonation::factory()->create([
            'donor_name' => 'অপেক্ষমাণ দাতা',
            'status' => 'পেন্ডিং',
        ]);

        $this->getJson('/blood-donation-logs')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.donorName', 'অনুমোদিত দাতা');
    }

    public function test_member_donation_requires_an_active_member_id_and_consent(): void
    {
        Member::factory()->create([
            'member_id' => 'AAP002',
            'status' => 'পেন্ডিং',
        ]);

        $this->postJson('/blood-donation-logs', [
            'donorType' => 'সদস্য',
            'donorId' => 'AAP002',
            'donorName' => 'অপেক্ষমাণ সদস্য',
            'donorFather' => 'পিতা',
            'donorBlood' => 'B+',
            'donorPhone' => '01710181059',
            'donationDate' => '2026-10-18',
            'recipientName' => 'রক্তগ্রহীতা',
            'recipientPhone' => '01710181060',
            'recipientAddress' => 'পটুয়াখালী',
            'recipientDisease' => 'জরুরি চিকিৎসা',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['donorId', 'consent']);

        $this->assertDatabaseCount('blood_donations', 0);
    }
}
