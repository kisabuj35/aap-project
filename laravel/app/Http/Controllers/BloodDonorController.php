<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBloodDonorRequest;
use App\Models\BloodDonor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;

class BloodDonorController extends Controller
{
    public function index(Request $request): JsonResponse|View
    {
        $donors = BloodDonor::query()->active()->orderBy('name')->get();

        if (! $request->expectsJson()) {
            return view('blood-donors.index', ['donors' => $donors]);
        }

        return response()->json([
            'data' => $donors->map(fn (BloodDonor $donor): array => [
                'name' => $donor->name,
                'bloodGroup' => $donor->blood_group,
                'phone' => $donor->phone,
                'location' => collect([$donor->upazila, $donor->district])->filter()->join(', ') ?: 'আউলিয়াপুর',
                'type' => $donor->donor_type ?: 'সাধারণ ডোনার',
                'memberId' => $donor->member_id ?: '-',
                'lastDonation' => $donor->last_donation_at?->format('d-m-Y') ?: '-',
            ]),
        ]);
    }

    public function create(): View
    {
        return view('blood-donors.create');
    }

    public function store(StoreBloodDonorRequest $request): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        $photoUrl = $this->storePhoto($data['photoData'] ?? null);

        $donor = BloodDonor::query()->create([
            'registered_at' => now()->toDateString(),
            'name' => $data['name'],
            'phone' => $data['phone'],
            'gender' => $data['gender'] ?? null,
            'date_of_birth' => $data['dob'] ?? null,
            'blood_group' => $data['bloodGroup'],
            'last_donation_at' => $data['lastDonationDate'] ?? null,
            'weight_kg' => $data['weight'] ?? null,
            'division' => $data['division'] ?? null,
            'district' => $data['district'] ?? null,
            'upazila' => $data['upazila'] ?? null,
            'union_or_village' => $data['village'] ?? null,
            'photo_url' => $photoUrl,
            'status' => 'সক্রিয়',
            'donor_type' => $data['donorType'],
            'member_id' => $data['donorType'] === 'সদস্য' ? $data['donorId'] : null,
        ]);

        if (! $request->expectsJson()) {
            return redirect()->route('blood-donors.create')->with('donor_registered', true);
        }

        return response()->json(['success' => true, 'donorId' => $donor->id], 201);
    }

    private function storePhoto(?string $photoData): ?string
    {
        if ($photoData === null || $photoData === '') {
            return null;
        }

        if (filter_var($photoData, FILTER_VALIDATE_URL)) {
            return $photoData;
        }

        preg_match('/\Adata:image\/(jpeg|png|webp);base64,([A-Za-z0-9+\/=\r\n]+)\z/', $photoData, $matches);
        $contents = base64_decode($matches[2], true);
        $mimeType = (new \finfo(FILEINFO_MIME_TYPE))->buffer($contents);
        $extension = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'][$mimeType];
        $path = 'blood-donors/'.Str::uuid().'.'.$extension;

        if (! Storage::disk('public')->put($path, $contents)) {
            throw new \RuntimeException('ছবি সংরক্ষণ করা যায়নি।');
        }

        return Storage::disk('public')->url($path);
    }
}
