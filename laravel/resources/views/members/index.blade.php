@extends('layouts.portal')

@section('title', 'সদস্য তালিকা | আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <div class="section-heading" style="margin-top: 0">
        <div>
            <p class="eyebrow">সদস্য পোর্টাল</p>
            <h1>সক্রিয় সদস্য তালিকা</h1>
        </div>
        <a class="button" href="{{ route('members.create') }}">সদস্য নিবন্ধন</a>
    </div>
    <div class="table-wrap">
        @if ($members->isEmpty())
            <p class="empty">এখনো কোনো সক্রিয় সদস্য নেই।</p>
        @else
            <table>
                <thead>
                    <tr><th>সদস্য আইডি</th><th>নাম</th><th>রক্তের গ্রুপ</th></tr>
                </thead>
                <tbody>
                    @foreach ($members as $member)
                        <tr>
                            <td>{{ $member->member_id }}</td>
                            <td>{{ $member->name }}</td>
                            <td>{{ $member->blood_group ?: 'উল্লেখ নেই' }}</td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        @endif
    </div>
@endsection