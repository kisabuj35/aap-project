@extends('layouts.portal')

@section('title', 'রক্তদাতা নিবন্ধন | আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <div class="form-shell">
        <p class="eyebrow">রক্তদান কার্যক্রম</p>
        <h1>রক্তদাতা নিবন্ধন</h1>
        <p class="muted">জরুরি প্রয়োজনে যোগাযোগের জন্য আপনার তথ্য দিন।</p>
        @if (session('donor_registered'))
            <div class="notice" role="status">রক্তদাতা হিসেবে আপনার নিবন্ধন সম্পন্ন হয়েছে।</div>
        @endif
        <form class="form-panel" method="POST" action="{{ route('blood-donors.store') }}" id="donor-form">
            @csrf
            <div class="form-grid">
                <div class="field">
                    <label for="donorType">ডোনারের ধরন <span class="required">*</span></label>
                    <select id="donorType" name="donorType" required>
                        <option value="সাধারণ ডোনার" @selected(old('donorType', 'সাধারণ ডোনার') === 'সাধারণ ডোনার')>সাধারণ ডোনার</option>
                        <option value="সদস্য" @selected(old('donorType') === 'সদস্য')>সদস্য</option>
                    </select>
                </div>
                <div class="field" id="member-id-field" hidden>
                    <label for="donorId">সক্রিয় সদস্য আইডি <span class="required">*</span></label>
                    <input id="donorId" name="donorId" value="{{ old('donorId') }}" maxlength="32">
                    @error('donorId')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="name">নাম <span class="required">*</span></label>
                    <input id="name" name="name" value="{{ old('name') }}" required maxlength="255">
                    @error('name')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="phone">মোবাইল নম্বর <span class="required">*</span></label>
                    <input id="phone" name="phone" value="{{ old('phone') }}" required maxlength="32" inputmode="tel">
                    @error('phone')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="gender">লিঙ্গ</label>
                    <select id="gender" name="gender"><option value="">নির্বাচন করুন</option><option value="পুরুষ">পুরুষ</option><option value="নারী">নারী</option><option value="অন্যান্য">অন্যান্য</option></select>
                </div>
                <div class="field">
                    <label for="bloodGroup">রক্তের গ্রুপ <span class="required">*</span></label>
                    <select id="bloodGroup" name="bloodGroup" required>
                        <option value="">নির্বাচন করুন</option>
                        @foreach (['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'] as $group)
                            <option value="{{ $group }}" @selected(old('bloodGroup') === $group)>{{ $group }}</option>
                        @endforeach
                    </select>
                    @error('bloodGroup')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field"><label for="dob">জন্ম তারিখ</label><input id="dob" name="dob" type="date" value="{{ old('dob') }}"></div>
                <div class="field"><label for="lastDonationDate">সর্বশেষ রক্তদানের তারিখ</label><input id="lastDonationDate" name="lastDonationDate" type="date" value="{{ old('lastDonationDate') }}"></div>
                <div class="field"><label for="weight">ওজন (কেজি)</label><input id="weight" name="weight" type="number" min="0" max="999.99" step="0.01" value="{{ old('weight') }}"></div>
                <div class="field"><label for="division">বিভাগ</label><input id="division" name="division" value="{{ old('division') }}" maxlength="255"></div>
                <div class="field"><label for="district">জেলা</label><input id="district" name="district" value="{{ old('district') }}" maxlength="255"></div>
                <div class="field"><label for="upazila">উপজেলা</label><input id="upazila" name="upazila" value="{{ old('upazila') }}" maxlength="255"></div>
                <div class="field field-full"><label for="village">ইউনিয়ন / গ্রাম</label><input id="village" name="village" value="{{ old('village') }}" maxlength="1000"></div>
                <div class="field field-full">
                    <label for="photo-file">ছবি</label>
                    <input id="photo-file" type="file" accept="image/jpeg,image/png,image/webp">
                    <input id="photoData" name="photoData" type="hidden">
                    <p id="photo-error" class="error" hidden>৫ এমবির মধ্যে JPEG, PNG অথবা WEBP ছবি দিন।</p>
                    @error('photoData')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field field-full">
                    <label><input type="checkbox" name="consent" value="1" required @checked(old('consent')) style="display: inline-block; width: auto; min-height: auto; margin-right: 6px">জরুরি রক্তের প্রয়োজনে আমার নাম, রক্তের গ্রুপ ও ফোন নম্বর প্রকাশে সম্মতি দিচ্ছি।</label>
                    @error('consent')<p class="error">{{ $message }}</p>@enderror
                </div>
            </div>
            <div class="form-actions"><button class="button" id="submit-button" type="submit">নিবন্ধন করুন</button></div>
        </form>
    </div>
    <script>
        const donorType = document.getElementById('donorType');
        const memberIdField = document.getElementById('member-id-field');
        const donorId = document.getElementById('donorId');
        const photoInput = document.getElementById('photo-file');
        const photoData = document.getElementById('photoData');
        const photoError = document.getElementById('photo-error');
        const donorForm = document.getElementById('donor-form');
        const submitButton = document.getElementById('submit-button');

        function updateMemberField() {
            const isMember = donorType.value === 'সদস্য';
            memberIdField.hidden = !isMember;
            donorId.required = isMember;
            if (!isMember) donorId.value = '';
        }

        donorType.addEventListener('change', updateMemberField);
        updateMemberField();
        photoInput.addEventListener('change', () => {
            const [file] = photoInput.files;
            photoData.value = '';
            photoError.hidden = true;
            if (!file) return;
            if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
                photoInput.value = '';
                photoError.hidden = false;
                return;
            }
            const reader = new FileReader();
            reader.addEventListener('load', () => { photoData.value = reader.result; });
            reader.readAsDataURL(file);
        });
        donorForm.addEventListener('submit', (event) => {
            if (photoInput.files.length > 0 && photoData.value === '') {
                event.preventDefault();
                photoError.hidden = false;
                return;
            }
            submitButton.disabled = true;
            submitButton.textContent = 'জমা হচ্ছে...';
        });
    </script>
@endsection