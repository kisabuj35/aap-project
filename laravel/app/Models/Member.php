<?php

namespace App\Models;

use Database\Factories\MemberFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Member extends Model
{
    /** @use HasFactory<MemberFactory> */
    use HasFactory;

    protected $fillable = [
        'member_id',
        'name',
        'father_name',
        'designation',
        'address',
        'phone',
        'joined_at',
        'national_id',
        'profession',
        'blood_group',
        'email',
        'facebook_url',
        'comments',
        'monthly_fee',
        'photo_url',
        'status',
        'ended_at',
        'member_type',
        'mother_name',
        'gender',
        'education',
    ];

    protected function casts(): array
    {
        return [
            'joined_at' => 'date',
            'ended_at' => 'date',
            'monthly_fee' => 'decimal:2',
        ];
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'সক্রিয়');
    }
}
