@extends('layouts.portal')

@section('title', 'রক্তদাতা তালিকা | আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <div class="section-heading" style="margin-top: 0">
        <div><p class="eyebrow">রক্তদান কার্যক্রম</p><h1>সক্রিয় রক্তদাতা</h1></div>
        <a class="button" href="{{ route('blood-donors.create') }}">ডোনার নিবন্ধন</a>
    </div>
    <div class="table-wrap">
        @if ($donors->isEmpty())
            <p class="empty">এখনো কোনো সক্রিয় রক্তদাতা নেই।</p>
        @else
            <table>
                <thead><tr><th>নাম</th><th>রক্তের গ্রুপ</th><th>এলাকা</th><th>যোগাযোগ</th><th>সর্বশেষ রক্তদান</th></tr></thead>
                <tbody>
                    @foreach ($donors as $donor)
                        <tr>
                            <td>{{ $donor->name }}</td>
                            <td>{{ $donor->blood_group }}</td>
                            <td>{{ collect([$donor->upazila, $donor->district])->filter()->join(', ') ?: 'আউলিয়াপুর' }}</td>
                            <td><a href="tel:{{ $donor->phone }}">{{ $donor->phone }}</a></td>
                            <td>{{ $donor->last_donation_at?->format('d-m-Y') ?: 'উল্লেখ নেই' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>
@endsection