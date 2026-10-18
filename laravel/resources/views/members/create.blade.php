@extends('layouts.portal')

@section('title', 'সদস্য নিবন্ধন | আউলিয়াপুর অগ্রযাত্রা পরিষদ')

@section('content')
    <div class="form-shell">
        <p class="eyebrow">সদস্য পোর্টাল</p>
        <h1>সদস্য নিবন্ধন</h1>
        <p class="muted">প্রয়োজনীয় তথ্য দিয়ে আবেদন জমা দিন।</p>

        @if (session('member_id'))
            <div class="notice" role="status">আবেদন জমা হয়েছে। আপনার সদস্য আইডি: <strong>{{ session('member_id') }}</strong></div>
        @endif

        <form class="form-panel" method="POST" action="{{ route('members.store') }}" id="member-form">
            @csrf
            <div class="form-grid">
                <div class="field">
                    <label for="name">সদস্যের নাম <span class="required">*</span></label>
                    <input id="name" name="name" value="{{ old('name') }}" required maxlength="255" autocomplete="name">
                    @error('name')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="phone">মোবাইল নম্বর <span class="required">*</span></label>
                    <input id="phone" name="phone" value="{{ old('phone') }}" required maxlength="32" inputmode="tel" autocomplete="tel">
                    @error('phone')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field">
                    <label for="fatherName">পিতার নাম</label>
                    <input id="fatherName" name="fatherName" value="{{ old('fatherName') }}" maxlength="255">
                </div>
                <div class="field">
                    <label for="motherName">মাতার নাম</label>
                    <input id="motherName" name="motherName" value="{{ old('motherName') }}" maxlength="255">
                </div>
                <div class="field">
                    <label for="gender">লিঙ্গ</label>
                    <select id="gender" name="gender">
                        <option value="">নির্বাচন করুন</option>
                        @foreach (['পুরুষ', 'নারী', 'অন্যান্য'] as $gender)
                            <option value="{{ $gender }}" @selected(old('gender') === $gender)>{{ $gender }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="bloodGroup">রক্তের গ্রুপ</label>
                    <select id="bloodGroup" name="bloodGroup">
                        <option value="">নির্বাচন করুন</option>
                        @foreach (['A+', 'B+', 'AB+', 'O+', 'A-', 'B-', 'AB-', 'O-'] as $bloodGroup)
                            <option value="{{ $bloodGroup }}" @selected(old('bloodGroup') === $bloodGroup)>{{ $bloodGroup }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="education">শিক্ষাগত যোগ্যতা</label>
                    <input id="education" name="education" value="{{ old('education') }}" maxlength="255">
                </div>
                <div class="field">
                    <label for="profession">পেশা</label>
                    <input id="profession" name="profession" value="{{ old('profession') }}" maxlength="255">
                </div>
                <div class="field">
                    <label for="designation">সংগঠনে পদবি</label>
                    <input id="designation" name="designation" value="{{ old('designation', 'সাধারণ সদস্য') }}" maxlength="255">
                </div>
                <div class="field">
                    <label for="memberType">সদস্যের ধরন</label>
                    <select id="memberType" name="memberType">
                        @foreach (['সাধারণ সদস্য', 'আজীবন সদস্য'] as $memberType)
                            <option value="{{ $memberType }}" @selected(old('memberType', 'সাধারণ সদস্য') === $memberType)>{{ $memberType }}</option>
                        @endforeach
                    </select>
                </div>
                <div class="field">
                    <label for="joinDate">যোগদানের তারিখ</label>
                    <input id="joinDate" name="joinDate" type="date" value="{{ old('joinDate') }}">
                </div>
                <div class="field">
                    <label for="monthlyFee">মাসিক নির্ধারিত চাঁদা</label>
                    <input id="monthlyFee" name="monthlyFee" type="number" min="0" step="0.01" value="{{ old('monthlyFee', '0') }}">
                </div>
                <div class="field">
                    <label for="nid">জাতীয় পরিচয়পত্র নম্বর</label>
                    <input id="nid" name="nid" value="{{ old('nid') }}" maxlength="32" inputmode="numeric">
                </div>
                <div class="field">
                    <label for="email">ইমেইল</label>
                    <input id="email" name="email" type="email" value="{{ old('email') }}" maxlength="255" autocomplete="email">
                </div>
                <div class="field field-full">
                    <label for="address">ঠিকানা</label>
                    <textarea id="address" name="address" maxlength="2000">{{ old('address') }}</textarea>
                </div>
                <div class="field">
                    <label for="fbLink">ফেসবুক প্রোফাইল লিংক</label>
                    <input id="fbLink" name="fbLink" type="url" value="{{ old('fbLink') }}" maxlength="2048">
                </div>
                <div class="field">
                    <label for="photo-file">ছবি</label>
                    <input id="photo-file" type="file" accept="image/jpeg,image/png,image/webp">
                    <input id="photoData" name="photoData" type="hidden">
                    <p id="photo-error" class="error" hidden>ছবিটি ৫ এমবির মধ্যে JPEG, PNG অথবা WEBP হতে হবে।</p>
                    @error('photoData')<p class="error">{{ $message }}</p>@enderror
                </div>
                <div class="field field-full">
                    <label for="comments">অতিরিক্ত তথ্য</label>
                    <textarea id="comments" name="comments" maxlength="2000">{{ old('comments') }}</textarea>
                </div>
                <div class="field field-full">
                    <label><input type="checkbox" name="consent" value="1" required @checked(old('consent')) style="display: inline-block; width: auto; min-height: auto; margin-right: 6px">আমি সদস্যতার নিয়ম মেনে চলতে সম্মত।</label>
                    @error('consent')<p class="error">{{ $message }}</p>@enderror
                </div>
            </div>
            <div class="form-actions">
                <button class="button" type="submit" id="submit-button">আবেদন জমা দিন</button>
            </div>
        </form>
    </div>
    <script>
        const photoInput = document.getElementById('photo-file');
        const photoData = document.getElementById('photoData');
        const photoError = document.getElementById('photo-error');
        const memberForm = document.getElementById('member-form');
        const submitButton = document.getElementById('submit-button');

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

        memberForm.addEventListener('submit', (event) => {
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