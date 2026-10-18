<?php

namespace App\Models;

use Database\Factories\BloodDonorFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BloodDonor extends Model
{
    /** @use HasFactory<BloodDonorFactory> */
    use HasFactory;

    protected $fillable = [
        'registered_at', 'name', 'phone', 'gender', 'date_of_birth', 'blood_group',
        'last_donation_at', 'weight_kg', 'division', 'district', 'upazila',
        'union_or_village', 'photo_url', 'status', 'donor_type', 'member_id',
    ];

    protected function casts(): array
    {
        return [
            'registered_at' => 'date',
            'date_of_birth' => 'date',
            'last_donation_at' => 'date',
            'weight_kg' => 'decimal:2',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'সক্রিয়')->whereNotNull('blood_group');
    }
}
