<?php

namespace Database\Factories;

use App\Models\BloodDonor;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BloodDonor>
 */
class BloodDonorFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'registered_at' => fake()->date(),
            'name' => fake()->name(),
            'phone' => fake()->numerify('01#########'),
            'gender' => fake()->randomElement(['পুরুষ', 'নারী']),
            'blood_group' => fake()->randomElement(['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-']),
            'district' => 'পটুয়াখালী',
            'upazila' => 'পটুয়াখালী সদর',
            'status' => 'সক্রিয়',
            'donor_type' => 'সাধারণ ডোনার',
        ];
    }
}
