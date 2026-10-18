<?php

use App\Http\Controllers\BloodDonationController;
use App\Http\Controllers\BloodDonorController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\PaymentController;
use App\Models\Member;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('home', ['activeMemberCount' => Member::query()->active()->count()]);
})->name('home');

Route::get('/members', [MemberController::class, 'index'])->name('members.index');
Route::get('/members/register', [MemberController::class, 'create'])->name('members.create');
Route::post('/members', [MemberController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('members.store');

Route::get('/blood-donors', [BloodDonorController::class, 'index'])->name('blood-donors.index');
Route::get('/blood-donors/register', [BloodDonorController::class, 'create'])->name('blood-donors.create');
Route::post('/blood-donors', [BloodDonorController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('blood-donors.store');

Route::get('/members/{memberId}', [PaymentController::class, 'member'])->name('members.lookup');
Route::get('/payments/register', [PaymentController::class, 'create'])->name('payments.create');
Route::post('/payments', [PaymentController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('payments.store');

Route::get('/blood-donation-logs', [BloodDonationController::class, 'index'])->name('blood-donation-logs.index');
Route::get('/blood-donation-logs/report', [BloodDonationController::class, 'create'])->name('blood-donation-logs.create');
Route::post('/blood-donation-logs', [BloodDonationController::class, 'store'])
    ->middleware('throttle:10,1')
    ->name('blood-donation-logs.store');
