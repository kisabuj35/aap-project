<?php

namespace App\Http\Requests;

use Closure;
use Illuminate\Foundation\Http\FormRequest;

class StoreMemberRequest extends FormRequest
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
            'name' => ['required', 'string', 'max:255'],
            'fatherName' => ['nullable', 'string', 'max:255'],
            'motherName' => ['nullable', 'string', 'max:255'],
            'gender' => ['nullable', 'string', 'max:64'],
            'education' => ['nullable', 'string', 'max:255'],
            'designation' => ['nullable', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:2000'],
            'phone' => ['required', 'string', 'max:32'],
            'nid' => ['nullable', 'string', 'max:32'],
            'profession' => ['nullable', 'string', 'max:255'],
            'bloodGroup' => ['nullable', 'string', 'max:4'],
            'monthlyFee' => ['nullable', 'numeric', 'min:0'],
            'joinDate' => ['nullable', 'date_format:Y-m-d'],
            'email' => ['nullable', 'email', 'max:255'],
            'fbLink' => ['nullable', 'url', 'max:2048'],
            'comments' => ['nullable', 'string', 'max:2000'],
            'memberType' => ['nullable', 'string', 'max:100'],
            'consent' => ['accepted'],
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
            'name.required' => 'সদস্যের নাম দিতে হবে।',
            'phone.required' => 'মোবাইল নম্বর দিতে হবে।',
            'phone.max' => 'মোবাইল নম্বর ৩২ অক্ষরের বেশি হতে পারবে না।',
            'consent.accepted' => 'সদস্যতার শর্তে সম্মতি দিতে হবে।',
        ];
    }
}
