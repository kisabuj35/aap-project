@extends('layouts.portal')

@section('title', 'চাঁদা ও অনুদান | আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <div class="form-shell">
        <p class="eyebrow">সদস্য পোর্টাল</p>
        <h1>চাঁদা বা অনুদান জমা</h1>
        <p class="muted">পেমেন্টের তথ্য জমা দিন। যাচাই না হওয়া পর্যন্ত স্লিপটি pending থাকবে।</p>
        @if (session('payment_submitted'))
            <div class="notice" role="status">পেমেন্ট স্লিপ জমা হয়েছে। যাচাই শেষে হিসাব হালনাগাদ করা হবে।</div>
        @endif
        <form class="form-panel" method="POST" action="{{ route('payments.store') }}">
            @csrf
            <div class="form-grid">
                <div class="field">
                    <label for="memberId">সদস্য আইডি</label>
                    <input id="memberId" name="memberId" value="{{ old('memberId') }}" maxlength="32" placeholder="সাধারণ অনুদান হলে খালি রাখুন">
                    @error('memberId')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="name">প্রদানকারীর নাম <span class="required">*</span></label>
                    <input id="name" name="name" value="{{ old('name') }}" required maxlength="255">
                    @error('name')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="fiscalYear">অর্থবছর</label>
                    <input id="fiscalYear" name="fiscalYear" value="{{ old('fiscalYear') }}" maxlength="16" placeholder="২০২৬-২০২৭">
                </div>
                <div class="field">
                    <label for="month">চাঁদা / অনুদানের বিবরণ <span class="required">*</span></label>
                    <input id="month" name="month" value="{{ old('month') }}" required maxlength="100" placeholder="জুন মাসের চাঁদা">
                    @error('month')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="amount">টাকার পরিমাণ <span class="required">*</span></label>
                    <input id="amount" name="amount" type="number" min="0.01" step="0.01" value="{{ old('amount') }}" required>
                    @error('amount')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="phone">মোবাইল নম্বর <span class="required">*</span></label>
                    <input id="phone" name="phone" value="{{ old('phone') }}" required maxlength="32" inputmode="tel">
                    @error('phone')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="method">পেমেন্ট মাধ্যম <span class="required">*</span></label>
                    <select id="method" name="method" required>
                        <option value="">নির্বাচন করুন</option>
                        @foreach (['বিকাশ', 'নগদ', 'রকেট', 'ব্যাংক', 'নগদ অর্থ'] as $method)
                            <option value="{{ $method }}" @selected(old('method') === $method)>{{ $method }}</option>
                        @endforeach
                    </select>
                    @error('method')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="txnId">ট্রানজেকশন আইডি</label>
                    <input id="txnId" name="txnId" value="{{ old('txnId') }}" maxlength="255">
                </div>
            </div>
            <div class="form-actions"><button class="button" type="submit">পেমেন্ট স্লিপ জমা দিন</button></div>
        </form>
    </div>
@endsection