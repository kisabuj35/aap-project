<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreMemberRequest;
use App\Models\Member;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\View\View;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse|View
    {
        $members = Member::query()
            ->active()
            ->orderBy('member_id')
            ->get(['member_id', 'name', 'blood_group']);

        if (! $request->expectsJson()) {
            return view('members.index', ['members' => $members]);
        }

        $data = $members->map(fn (Member $member): array => [
            'id' => $member->member_id,
            'name' => $member->name,
            'bloodGroup' => $member->blood_group,
        ]);

        return response()->json(['data' => $data]);
    }

    public function create(): View
    {
        return view('members.create');
    }

    public function store(StoreMemberRequest $request): JsonResponse|RedirectResponse
    {
        $data = $request->validated();
        $photoUrl = $this->storePhoto($data['photoData'] ?? null);

        try {
            $member = DB::transaction(function () use ($data, $photoUrl): Member {
                $lastMember = Member::query()
                    ->orderByDesc('id')
                    ->lockForUpdate()
                    ->first(['member_id']);
                preg_match('/\d+/', $lastMember?->member_id ?? '', $matches);
                $memberId = 'AAP'.str_pad((string) (((int) ($matches[0] ?? 0)) + 1), 3, '0', STR_PAD_LEFT);

                return Member::query()->create([
                    'member_id' => $memberId,
                    'name' => $data['name'],
                    'father_name' => $data['fatherName'] ?? null,
                    'mother_name' => $data['motherName'] ?? null,
                    'gender' => $data['gender'] ?? null,
                    'education' => $data['education'] ?? null,
                    'designation' => $data['designation'] ?? 'সাধারণ সদস্য',
                    'address' => $data['address'] ?? null,
                    'phone' => $data['phone'],
                    'national_id' => $data['nid'] ?? null,
                    'profession' => $data['profession'] ?? null,
                    'blood_group' => $data['bloodGroup'] ?? null,
                    'monthly_fee' => $data['monthlyFee'] ?? 0,
                    'joined_at' => $data['joinDate'] ?? null,
                    'email' => $data['email'] ?? null,
                    'facebook_url' => $data['fbLink'] ?? null,
                    'comments' => $data['comments'] ?? null,
                    'member_type' => $data['memberType'] ?? 'সাধারণ সদস্য',
                    'photo_url' => $photoUrl,
                    'status' => 'পেন্ডিং',
                ]);
            });
        } catch (\Throwable $exception) {
            if ($photoUrl !== null && str_starts_with($photoUrl, '/storage/')) {
                Storage::disk('public')->delete(substr($photoUrl, strlen('/storage/')));
            }

            throw $exception;
        }

        if (! $request->expectsJson()) {
            return redirect()
                ->route('members.create')
                ->with('member_id', $member->member_id);
        }

        return response()->json([
            'success' => true,
            'memberId' => $member->member_id,
        ], 201);
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
        $path = 'members/'.Str::uuid().'.'.$extension;

        if (! Storage::disk('public')->put($path, $contents)) {
            throw new \RuntimeException('ছবি সংরক্ষণ করা যায়নি।');
        }

        return Storage::disk('public')->url($path);
    }
}
