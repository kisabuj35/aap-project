@extends('layouts.portal')

@section('title', 'আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <section class="hero">
        <div>
            <p class="eyebrow">আজকের উদ্যোগ, আগামীর অগ্রযাত্রা</p>
            <h1>আউলিয়াপুর অগ্রযাত্রা পরিষদ</h1>
            <p>শিক্ষা, পরিবেশ, স্বাস্থ্য ও মানবিক সেবায় স্থানীয় মানুষের সম্মিলিত উদ্যোগ।</p>
            <a class="button" href="{{ route('members.create') }}">সদস্য নিবন্ধন <span aria-hidden="true">→</span></a>
        </div>
        <div class="stat">
            <strong>{{ $activeMemberCount }}</strong>
            <span>সক্রিয় সদস্য</span>
        </div>
    </section>

    <div class="section-heading">
        <div>
            <p class="eyebrow">সদস্য পোর্টাল</p>
            <h2>সংগঠনের সদস্য কার্যক্রম</h2>
        </div>
    </div>
    <p class="muted">সদস্যদের তথ্য দেখতে বা নতুন সদস্য হিসেবে আবেদন করতে নিচের পোর্টাল ব্যবহার করুন।</p>
    <p>
        <a class="button button-secondary" href="{{ route('members.index') }}">সদস্য তালিকা</a>
        <a class="button" href="{{ route('members.create') }}">নতুন আবেদন</a>
    </p>
@endsection