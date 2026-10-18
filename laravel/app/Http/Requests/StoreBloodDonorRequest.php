<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreBloodDonorRequest extends FormRequest
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
            'donorType' => ['required', 'string', 'max:100'],
            'consent' => ['accepted'],
            'donorId' => [
                'nullable',
                'required_if:donorType,সদস্য',
                'string',
                Rule::exists('members', 'member_id')->where('status', 'সক্রিয়'),
            ],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:32'],
            'gender' => ['nullable', 'string', 'max:64'],
            'dob' => ['nullable', 'date_format:Y-m-d'],
            'bloodGroup' => ['required', Rule::in(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'])],
            'lastDonationDate' => ['nullable', 'date_format:Y-m-d'],
            'weight' => ['nullable', 'numeric', 'min:0', 'max:999.99'],
            'division' => ['nullable', 'string', 'max:255'],
            'district' => ['nullable', 'string', 'max:255'],
            'upazila' => ['nullable', 'string', 'max:255'],
            'village' => ['nullable', 'string', 'max:1000'],
            'photoData' => [
                'nullable',
                'string',
                'max:7000000',
                function (string $attribute, mixed $value, Closure $fail): void {
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
                },
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'donorId.required_if' => 'সদস্য ডোনারের জন্য সক্রিয় সদস্য আইডি দিতে হবে।',
            'donorId.exists' => 'সক্রিয় সদস্যের আইডি পাওয়া যায়নি।',
            'name.required' => 'রক্তদাতার নাম দিতে হবে।',
            'phone.required' => 'মোবাইল নম্বর দিতে হবে।',
            'bloodGroup.required' => 'রক্তের গ্রুপ নির্বাচন করতে হবে।',
            'consent.accepted' => 'রক্তদাতা তালিকায় তথ্য প্রকাশের সম্মতি দিতে হবে।',
        ];
    }
}
