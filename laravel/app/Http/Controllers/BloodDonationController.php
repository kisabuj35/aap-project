<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBloodDonationRequest;
use App\Models\BloodDonation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;

class BloodDonationController extends Controller
{
    public function index(Request $request): JsonResponse|View
    {
        $donations = BloodDonation::query()->approved()->latest('donated_at')->get();

        if (! $request->expectsJson()) {
            return view('blood-donations.index', ['donations' => $donations]);
        }

        $donorCounts = $donations->groupBy(fn (BloodDonation $donation): string => $donation->donor_id ?: $donation->donor_name)
            ->map->count();

        return response()->json([
            'data' => $donations->map(fn (BloodDonation $donation): array => [
                'date' => $donation->donated_at?->format('d-m-Y') ?: '',
                'donorType' => $donation->donor_type ?: 'সাধারণ',
                'donorId' => $donation->donor_id ?: '-',
                'donorName' => $donation->donor_name,
                'donorFather' => $donation->donor_father_name ?: '-',
                'donorBlood' => $donation->blood_group,
                'donorPhone' => $donation->donor_phone ?: 'N/A',
                'donationDate' => $donation->donated_at?->format('d-m-Y') ?: '',
                'donorPhoto' => $donation->donor_photo_url ?: '',
                'recipientName' => $donation->recipient_name,
                'recipientAddress' => $donation->recipient_address,
                'recipientDisease' => $donation->medical_need,
                'recipientPhoto' => $donation->recipient_photo_url ?: '',
                'remarks' => $donation->remarks ?: '',
                'donorBloodCount' => $donorCounts[$donation->donor_id ?: $donation->donor_name] ?? 1,
            ]),
            'stats' => [
                'totalDonations' => $donations->count(),
                'uniqueDonorsCount' => $donations->map(fn (BloodDonation $donation): string => $donation->donor_id ?: $donation->donor_name)->unique()->count(),
                'groupStats' => $donations->countBy('blood_group'),
            ],
        ]);
    }

    public function create(): View
    {
        return view('blood-donations.create');
    }

    public function store(StoreBloodDonationRequest $request): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        $storedPaths = [];

        try {
            $donorPhoto = $this->storePhoto($data['donorPhotoData'] ?? null, 'blood-donations/donors', $storedPaths);
            $recipientPhoto = $this->storePhoto($data['recipientPhotoData'] ?? null, 'blood-donations/recipients', $storedPaths);

            $donation = BloodDonation::query()->create([
                'donated_at' => $data['donationDate'],
                'donor_type' => $data['donorType'],
                'donor_id' => $data['donorType'] === 'সদস্য' ? $data['donorId'] : null,
                'donor_name' => $data['donorName'],
                'donor_father_name' => $data['donorFather'],
                'blood_group' => $data['donorBlood'],
                'donor_phone' => $data['donorPhone'],
                'donor_photo_url' => $donorPhoto,
                'recipient_name' => $data['recipientName'],
                'recipient_phone' => $data['recipientPhone'],
                'recipient_address' => $data['recipientAddress'],
                'medical_need' => $data['recipientDisease'],
                'recipient_photo_url' => $recipientPhoto,
                'remarks' => $data['remarks'] ?? null,
                'status' => 'পেন্ডিং',
                'consented_at' => now(),
            ]);
        } catch (\Throwable $exception) {
            foreach ($storedPaths as $path) {
                Storage::disk('public')->delete($path);
            }

            throw $exception;
        }

        if (! $request->expectsJson()) {
            return redirect()->route('blood-donations.create')->with('blood_donation_submitted', true);
        }

        return response()->json(['success' => true, 'donationId' => $donation->id], 201);
    }

    private function storePhoto(?string $photoData, string $directory, array &$storedPaths): ?string
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
        $path = $directory.'/'.Str::uuid().'.'.$extension;

        if (! Storage::disk('public')->put($path, $contents)) {
            throw new \RuntimeException('ছবি সংরক্ষণ করা যায়নি।');
        }

        $storedPaths[] = $path;

        return Storage::disk('public')->url($path);
    }
}
