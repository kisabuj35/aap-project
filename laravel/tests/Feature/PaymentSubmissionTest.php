<?php

namespace Tests\Feature;

use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentSubmissionTest extends TestCase
{
    use RefreshDatabase;

    public function test_payment_submission_form_is_available(): void
    {
        $this->get('/payments/register')
            ->assertOk()
            ->assertSee('চাঁদা বা অনুদান জমা');
    }

    public function test_member_payment_is_saved_as_pending_with_the_legacy_payload(): void
    {
        Member::factory()->create([
            'member_id' => 'AAP001',
            'name' => 'সক্রিয় সদস্য',
            'status' => 'সক্রিয়',
        ]);

        $response = $this->postJson('/payments', [
            'memberId' => 'AAP001',
            'name' => 'সক্রিয় সদস্য',
            'fiscalYear' => '২০২৬-২০২৭',
            'month' => 'জুন',
            'amount' => '200',
            'phone' => '01710181059',
            'method' => 'বিকাশ',
            'txnId' => 'TXN-1001',
        ]);

        $response->assertCreated()->assertJsonPath('success', true);

        $this->assertDatabaseHas('payments', [
            'member_id' => 'AAP001',
            'payer_name' => 'সক্রিয় সদস্য',
            'amount' => 200,
            'status' => 'পেন্ডিং',
            'transaction_id' => 'TXN-1001',
        ]);
    }

    public function test_browser_payment_submission_redirects_with_a_confirmation(): void
    {
        $this->post('/payments', [
            'name' => 'সাধারণ অনুদানকারী',
            'month' => 'সাধারণ অনুদান',
            'amount' => '300',
            'phone' => '01710181059',
            'method' => 'নগদ',
        ])->assertRedirect(route('payments.create'))
            ->assertSessionHas('payment_submitted', true);
    }

    public function test_pending_member_cannot_submit_a_member_payment(): void
    {
        Member::factory()->create([
            'member_id' => 'AAP002',
            'status' => 'পেন্ডিং',
        ]);

        $this->postJson('/payments', [
            'memberId' => 'AAP002',
            'name' => 'অপেক্ষমাণ সদস্য',
            'month' => 'জুন',
            'amount' => '200',
            'phone' => '01710181059',
            'method' => 'বিকাশ',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors('memberId');

        $this->assertDatabaseCount('payments', 0);
    }

    public function test_active_member_lookup_returns_only_safe_payment_fields(): void
    {
        Member::factory()->create([
            'member_id' => 'AAP001',
            'name' => 'সক্রিয় সদস্য',
            'phone' => '01710181059',
            'blood_group' => 'B+',
            'monthly_fee' => 200,
            'status' => 'সক্রিয়',
        ]);

        $this->getJson('/members/AAP001')
            ->assertOk()
            ->assertExactJson([
                'success' => true,
                'name' => 'সক্রিয় সদস্য',
                'phone' => '01710181059',
                'bloodGroup' => 'B+',
                'monthlyFee' => '200.00',
            ]);
    }
}
