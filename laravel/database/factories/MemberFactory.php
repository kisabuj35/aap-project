<?php

namespace Database\Factories;

use App\Models\Member;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Member>
 */
class MemberFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'member_id' => fake()->unique()->bothify('AAP###'),
            'name' => fake()->name(),
            'father_name' => fake()->name('male'),
            'designation' => 'সাধারণ সদস্য',
            'address' => fake()->address(),
            'phone' => fake()->numerify('01#########'),
            'joined_at' => fake()->date(),
            'blood_group' => fake()->randomElement(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-']),
            'monthly_fee' => fake()->randomElement([100, 200, 300]),
            'status' => 'সক্রিয়',
            'member_type' => 'সাধারণ সদস্য',
        ];
    }
}
