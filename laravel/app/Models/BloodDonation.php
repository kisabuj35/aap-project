<?php

namespace App\Models;

use Database\Factories\BloodDonationFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodDonation extends Model
{
    /** @use HasFactory<BloodDonationFactory> */
    use HasFactory;

    protected $fillable = [
        'donated_at', 'donor_type', 'donor_id', 'donor_name', 'donor_father_name',
        'blood_group', 'donor_phone', 'donor_photo_url', 'recipient_name',
        'recipient_phone', 'recipient_address', 'medical_need', 'recipient_photo_url',
        'remarks', 'status', 'consented_at',
    ];

    protected function casts(): array
    {
        return [
            'donated_at' => 'date',
            'consented_at' => 'datetime',
        ];
    }

    public function scopeApproved(Builder $query): Builder
    {
        return $query->whereIn('status', ['অনুমোদিত', 'সক্রিয়']);
    }
}
