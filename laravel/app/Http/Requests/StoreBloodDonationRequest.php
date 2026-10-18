<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBloodDonationRequest extends FormRequest
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
            'donorType' => ['required', Rule::in(['সদস্য', 'সাধারণ'])],
            'donorId' => [
                'nullable',
                'required_if:donorType,সদস্য',
                'string',
                Rule::exists('members', 'member_id')->where('status', 'সক্রিয়'),
            ],
            'donorName' => ['required', 'string', 'max:255'],
            'donorFather' => ['required', 'string', 'max:255'],
            'donorBlood' => ['required', Rule::in(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'])],
            'donorPhone' => ['required', 'string', 'max:32'],
            'donationDate' => ['required', 'date_format:Y-m-d'],
            'donorPhotoData' => ['nullable', 'string', 'max:7000000', $this->imageDataRule()],
            'recipientName' => ['required', 'string', 'max:255'],
            'recipientPhone' => ['required', 'string', 'max:32'],
            'recipientAddress' => ['required', 'string', 'max:1000'],
            'recipientDisease' => ['required', 'string', 'max:255'],
            'recipientPhotoData' => ['nullable', 'string', 'max:7000000', $this->imageDataRule()],
            'remarks' => ['nullable', 'string', 'max:2000'],
            'consent' => ['accepted'],
        ];
    }

    public function messages(): array
    {
        return [
            'donorId.required_if' => 'সদস্য রক্তদাতার সক্রিয় সদস্য আইডি দিতে হবে।',
            'donorId.exists' => 'সক্রিয় সদস্যের আইডি পাওয়া যায়নি।',
            'donorName.required' => 'রক্তদাতার নাম দিতে হবে।',
            'donorFather.required' => 'রক্তদাতার পিতার নাম দিতে হবে।',
            'donorBlood.required' => 'রক্তের গ্রুপ নির্বাচন করতে হবে।',
            'donorPhone.required' => 'রক্তদাতার মোবাইল নম্বর দিতে হবে।',
            'donationDate.required' => 'রক্তদানের তারিখ দিতে হবে।',
            'recipientName.required' => 'রক্তগ্রহীতার নাম দিতে হবে।',
            'recipientPhone.required' => 'রক্তগ্রহীতার মোবাইল নম্বর দিতে হবে।',
            'recipientAddress.required' => 'রক্তগ্রহীতার ঠিকানা দিতে হবে।',
            'recipientDisease.required' => 'রক্তের প্রয়োজনের কারণ দিতে হবে।',
            'consent.accepted' => 'রক্তদান কর্মসূচির নিয়মে সম্মতি দিতে হবে।',
        ];
    }

    private function imageDataRule(): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail): void {
            if ($value === null || $value === '') {
                return;
            }

            if (filter_var($value, FILTER_VALIDATE_URL)) {
                $scheme = parse_url($value, PHP_URL_SCHEME);

                if (in_array($scheme, ['http', 'https'], true)) {
                    return;
                }
            }

            if (! preg_match('/\Adata:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+\/=\r\n]+)\z/', $value, $matches)) {
                $fail('ছবির তথ্যটি বৈধ নয়।');

                return;
            }

            $contents = base64_decode($matches[1], true);
            $mimeType = $contents === false ? false : (new \finfo(FILEINFO_MIME_TYPE))->buffer($contents);

            if ($contents === false || strlen($contents) > 5 * 1024 * 1024 || ! in_array($mimeType, ['image/jpeg', 'image/png', 'image/webp'], true)) {
                $fail('শুধু ৫ এমবির মধ্যে JPEG, PNG অথবা WEBP ছবি দেওয়া যাবে।');
            }
        };
    }
}
