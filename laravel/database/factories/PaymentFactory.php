<?php

namespace Database\Factories;

use App\Models\Payment;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Payment>
 */
class PaymentFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'paid_at' => fake()->date(),
            'payer_name' => fake()->name(),
            'month' => 'জুন',
            'amount' => fake()->randomElement([100, 200, 500]),
            'phone' => fake()->numerify('01#########'),
            'payment_method' => 'বিকাশ',
            'status' => 'পেন্ডিং',
        ];
    }
}
