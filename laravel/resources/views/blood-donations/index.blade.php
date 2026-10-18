@extends('layouts.portal')

@section('title', 'রক্তদান খতিয়ান | আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <div class="section-heading" style="margin-top: 0">
        <div><p class="eyebrow">রক্তদান কার্যক্রম</p><h1>অনুমোদিত রক্তদান খতিয়ান</h1></div>
        <a class="button" href="{{ route('blood-donation-logs.create') }}">রিপোর্ট জমা দিন</a>
    </div>
    <div class="table-wrap">
        @if ($donations->isEmpty())
            <p class="empty">এখনো কোনো অনুমোদিত রক্তদান খতিয়ান নেই।</p>
        @else
            <table>
                <thead><tr><th>তারিখ</th><th>দাতা</th><th>রক্তের গ্রুপ</th><th>গ্রহীতা</th><th>কারণ</th><th>এলাকা</th></tr></thead>
                <tbody>
                    @foreach ($donations as $donation)
                        <tr>
                            <td>{{ $donation->donated_at?->format('d-m-Y') }}</td>
                            <td>{{ $donation->donor_name }}<br><span class="muted">{{ $donation->donor_phone }}</span></td>
                            <td>{{ $donation->blood_group }}</td>
                            <td>{{ $donation->recipient_name }}</td>
                            <td>{{ $donation->medical_need }}</td>
                            <td>{{ $donation->recipient_address }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>
@endsection