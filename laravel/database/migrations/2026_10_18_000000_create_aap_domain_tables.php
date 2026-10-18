<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->id();
            $table->string('member_id')->unique();
            $table->string('name');
            $table->string('father_name')->nullable();
            $table->string('designation')->nullable();
            $table->text('address')->nullable();
            $table->string('phone', 32)->nullable()->index();
            $table->date('joined_at')->nullable();
            $table->string('national_id', 32)->nullable();
            $table->string('profession')->nullable();
            $table->string('blood_group', 4)->nullable()->index();
            $table->string('email')->nullable();
            $table->string('facebook_url')->nullable();
            $table->text('comments')->nullable();
            $table->decimal('monthly_fee', 12, 2)->default(0);
            $table->string('photo_url')->nullable();
            $table->string('status')->default('পেন্ডিং')->index();
            $table->date('ended_at')->nullable();
            $table->string('member_type')->default('সাধারণ সদস্য');
            $table->string('mother_name')->nullable();
            $table->string('gender')->nullable();
            $table->string('education')->nullable();
            $table->timestamps();
        });

        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->date('paid_at')->nullable()->index();
            $table->string('member_id')->nullable()->index();
            $table->string('fiscal_year', 16)->nullable();
            $table->string('month')->nullable();
            $table->decimal('amount', 12, 2)->default(0);
            $table->string('phone', 32)->nullable();
            $table->string('payment_method')->nullable();
            $table->string('transaction_id')->nullable();
            $table->string('status')->default('পেন্ডিং')->index();
            $table->timestamps();
        });

        Schema::create('blood_donors', function (Blueprint $table) {
            $table->id();
            $table->date('registered_at')->nullable();
            $table->string('name');
            $table->string('phone', 32)->index();
            $table->string('gender')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('blood_group', 4)->index();
            $table->date('last_donation_at')->nullable();
            $table->decimal('weight_kg', 5, 2)->nullable();
            $table->string('division')->nullable();
            $table->string('district')->nullable();
            $table->string('upazila')->nullable();
            $table->text('union_or_village')->nullable();
            $table->string('photo_url')->nullable();
            $table->string('status')->default('পেন্ডিং')->index();
            $table->string('donor_type')->nullable();
            $table->string('member_id')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('blood_donations', function (Blueprint $table) {
            $table->id();
            $table->date('donated_at')->nullable()->index();
            $table->string('donor_type')->nullable();
            $table->string('donor_id')->nullable()->index();
            $table->string('donor_name');
            $table->string('donor_father_name')->nullable();
            $table->string('blood_group', 4)->nullable()->index();
            $table->string('donor_phone', 32)->nullable();
            $table->string('donor_photo_url')->nullable();
            $table->string('recipient_name')->nullable();
            $table->string('recipient_phone', 32)->nullable();
            $table->text('recipient_address')->nullable();
            $table->string('medical_need')->nullable();
            $table->string('recipient_photo_url')->nullable();
            $table->text('remarks')->nullable();
            $table->string('status')->default('পেন্ডিং')->index();
            $table->timestamps();
        });

        Schema::create('committee_members', function (Blueprint $table) {
            $table->id();
            $table->string('committee_type')->index();
            $table->string('name');
            $table->string('father_name')->nullable();
            $table->string('mother_name')->nullable();
            $table->string('national_id', 32)->nullable();
            $table->string('phone', 32)->nullable();
            $table->string('email')->nullable();
            $table->string('gender')->nullable();
            $table->string('blood_group', 4)->nullable();
            $table->string('designation')->nullable();
            $table->string('profession')->nullable();
            $table->string('education')->nullable();
            $table->string('organization')->nullable();
            $table->string('facebook_url')->nullable();
            $table->text('message')->nullable();
            $table->string('photo_url')->nullable();
            $table->date('term_started_at')->nullable();
            $table->date('term_ended_at')->nullable();
            $table->text('address')->nullable();
            $table->timestamps();
        });

        Schema::create('financial_transactions', function (Blueprint $table) {
            $table->id();
            $table->date('occurred_at')->nullable()->index();
            $table->string('type', 32)->index();
            $table->string('category')->index();
            $table->decimal('amount', 12, 2);
            $table->text('remarks')->nullable();
            $table->timestamps();
        });

        Schema::create('campaigns', function (Blueprint $table) {
            $table->id();
            $table->date('occurred_at')->nullable()->index();
            $table->string('department')->nullable();
            $table->string('title')->index();
            $table->string('location')->nullable();
            $table->decimal('amount_spent', 12, 2)->default(0);
            $table->unsignedInteger('trees_planted')->default(0);
            $table->text('description')->nullable();
            $table->string('status')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('media_items', function (Blueprint $table) {
            $table->id();
            $table->string('type')->index();
            $table->string('title')->nullable();
            $table->text('content')->nullable();
            $table->string('category')->nullable();
            $table->text('description')->nullable();
            $table->string('url')->nullable();
            $table->date('published_at')->nullable()->index();
            $table->timestamps();
        });

        Schema::create('organization_details', function (Blueprint $table) {
            $table->id();
            $table->string('topic')->unique();
            $table->longText('description')->nullable();
            $table->timestamp('source_updated_at')->nullable();
            $table->timestamps();
        });

        Schema::create('admins', function (Blueprint $table) {
            $table->id();
            $table->string('username')->unique();
            $table->string('password');
            $table->string('name');
            $table->string('role')->default('Admin');
            $table->boolean('is_active')->default(true)->index();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->timestamp('occurred_at')->nullable()->index();
            $table->string('admin_name')->nullable();
            $table->string('action')->index();
            $table->text('details')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
        Schema::dropIfExists('admins');
        Schema::dropIfExists('organization_details');
        Schema::dropIfExists('media_items');
        Schema::dropIfExists('campaigns');
        Schema::dropIfExists('financial_transactions');
        Schema::dropIfExists('committee_members');
        Schema::dropIfExists('blood_donations');
        Schema::dropIfExists('blood_donors');
        Schema::dropIfExists('payments');
        Schema::dropIfExists('members');
    }
};
