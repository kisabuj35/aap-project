<!doctype html>
<html lang="bn">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'আউলিয়াপুর অগ্রযাত্রা পরিষদ')</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            color-scheme: light;
            --ink: #18352f;
            --muted: #61736e;
            --green: #16745b;
            --green-dark: #0f4f40;
            --mint: #e4f1e9;
            --paper: #f7f8f3;
            --line: #d8e2db;
            --white: #fff;
            --gold: #dda83e;
            --danger: #a33b32;
        }
        * { box-sizing: border-box; }
        body { margin: 0; color: var(--ink); background: var(--paper); font-family: 'Hind Siliguri', sans-serif; font-size: 16px; }
        a { color: inherit; }
        .topline { height: 5px; background: linear-gradient(90deg, var(--green-dark) 0 72%, var(--gold) 72%); }
        .site-header { background: var(--white); border-bottom: 1px solid var(--line); }
        .header-inner, .main, .footer-inner { width: min(1120px, calc(100% - 40px)); margin-inline: auto; }
        .header-inner { min-height: 76px; display: flex; align-items: center; justify-content: space-between; gap: 24px; }
        .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; }
        .brand-mark { display: grid; width: 42px; aspect-ratio: 1; place-items: center; border-radius: 50%; background: var(--green-dark); color: white; font-size: 17px; font-weight: 700; }
        .brand-name { margin: 0; font-size: 17px; font-weight: 700; line-height: 1.2; }
        .brand-subtitle { margin: 3px 0 0; color: var(--muted); font-size: 12px; }
        .nav { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .nav a { padding: 8px 12px; border-radius: 5px; color: var(--muted); font-size: 14px; text-decoration: none; }
        .nav a:hover, .nav a[aria-current="page"] { color: var(--green-dark); background: var(--mint); }
        .main { min-height: calc(100vh - 154px); padding-block: 44px 64px; }
        .eyebrow { margin: 0 0 8px; color: var(--green); font-size: 13px; font-weight: 700; }
        h1, h2, p { margin-top: 0; }
        h1 { margin-bottom: 10px; font-size: clamp(28px, 5vw, 40px); line-height: 1.2; }
        h2 { font-size: 22px; }
        .muted { color: var(--muted); }
        .button { display: inline-flex; min-height: 42px; align-items: center; justify-content: center; gap: 8px; padding: 9px 17px; border: 1px solid transparent; border-radius: 5px; background: var(--green); color: white; font: inherit; font-weight: 700; text-decoration: none; cursor: pointer; }
        .button:hover { background: var(--green-dark); }
        .button-secondary { background: white; color: var(--green-dark); border-color: var(--line); }
        .button-secondary:hover { background: var(--mint); }
        .hero { display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(220px, .6fr); gap: 28px; align-items: center; padding: clamp(24px, 5vw, 48px); border-left: 5px solid var(--gold); background: var(--green-dark); color: white; }
        .hero .eyebrow { color: #bfe2cc; }
        .hero p { max-width: 600px; margin-bottom: 22px; color: #e3eee7; }
        .hero .button { background: #e9b74c; color: #273b2e; }
        .stat { justify-self: center; padding-left: 28px; border-left: 1px solid #ffffff45; text-align: center; }
        .stat strong { display: block; font-size: 48px; line-height: 1; }
        .stat span { display: block; margin-top: 7px; color: #dcebe1; font-size: 14px; }
        .section-heading { display: flex; justify-content: space-between; align-items: end; gap: 20px; margin: 38px 0 16px; }
        .section-heading h2 { margin: 0; }
        .form-shell { max-width: 860px; margin-inline: auto; }
        .form-panel { padding: clamp(20px, 4vw, 34px); border: 1px solid var(--line); border-radius: 6px; background: white; }
        .form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px 20px; }
        .field { min-width: 0; }
        .field-full { grid-column: 1 / -1; }
        label { display: block; margin-bottom: 5px; font-size: 14px; font-weight: 600; }
        .required { color: var(--danger); }
        input, select, textarea { display: block; width: 100%; min-height: 42px; padding: 9px 11px; border: 1px solid #c7d3cb; border-radius: 4px; background: white; color: var(--ink); font: inherit; }
        textarea { min-height: 86px; resize: vertical; }
        input:focus, select:focus, textarea:focus { outline: 2px solid #77b69c; outline-offset: 1px; border-color: var(--green); }
        .error { margin: 4px 0 0; color: var(--danger); font-size: 13px; }
        .notice { margin-bottom: 18px; padding: 12px 15px; border-left: 4px solid var(--green); background: var(--mint); }
        .form-actions { display: flex; justify-content: flex-end; margin-top: 22px; }
        .table-wrap { overflow-x: auto; border: 1px solid var(--line); border-radius: 5px; background: white; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th, td { padding: 12px 15px; border-bottom: 1px solid var(--line); }
        th { background: #edf3ee; color: var(--green-dark); font-size: 14px; }
        tr:last-child td { border-bottom: 0; }
        .empty { padding: 28px; text-align: center; color: var(--muted); }
        .site-footer { border-top: 1px solid var(--line); background: white; }
        .footer-inner { display: flex; justify-content: space-between; gap: 16px; padding-block: 17px; color: var(--muted); font-size: 13px; }
        @media (max-width: 680px) {
            .header-inner { align-items: flex-start; flex-direction: column; gap: 10px; padding-block: 14px; }
            .nav { width: 100%; }
            .nav a { padding-inline: 8px; }
            .main { padding-top: 25px; }
            .hero { grid-template-columns: 1fr; gap: 20px; }
            .stat { justify-self: start; padding: 0; border: 0; text-align: left; }
            .stat strong { font-size: 36px; }
            .form-grid { grid-template-columns: 1fr; }
            .field-full { grid-column: auto; }
            .footer-inner { flex-direction: column; gap: 4px; }
        }
    </style>
</head>
<body>
    <div class="topline"></div>
    <header class="site-header">
        <div class="header-inner">
            <a class="brand" href="{{ route('home') }}">
                <span class="brand-mark" aria-hidden="true">আ</span>
                <span>
                    <span class="brand-name">আউলিয়াপুর অগ্রযাত্রা পরিষদ</span>
                    <span class="brand-subtitle">মানবিক সেবা, পটুয়াখালী</span>
                </span>
            </a>
            <nav class="nav" aria-label="প্রধান নেভিগেশন">
                <a href="{{ route('home') }}" @if(request()->routeIs('home')) aria-current="page" @endif>হোম</a>
                <a href="{{ route('members.index') }}" @if(request()->routeIs('members.index')) aria-current="page" @endif>সদস্য তালিকা</a>
                <a href="{{ route('members.create') }}" @if(request()->routeIs('members.create')) aria-current="page" @endif>নিবন্ধন</a>
                <a href="{{ route('blood-donors.index') }}" @if(request()->routeIs('blood-donors.index')) aria-current="page" @endif>রক্তদাতা</a>
                <a href="{{ route('blood-donors.create') }}" @if(request()->routeIs('blood-donors.create')) aria-current="page" @endif>ডোনার নিবন্ধন</a>
                <a href="{{ route('payments.create') }}" @if(request()->routeIs('payments.create')) aria-current="page" @endif>চাঁদা / অনুদান</a>
            </nav>
        </div>
    </header>
    <main class="main">
        @yield('content')
    </main>
    <footer class="site-footer">
        <div class="footer-inner">
            <span>আউলিয়াপুর অগ্রযাত্রা পরিষদ</span>
            <span>পটুয়াখালী, বাংলাদেশ</span>
        </div>
    </footer>
</body>
</html>