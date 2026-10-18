<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePaymentRequest;
use App\Models\Member;
use App\Models\Payment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class PaymentController extends Controller
{
    public function create(): View
    {
        return view('payments.create');
    }

    public function member(string $memberId): JsonResponse
    {
        $member = Member::query()
            ->active()
            ->where('member_id', $memberId)
            ->firstOrFail();

        return response()->json([
            'success' => true,
            'name' => $member->name,
            'phone' => $member->phone,
            'bloodGroup' => $member->blood_group,
            'monthlyFee' => $member->monthly_fee,
        ]);
    }

    public function store(StorePaymentRequest $request): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        $payment = Payment::query()->create([
            'paid_at' => now()->toDateString(),
            'member_id' => $data['memberId'] ?? null,
            'payer_name' => $data['name'],
            'fiscal_year' => $data['fiscalYear'] ?? null,
            'month' => $data['month'],
            'amount' => $data['amount'],
            'phone' => $data['phone'],
            'payment_method' => $data['method'],
            'transaction_id' => $data['txnId'] ?? null,
            'status' => 'পেন্ডিং',
        ]);

        if (! $request->expectsJson()) {
            return redirect()->route('payments.create')->with('payment_submitted', true);
        }

        return response()->json(['success' => true, 'paymentId' => $payment->id], 201);
    }
}
