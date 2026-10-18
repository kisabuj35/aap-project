<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'memberId' => [
                'nullable',
                'string',
                Rule::exists('members', 'member_id')->where('status', 'সক্রিয়'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'fiscalYear' => ['nullable', 'string', 'max:16'],
            'month' => ['required', 'string', 'max:100'],
            'amount' => ['required', 'numeric', 'gt:0', 'max:9999999999'],
            'phone' => ['required', 'string', 'max:32'],
            'method' => ['required', 'string', 'max:100'],
            'txnId' => ['nullable', 'string', 'max:255'],
        ];
    }

    public function messages(): array
    {
        return [
            'memberId.exists' => 'শুধু সক্রিয় সদস্যের আইডিতে চাঁদা জমা দেওয়া যাবে।',
            'name.required' => 'প্রদানকারীর নাম দিতে হবে।',
            'month.required' => 'চাঁদা বা অনুদানের বিবরণ দিতে হবে।',
            'amount.required' => 'টাকার পরিমাণ দিতে হবে।',
            'amount.gt' => 'টাকার পরিমাণ শূন্যের বেশি হতে হবে।',
            'phone.required' => 'মোবাইল নম্বর দিতে হবে।',
            'method.required' => 'পেমেন্ট মাধ্যম নির্বাচন করতে হবে।',
        ];
    }
}
