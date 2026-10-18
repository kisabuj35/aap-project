@extends('layouts.portal')

@section('title', 'রক্তদান রিপোর্ট | আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <div class="form-shell">
        <p class="eyebrow">রক্তদান কার্যক্রম</p>
        <h1>রক্তদান রিপোর্ট</h1>
        <p class="muted">রক্তদাতা ও গ্রহীতার তথ্য দিয়ে রিপোর্ট জমা দিন। অনুমোদনের পর খতিয়ানে প্রকাশ হবে।</p>
        @if (session('blood_donation_submitted'))
            <div class="notice" role="status">রিপোর্ট জমা হয়েছে। যাচাইয়ের পর খতিয়ানে প্রকাশ করা হবে।</div>
        @endif
        <form class="form-panel" method="POST" action="{{ route('blood-donation-logs.store') }}" id="blood-donation-form">
            @csrf
            <div class="form-grid">
                <div class="field">
                    <label for="donorType">রক্তদাতার ধরন <span class="required">*</span></label>
                    <select id="donorType" name="donorType" required>
                        <option value="সদস্য" @selected(old('donorType', 'সদস্য') === 'সদস্য')>সংগঠনের সদস্য</option>
                        <option value="সাধারণ" @selected(old('donorType') === 'সাধারণ')>সাধারণ রক্তদাতা</option>
                    </select>
                </div>
                <div class="field" id="member-id-field">
                    <label for="donorId">সক্রিয় সদস্য আইডি <span class="required">*</span></label>
                    <input id="donorId" name="donorId" value="{{ old('donorId') }}" maxlength="32">
                    @error('donorId')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="donorName">রক্তদাতার নাম <span class="required">*</span></label>
                    <input id="donorName" name="donorName" value="{{ old('donorName') }}" required maxlength="255">
                    @error('donorName')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="donorFather">পিতার নাম <span class="required">*</span></label>
                    <input id="donorFather" name="donorFather" value="{{ old('donorFather') }}" required maxlength="255">
                    @error('donorFather')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="donorBlood">রক্তের গ্রুপ <span class="required">*</span></label>
                    <select id="donorBlood" name="donorBlood" required>
                        <option value="">নির্বাচন করুন</option>
                        @foreach (['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'] as $group)
                            <option value="{{ $group }}" @selected(old('donorBlood') === $group)>{{ $group }}</option>
                        @endforeach
                    </select>
                    @error('donorBlood')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="donorPhone">দাতার মোবাইল <span class="required">*</span></label>
                    <input id="donorPhone" name="donorPhone" value="{{ old('donorPhone') }}" required maxlength="32" inputmode="tel">
                    @error('donorPhone')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="donationDate">রক্তদানের তারিখ <span class="required">*</span></label>
                    <input id="donationDate" name="donationDate" type="date" value="{{ old('donationDate') }}" required>
                    @error('donationDate')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="donor-photo">দাতার ছবি</label>
                    <input id="donor-photo" type="file" accept="image/jpeg,image/png,image/webp">
                    <input id="donorPhotoData" name="donorPhotoData" type="hidden">
                    @error('donorPhotoData')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="recipientName">রক্তগ্রহীতার নাম <span class="required">*</span></label>
                    <input id="recipientName" name="recipientName" value="{{ old('recipientName') }}" required maxlength="255">
                    @error('recipientName')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="recipientPhone">গ্রহীতার মোবাইল <span class="required">*</span></label>
                    <input id="recipientPhone" name="recipientPhone" value="{{ old('recipientPhone') }}" required maxlength="32" inputmode="tel">
                    @error('recipientPhone')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="recipientAddress">গ্রহীতার ঠিকানা <span class="required">*</span></label>
                    <input id="recipientAddress" name="recipientAddress" value="{{ old('recipientAddress') }}" required maxlength="1000">
                    @error('recipientAddress')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="recipientDisease">রক্তের প্রয়োজনের কারণ <span class="required">*</span></label>
                    <input id="recipientDisease" name="recipientDisease" value="{{ old('recipientDisease') }}" required maxlength="255">
                    @error('recipientDisease')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="recipient-photo">গ্রহীতার ছবি</label>
                    <input id="recipient-photo" type="file" accept="image/jpeg,image/png,image/webp">
                    <input id="recipientPhotoData" name="recipientPhotoData" type="hidden">
                    @error('recipientPhotoData')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field field-full">
                    <label for="remarks">মন্তব্য</label>
                    <textarea id="remarks" name="remarks" maxlength="2000">{{ old('remarks') }}</textarea>
                </div>
                <div class="field field-full">
                    <label><input type="checkbox" name="consent" value="1" required @checked(old('consent')) style="display: inline-block; width: auto; min-height: auto; margin-right: 6px">রক্তদান-সম্পর্কিত তথ্য সংরক্ষণে সম্মতি দিচ্ছি।</label>
                    @error('consent')<p class="error">{{ $message }}</p>@enderror
                </div>
            </div>
            <div class="form-actions"><button class="button" type="submit">রিপোর্ট জমা দিন</button></div>
        </form>
    </div>
    <script>
        const donorType = document.getElementById('donorType');
        const donorId = document.getElementById('donorId');
        const memberIdField = document.getElementById('member-id-field');
        const donationForm = document.getElementById('blood-donation-form');

        function updateMemberRequirement() {
            const isMember = donorType.value === 'সদস্য';
            memberIdField.hidden = !isMember;
            donorId.required = isMember;
            if (!isMember) donorId.value = '';
        }

        donorType.addEventListener('change', updateMemberRequirement);
        updateMemberRequirement();

        for (const [inputId, dataId] of [['donor-photo', 'donorPhotoData'], ['recipient-photo', 'recipientPhotoData']]) {
            const input = document.getElementById(inputId);
            const data = document.getElementById(dataId);
            input.addEventListener('change', () => {
                const [file] = input.files;
                data.value = '';
                if (!file) return;
                if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                    input.value = '';
                    window.alert('ছবি ৫ এমবির মধ্যে JPEG, PNG অথবা WEBP হতে হবে।');
                    return;
                }
                const reader = new FileReader();
                reader.addEventListener('load', () => { data.value = reader.result; });
                reader.readAsDataURL(file);
            });
        }

        donationForm.addEventListener('submit', (event) => {
            if (Array.from(donationForm.querySelectorAll('input[type="file"]')).some(input => input.files.length && !input.nextElementSibling.value)) {
                event.preventDefault();
                window.alert('ছবি প্রস্তুত হচ্ছে, একটু পরে আবার জমা দিন।');
            }
        });
    </script>
@endsection