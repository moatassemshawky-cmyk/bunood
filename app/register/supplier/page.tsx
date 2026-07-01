'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './page.css';

/* ══════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════ */

type Step = 1 | 2 | 3;
type Anim = 'forward' | 'back' | '';
type StrScore = 0 | 1 | 2 | 3 | 4;

interface FormData {
  companyName:     string;
  contactPerson:   string;
  mobile:          string;
  email:           string;
  password:        string;
  confirmPassword: string;
  categories:      string[];
  deliveryAreas:   string[];
  termsAccepted:   boolean;
}
type FieldKey = keyof FormData;
type FieldVal = string | boolean | string[];
type FieldErrors = Partial<Record<FieldKey, string>>;
type Touched     = Partial<Record<FieldKey, boolean>>;

/* ══════════════════════════════════════════════════════════════
   Bilingual data
   ══════════════════════════════════════════════════════════════ */

const CATEGORIES_DATA = [
  { id: 'Cement',              en: 'Cement',              ar: 'أسمنت' },
  { id: 'Ready Mix Concrete',  en: 'Ready Mix Concrete',  ar: 'خرسانة جاهزة' },
  { id: 'Steel',               en: 'Steel',               ar: 'حديد' },
  { id: 'Blocks',              en: 'Blocks',              ar: 'بلوك / طوب' },
  { id: 'Sand & Aggregates',   en: 'Sand & Aggregates',   ar: 'رمل وركام' },
  { id: 'Electrical',          en: 'Electrical',          ar: 'كهرباء' },
  { id: 'Plumbing',            en: 'Plumbing',            ar: 'سباكة' },
  { id: 'HVAC',                en: 'HVAC',                ar: 'تكييف وتهوية' },
  { id: 'Finishing Materials', en: 'Finishing Materials', ar: 'مواد تشطيب' },
  { id: 'Paint',               en: 'Paint',               ar: 'دهانات' },
  { id: 'Heavy Equipment',     en: 'Heavy Equipment',     ar: 'معدات ثقيلة' },
  { id: 'Safety Equipment',    en: 'Safety Equipment',    ar: 'معدات سلامة' },
  { id: 'Chemicals',           en: 'Chemicals',           ar: 'مواد كيماوية' },
  { id: 'Waterproofing',       en: 'Waterproofing',       ar: 'عزل مائي' },
  { id: 'Other',               en: 'Other',               ar: 'أخرى' },
];

const AREAS_DATA = [
  { id: 'all',     en: 'All Cairo',      enSub: 'Full Cairo coverage',                       ar: 'كل القاهرة',   arSub: 'تغطية كاملة للقاهرة' },
  { id: 'north',   en: 'North Cairo',    enSub: 'Shubra, El Marg, Ain Shams, El Salam',     ar: 'شمال القاهرة', arSub: 'شبرا، المرج، عين شمس، السلام' },
  { id: 'east',    en: 'East Cairo',     enSub: 'Nasr City, Heliopolis, New Cairo',          ar: 'شرق القاهرة',  arSub: 'مدينة نصر، مصر الجديدة، القاهرة الجديدة' },
  { id: 'west',    en: 'West Cairo',     enSub: '6th of October, Sheikh Zayed',              ar: 'غرب القاهرة',  arSub: '6 أكتوبر، الشيخ زايد' },
  { id: 'south',   en: 'South Cairo',    enSub: 'Maadi, Mokattam, Helwan',                  ar: 'جنوب القاهرة', arSub: 'المعادي، المقطم، حلوان' },
  { id: 'central', en: 'Central Cairo',  enSub: 'Downtown, Garden City, Zamalek',            ar: 'وسط القاهرة',  arSub: 'وسط البلد، جاردن سيتي، الزمالك' },
  { id: 'giza',    en: 'Giza',           enSub: 'Dokki, Mohandessin, Haram, Faisal, Imbaba', ar: 'الجيزة',       arSub: 'الدقي، المهندسين، الهرم، فيصل، إمبابة' },
];

/* ══════════════════════════════════════════════════════════════
   i18n
   ══════════════════════════════════════════════════════════════ */

const T = {
  en: {
    brand: {
      title: 'Get your first RFQ within 24 hours.',
      sub: 'Join hundreds of suppliers already receiving procurement requests from construction companies across Cairo.',
      benefits: [
        'Receive verified RFQs from contractors across Cairo',
        'AI-matched to projects that need exactly what you supply',
        'Free to join — no subscription or hidden fees',
      ],
      stats: [
        { num: '500+',   label: 'Contractors' },
        { num: '2,400+', label: 'RFQs sent'  },
        { num: 'Free',   label: 'To join'    },
      ],
    },
    pageTitle: 'Register as a Supplier',
    pageSub: 'Create your account and start receiving RFQs from contractors.',
    stepBadge: (n: number) => `Step ${n} of 3`,
    stepLabels: ['Basic Info', 'Your Business', 'Confirm'],
    step1: {
      title: 'Basic Information',
      sub: 'Your company credentials — takes under a minute.',
      companyName: 'Company Name',
      contactPerson: 'Contact Person',
      mobile: 'Mobile Number',
      email: 'Business Email (Optional)',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      nextBtn: 'Next: Your Business',
    },
    step2: {
      title: 'Your Business',
      sub: 'Help contractors discover you with the right filters.',
      categoriesLabel: 'What do you supply?',
      categoriesTrigger: 'Supplier Categories',
      areasLabel: 'Where do you deliver?',
      areasTrigger: 'Delivery Areas',
      search: 'Search…',
      noResults: (q: string) => `No results for "${q}"`,
      selected: (n: number) => `${n} selected`,
      backBtn: 'Back',
      nextBtn: 'Review & Confirm',
    },
    step3: {
      title: 'Review & Confirm',
      sub: 'Check your details before creating the account.',
      company: 'Company',
      contact: 'Contact',
      mobile: 'Mobile',
      email: 'Email',
      categories: 'Categories',
      areas: 'Delivery Areas',
      termsPrefix: "I agree to bunood's",
      termsService: 'Terms of Service',
      termsAnd: 'and',
      termsPrivacy: 'Privacy Policy',
      backBtn: 'Back',
      submitBtn: 'Create Supplier Account',
      submitting: 'Creating account…',
    },
    signin: 'Already have an account?',
    signinLink: 'Sign In',
    pwStrength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
    errors: {
      companyName:     'Company name is required',
      contactPerson:   'Contact person is required',
      mobile:          'Enter a valid mobile number',
      mobileRequired:  'Mobile number is required',
      email:           'Enter a valid email address',
      password:        'Password is required',
      passwordMin:     'Minimum 8 characters required',
      confirmPassword: 'Please confirm your password',
      confirmMismatch: 'Passwords do not match',
      categories:      'Select at least one category',
      deliveryAreas:   'Select at least one delivery area',
      termsAccepted:   'You must accept the terms to continue',
    },
    success: {
      title: "You're in!",
      sub: (name: string) => `Welcome to bunood, ${name}. Your account is ready — sign in to start receiving RFQs from contractors.`,
      btn: 'Sign In to Your Account',
      note: 'After logging in, complete your company profile to get more visibility.',
    },
  },
  ar: {
    brand: {
      title: 'استقبل أول طلب أسعار خلال ٢٤ ساعة.',
      sub: 'انضم لمئات الموردين الذين يستقبلون طلبات مشتريات من شركات المقاولات في القاهرة.',
      benefits: [
        'استقبل طلبات أسعار موثّقة من مقاولين في القاهرة',
        'نظام ذكي يطابقك مع المشاريع التي تحتاج ما توفّره',
        'مجاني تماماً — بدون اشتراك أو رسوم خفية',
      ],
      stats: [
        { num: '500+',   label: 'مقاول'       },
        { num: '2,400+', label: 'طلب أسعار'   },
        { num: 'مجاني',  label: 'الانضمام'    },
      ],
    },
    pageTitle: 'سجّل كمورّد',
    pageSub: 'أنشئ حسابك وابدأ استقبال طلبات الأسعار من المقاولين.',
    stepBadge: (n: number) => `الخطوة ${n} من ٣`,
    stepLabels: ['المعلومات الأساسية', 'نشاطك التجاري', 'التأكيد'],
    step1: {
      title: 'المعلومات الأساسية',
      sub: 'بيانات شركتك — أقل من دقيقة.',
      companyName: 'اسم الشركة',
      contactPerson: 'الشخص المسؤول',
      mobile: 'رقم الجوال',
      email: 'البريد الإلكتروني (اختياري)',
      password: 'كلمة المرور',
      confirmPassword: 'تأكيد كلمة المرور',
      nextBtn: 'التالي: نشاطك التجاري',
    },
    step2: {
      title: 'نشاطك التجاري',
      sub: 'ساعد المقاولين على اكتشافك بالفلاتر الصحيحة.',
      categoriesLabel: 'ماذا توفّر؟',
      categoriesTrigger: 'تصنيفات المورّد',
      areasLabel: 'أين توصّل؟',
      areasTrigger: 'مناطق التوصيل',
      search: 'بحث…',
      noResults: (q: string) => `لا نتائج لـ "${q}"`,
      selected: (n: number) => `${n} محدد`,
      backBtn: 'رجوع',
      nextBtn: 'مراجعة والتأكيد',
    },
    step3: {
      title: 'مراجعة والتأكيد',
      sub: 'تحقق من بياناتك قبل إنشاء الحساب.',
      company: 'الشركة',
      contact: 'المسؤول',
      mobile: 'الجوال',
      email: 'البريد الإلكتروني',
      categories: 'التصنيفات',
      areas: 'مناطق التوصيل',
      termsPrefix: 'أوافق على',
      termsService: 'شروط الخدمة',
      termsAnd: 'و',
      termsPrivacy: 'سياسة الخصوصية',
      backBtn: 'رجوع',
      submitBtn: 'إنشاء حساب مورّد',
      submitting: 'جارٍ إنشاء الحساب…',
    },
    signin: 'لديك حساب بالفعل؟',
    signinLink: 'تسجيل الدخول',
    pwStrength: ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'],
    errors: {
      companyName:     'اسم الشركة مطلوب',
      contactPerson:   'الشخص المسؤول مطلوب',
      mobile:          'أدخل رقم جوال صحيح',
      mobileRequired:  'رقم الجوال مطلوب',
      email:           'أدخل بريداً إلكترونياً صحيحاً',
      password:        'كلمة المرور مطلوبة',
      passwordMin:     'الحد الأدنى ٨ أحرف',
      confirmPassword: 'أكّد كلمة المرور',
      confirmMismatch: 'كلمتا المرور غير متطابقتين',
      categories:      'اختر تصنيفاً واحداً على الأقل',
      deliveryAreas:   'اختر منطقة توصيل واحدة على الأقل',
      termsAccepted:   'يجب قبول الشروط للمتابعة',
    },
    success: {
      title: 'أهلاً بك!',
      sub: (name: string) => `مرحباً بك في بنود، ${name}. حسابك جاهز — سجّل دخولك لبدء استقبال طلبات الأسعار.`,
      btn: 'تسجيل الدخول',
      note: 'بعد تسجيل الدخول، أكمل ملفك التجاري لمزيد من الظهور.',
    },
  },
} as const;

type Lang = keyof typeof T;
type Translations = typeof T.en;

/* ══════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════ */

function calcStrength(pw: string): { score: StrScore; label: string; color: string } {
  if (!pw) return { score: 0, label: '', color: '' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw))   s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.min(4, s) as StrScore;
  const colors: Record<StrScore, string> = { 0:'', 1:'#ef4444', 2:'#f97316', 3:'#eab308', 4:'#22c55e' };
  return { score, label: '', color: colors[score] };
}

function validate(field: FieldKey, val: FieldVal, all: FormData, t: Translations): string {
  const e = t.errors;
  switch (field) {
    case 'companyName':     return !val ? e.companyName : '';
    case 'contactPerson':   return !val ? e.contactPerson : '';
    case 'mobile':
      if (!val) return e.mobileRequired;
      if (!/^[0-9+\s\-()٠-٩]{7,15}$/.test(String(val))) return e.mobile;
      return '';
    case 'email':
      if (val && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(val))) return e.email;
      return '';
    case 'password':
      if (!val) return e.password;
      if (String(val).length < 8) return e.passwordMin;
      return '';
    case 'confirmPassword':
      if (!val) return e.confirmPassword;
      if (val !== all.password) return e.confirmMismatch;
      return '';
    case 'categories':
      return (val as string[]).length === 0 ? e.categories : '';
    case 'deliveryAreas':
      return (val as string[]).length === 0 ? e.deliveryAreas : '';
    case 'termsAccepted':
      return !val ? e.termsAccepted : '';
    default: return '';
  }
}

/* ══════════════════════════════════════════════════════════════
   Logo (links to home)
   ══════════════════════════════════════════════════════════════ */

function Logo({ light }: { light?: boolean }) {
  return (
    <a href="/" className="sr-logo" dir="ltr" aria-label="bunood — go to home">
      <svg width="30" height="30" viewBox="0 0 96 96" fill="none" aria-hidden>
        <g stroke="#2F6FE0" strokeWidth="7" strokeLinecap="round">
          <path d="M20 38 V23 Q20 20 23 20 H38" fill="none"/>
          <path d="M76 58 V73 Q76 76 73 76 H58" fill="none"/>
        </g>
        <g strokeWidth="6.5" strokeLinecap="round">
          <line x1="33" y1="38" x2="66" y2="38" stroke={light ? 'rgba(255,255,255,.8)' : '#2C313A'}/>
          <line x1="33" y1="48" x2="58" y2="48" stroke="#2F6FE0"/>
          <line x1="33" y1="58" x2="63" y2="58" stroke={light ? 'rgba(255,255,255,.8)' : '#2C313A'}/>
        </g>
      </svg>
      <span className="sr-wordmark">
        bun<span className="oo">oo</span>d
      </span>
    </a>
  );
}

/* ══════════════════════════════════════════════════════════════
   Progress Stepper
   ══════════════════════════════════════════════════════════════ */

function ProgressSteps({ current, labels }: { current: Step; labels: readonly string[] }) {
  return (
    <div className="ps-root" role="progressbar" aria-valuemin={1} aria-valuemax={3} aria-valuenow={current} aria-label={`Step ${current} of 3`}>
      {labels.map((label, i) => {
        const n = (i + 1) as Step;
        const done   = n < current;
        const active = n === current;
        return (
          <div key={n} className="ps-item">
            <div className={`ps-dot${done ? ' is-done' : active ? ' is-active' : ''}`}>
              {done
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>
                : n}
            </div>
            <span className={`ps-label${active ? ' is-active' : ''}`}>{label}</span>
            {i < labels.length - 1 && <div className={`ps-connector${done ? ' is-done' : ''}`} aria-hidden />}
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Floating Label Input
   ══════════════════════════════════════════════════════════════ */

interface FIProps {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  type?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  autoComplete?: string;
}

function FloatInput({ id, label, value, onChange, onBlur, error, required, type = 'text', inputMode, autoComplete }: FIProps) {
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;
  return (
    <div className={['fi-wrap', focused ? 'focused' : '', floated ? 'floated' : '', error ? 'has-error' : ''].filter(Boolean).join(' ')}>
      <input
        id={id} type={type} value={value} inputMode={inputMode} autoComplete={autoComplete}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => { setFocused(false); onBlur?.(); }}
        className="fi-input"
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
      />
      <label htmlFor={id} className="fi-label">
        {label}{required && <span className="fi-req" aria-hidden="true"> *</span>}
      </label>
      {error && <p id={`${id}-err`} className="fi-err" role="alert">{error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Password Field
   ══════════════════════════════════════════════════════════════ */

interface PwProps {
  id: string; label: string; value: string;
  onChange: (v: string) => void; onBlur?: () => void;
  error?: string; showStrength?: boolean; pwLabels: readonly string[];
}

function EyeIcon({ visible }: { visible: boolean }) {
  return visible
    ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/>
        <line x1="1" y1="1" x2="23" y2="23"/>
      </svg>
    : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
        <circle cx="12" cy="12" r="3"/>
      </svg>;
}

function PwField({ id, label, value, onChange, onBlur, error, showStrength = false, pwLabels }: PwProps) {
  const [show, setShow] = useState(false);
  const str = showStrength ? calcStrength(value) : null;
  return (
    <div className="pw-wrap">
      <FloatInput id={id} label={label} type={show ? 'text' : 'password'}
        value={value} onChange={onChange} onBlur={onBlur} error={error} required
        autoComplete={id === 'password' ? 'new-password' : 'new-password'} />
      <button type="button" className="pw-toggle" onClick={() => setShow(v => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}>
        <EyeIcon visible={show} />
      </button>
      {showStrength && value.length > 0 && str && str.score > 0 && (
        <div className="pw-strength" aria-live="polite">
          <div className="pw-bars">
            {[1,2,3,4].map(i => (
              <div key={i} className="pw-bar" style={{ background: str.score >= i ? str.color : undefined }} />
            ))}
          </div>
          {pwLabels[str.score] && <span className="pw-str-lbl" style={{ color: str.color }}>{pwLabels[str.score]}</span>}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Multi-Select
   ══════════════════════════════════════════════════════════════ */

interface MSOption { id: string; label: string; sub: string; }
interface MSProps {
  label: string;
  options: MSOption[];
  selected: string[];
  onChange: (v: string[]) => void;
  error?: string;
  searchPlaceholder: string;
  noResults: (q: string) => string;
  selectedLabel: (n: number) => string;
}

function CheckIcon() {
  return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="20 6 9 17 4 12"/></svg>;
}
function XIcon() {
  return <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}

function MultiSelect({ label, options, selected, onChange, error, searchPlaceholder, noResults, selectedLabel }: MSProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef  = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(query.toLowerCase()) ||
    o.sub.toLowerCase().includes(query.toLowerCase())
  );

  const toggle = useCallback((id: string) => {
    onChange(selected.includes(id) ? selected.filter(s => s !== id) : [...selected, id]);
  }, [selected, onChange]);

  const openMenu = () => {
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 40);
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false); setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={wrapRef}
      className={`ms-wrap${open ? ' is-open' : ''}${error ? ' has-error' : ''}`}
      onKeyDown={e => { if (e.key === 'Escape') { setOpen(false); setQuery(''); } }}>

      <div className="ms-trigger" onClick={openMenu}
        role="combobox" aria-expanded={open} aria-haspopup="listbox" tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openMenu(); } }}>
        <span className="ms-trig-lbl">{label}</span>
        <span className="ms-trig-right">
          {selected.length > 0 && <span className="ms-count">{selectedLabel(selected.length)}</span>}
          <svg className="ms-chevron" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </div>

      {selected.length > 0 && (
        <div className="ms-chips" role="list">
          {selected.map(id => {
            const opt = options.find(o => o.id === id);
            return (
              <span key={id} className="chip" role="listitem">
                {opt?.label ?? id}
                <button type="button" className="chip-x"
                  onClick={e => { e.stopPropagation(); onChange(selected.filter(s => s !== id)); }}
                  aria-label={`Remove ${opt?.label ?? id}`}>
                  <XIcon />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {open && (
        <div className="ms-dropdown" role="listbox" aria-multiselectable="true" aria-label={label}>
          <div className="ms-search-row">
            <svg className="ms-search-ic" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input ref={inputRef} className="ms-search" placeholder={searchPlaceholder} value={query}
              onChange={e => setQuery(e.target.value)}
              onClick={e => e.stopPropagation()} dir="auto" />
          </div>
          <div className="ms-options">
            {filtered.length === 0
              ? <div className="ms-empty">{noResults(query)}</div>
              : filtered.map(opt => {
                  const sel = selected.includes(opt.id);
                  return (
                    <div key={opt.id} className={`ms-option${sel ? ' is-sel' : ''}`}
                      onClick={() => toggle(opt.id)}
                      role="option" aria-selected={sel}>
                      <div className="ms-opt-cb">{sel && <CheckIcon />}</div>
                      <div className="ms-opt-body">
                        <span className="ms-opt-lbl">{opt.label}</span>
                        {opt.sub && <span className="ms-opt-sub">{opt.sub}</span>}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      )}
      {error && <p className="fi-err" role="alert">{error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Step 1 — Basic Information
   ══════════════════════════════════════════════════════════════ */

interface StepProps {
  data: FormData; errors: FieldErrors; touched: Touched;
  onChange: (f: FieldKey, v: FieldVal) => void;
  onBlur: (f: FieldKey) => void;
  onNext: () => void;
  t: Translations;
}

function Step1({ data, errors, touched, onChange, onBlur, onNext, t }: StepProps) {
  const s = t.step1;
  return (
    <div aria-label="Step 1">
      <div className="sr-step-head">
        <h2 className="sr-step-title">{s.title}</h2>
        <p className="sr-step-sub">{s.sub}</p>
      </div>
      <div className="sr-fields">
        <FloatInput id="companyName" label={s.companyName} value={data.companyName} required
          onChange={v => onChange('companyName', v)} onBlur={() => onBlur('companyName')}
          error={touched.companyName ? errors.companyName : undefined} autoComplete="organization" />
        <FloatInput id="contactPerson" label={s.contactPerson} value={data.contactPerson} required
          onChange={v => onChange('contactPerson', v)} onBlur={() => onBlur('contactPerson')}
          error={touched.contactPerson ? errors.contactPerson : undefined} autoComplete="name" />
        <FloatInput id="mobile" label={s.mobile} value={data.mobile} required
          type="tel" inputMode="tel"
          onChange={v => onChange('mobile', v)} onBlur={() => onBlur('mobile')}
          error={touched.mobile ? errors.mobile : undefined} autoComplete="tel" />
        <FloatInput id="email" label={s.email} value={data.email}
          type="email" inputMode="email"
          onChange={v => onChange('email', v)} onBlur={() => onBlur('email')}
          error={touched.email ? errors.email : undefined} autoComplete="email" />
        <PwField id="password" label={s.password} value={data.password} showStrength
          pwLabels={t.pwStrength}
          onChange={v => onChange('password', v)} onBlur={() => onBlur('password')}
          error={touched.password ? errors.password : undefined} />
        <PwField id="confirmPassword" label={s.confirmPassword} value={data.confirmPassword}
          pwLabels={t.pwStrength}
          onChange={v => onChange('confirmPassword', v)} onBlur={() => onBlur('confirmPassword')}
          error={touched.confirmPassword ? errors.confirmPassword : undefined} />
      </div>
      <button type="button" className="sr-btn-primary" onClick={onNext}>
        {s.nextBtn}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6"/></svg>
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Step 2 — Business Details
   ══════════════════════════════════════════════════════════════ */

interface Step2Props extends StepProps { onBack: () => void; isArabic: boolean; }

function Step2({ data, errors, touched, onChange, onBlur, onNext, onBack, t, isArabic }: Step2Props) {
  const s = t.step2;
  const lang = isArabic ? 'ar' : 'en';

  const catOpts = CATEGORIES_DATA.map(c => ({ id: c.id, label: c[lang], sub: '' }));
  const areaOpts = AREAS_DATA.map(a => ({
    id: a.id,
    label: isArabic ? a.ar : a.en,
    sub:   isArabic ? a.arSub : a.enSub,
  }));

  return (
    <div aria-label="Step 2">
      <div className="sr-step-head">
        <h2 className="sr-step-title">{s.title}</h2>
        <p className="sr-step-sub">{s.sub}</p>
      </div>
      <div className="sr-fields">
        <span className="sr-section-lbl">{s.categoriesLabel}</span>
        <MultiSelect
          label={s.categoriesTrigger} options={catOpts} selected={data.categories}
          onChange={v => onChange('categories', v)}
          error={touched.categories ? errors.categories : undefined}
          searchPlaceholder={s.search}
          noResults={s.noResults}
          selectedLabel={s.selected}
        />
        <span className="sr-section-lbl" style={{ marginTop: 8 }}>{s.areasLabel}</span>
        <MultiSelect
          label={s.areasTrigger} options={areaOpts} selected={data.deliveryAreas}
          onChange={v => onChange('deliveryAreas', v)}
          error={touched.deliveryAreas ? errors.deliveryAreas : undefined}
          searchPlaceholder={s.search}
          noResults={s.noResults}
          selectedLabel={s.selected}
        />
      </div>
      <div className="sr-btn-row">
        <button type="button" className="sr-btn-ghost" onClick={onBack}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6"/></svg>
          {s.backBtn}
        </button>
        <button type="button" className="sr-btn-primary" onClick={onNext}>
          {s.nextBtn}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6"/></svg>
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Step 3 — Review & Confirm
   ══════════════════════════════════════════════════════════════ */

interface Step3Props {
  data: FormData; errors: FieldErrors; touched: Touched;
  onChange: (f: FieldKey, v: FieldVal) => void;
  onBack: () => void; onSubmit: () => void;
  submitting: boolean; t: Translations; isArabic: boolean;
}

function ReviewRow({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="rv-row">
      <span className="rv-icon">{icon}</span>
      <div className="rv-body">
        <span className="rv-lbl">{label}</span>
        <span className="rv-val">{children}</span>
      </div>
    </div>
  );
}

function Step3({ data, errors, touched, onChange, onBack, onSubmit, submitting, t, isArabic }: Step3Props) {
  const s  = t.step3;
  const termsErr = touched.termsAccepted ? errors.termsAccepted : undefined;
  const lang = isArabic ? 'ar' : 'en';

  const getCatLabel = (id: string) => CATEGORIES_DATA.find(c => c.id === id)?.[lang] ?? id;
  const getAreaLabel = (id: string) => {
    const a = AREAS_DATA.find(x => x.id === id);
    return a ? (isArabic ? a.ar : a.en) : id;
  };

  return (
    <div aria-label="Step 3">
      <div className="sr-step-head">
        <h2 className="sr-step-title">{s.title}</h2>
        <p className="sr-step-sub">{s.sub}</p>
      </div>

      <div className="rv-card">
        <ReviewRow label={s.company}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>}>
          {data.companyName}
        </ReviewRow>
        <ReviewRow label={s.contact}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
          {data.contactPerson}
        </ReviewRow>
        <ReviewRow label={s.mobile}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13.5 19.79 19.79 0 0 1 1.61 4.9 2 2 0 0 1 3.59 2.72h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 10.09a16 16 0 0 0 6 6l.96-.96a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>}>
          {data.mobile}
        </ReviewRow>
        {data.email && (
          <ReviewRow label={s.email}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>}>
            {data.email}
          </ReviewRow>
        )}
        <ReviewRow label={s.categories}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>}>
          <div className="rv-chips">
            {data.categories.map(c => <span key={c} className="rv-chip">{getCatLabel(c)}</span>)}
          </div>
        </ReviewRow>
        <ReviewRow label={s.areas}
          icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>}>
          <div className="rv-chips">
            {data.deliveryAreas.map(id => <span key={id} className="rv-chip">{getAreaLabel(id)}</span>)}
          </div>
        </ReviewRow>
      </div>

      <div className={`sr-terms${termsErr ? ' has-error' : ''}`}>
        <label className="sr-check-lbl" htmlFor="terms">
          <input type="checkbox" id="terms" className="sr-checkbox"
            checked={data.termsAccepted}
            onChange={e => onChange('termsAccepted', e.target.checked)} />
          <span className={`sr-check-box${data.termsAccepted ? ' is-checked' : ''}`}>
            {data.termsAccepted && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </span>
          <span className="sr-check-txt">
            {s.termsPrefix}{' '}
            <a href="/terms" className="sr-link" target="_blank" rel="noopener noreferrer">{s.termsService}</a>
            {' '}{s.termsAnd}{' '}
            <a href="/privacy" className="sr-link" target="_blank" rel="noopener noreferrer">{s.termsPrivacy}</a>
          </span>
        </label>
        {termsErr && <p className="fi-err" role="alert" style={{ paddingInlineStart: 28 }}>{termsErr}</p>}
      </div>

      <div className="sr-btn-row">
        <button type="button" className="sr-btn-ghost" onClick={onBack} disabled={submitting}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6"/></svg>
          {s.backBtn}
        </button>
        <button type="button" className="sr-btn-primary" onClick={onSubmit} disabled={submitting} aria-live="polite">
          {submitting
            ? <><span className="sr-spinner" aria-hidden /> {s.submitting}</>
            : <>{s.submitBtn} <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6"/></svg></>}
        </button>
      </div>
    </div>
  );
}

/* Brand Panel (always left) */
function BrandPanel({ t }: { t: Translations }) {
  const b = t.brand;
  return (
    <aside className="sr-brand" aria-hidden="true">
      <div className="sr-brand-in">
        <Logo light />
        <div className="sr-brand-copy">
          <h1 className="sr-brand-title">{b.title}</h1>
          <p className="sr-brand-sub">{b.sub}</p>
        </div>
        <ul className="sr-benefits" role="list">
          {b.benefits.map((benefit, i) => (
            <li key={i} className="sr-benefit">
              <span className="sr-benefit-check">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <div className="sr-stats">
          {b.stats.map(s => (
            <div key={s.label} className="sr-stat">
              <span className="sr-stat-num">{s.num}</span>
              <span className="sr-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* Main Page */
const INIT: FormData = {
  companyName: '', contactPerson: '', mobile: '', email: '',
  password: '', confirmPassword: '',
  categories: [], deliveryAreas: [],
  termsAccepted: false,
};

const STEP1_FIELDS: FieldKey[] = ['companyName','contactPerson','mobile','email','password','confirmPassword'];
const STEP2_FIELDS: FieldKey[] = ['categories','deliveryAreas'];
const STEP3_FIELDS: FieldKey[] = ['termsAccepted'];

function SupplierRegisterPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isArabic     = searchParams.get('lang') === 'ar';
  const t            = isArabic ? T.ar : T.en;
  const dir          = isArabic ? 'rtl' : 'ltr';

  const [step,        setStep]       = useState<Step>(1);
  const [anim,        setAnim]       = useState<Anim>('');
  const [animKey,     setAnimKey]    = useState(0);
  const [data,        setData]       = useState<FormData>(INIT);
  const [errors,      setErrors]     = useState<FieldErrors>({});
  const [touched,     setTouched]    = useState<Touched>({});
  const [submitting,  setSubmitting] = useState(false);
  const [submitted,   setSubmitted]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  const updateField = useCallback((field: FieldKey, value: FieldVal) => {
    setData(d => {
      const next = { ...d, [field]: value } as FormData;
      if (touched[field]) {
        setErrors(e => ({ ...e, [field]: validate(field, value, next, t) }));
      }
      return next;
    });
  }, [touched, t]);

  const touchField = useCallback((field: FieldKey) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setData(d => {
      setErrors(e => ({ ...e, [field]: validate(field, d[field] as FieldVal, d, t) }));
      return d;
    });
  }, [t]);

  const validateStep = (fields: FieldKey[]): boolean => {
    const newTouched: Touched = {};
    const newErrors: FieldErrors = {};
    let ok = true;
    fields.forEach(f => {
      newTouched[f] = true;
      const err = validate(f, data[f] as FieldVal, data, t);
      if (err) { newErrors[f] = err; ok = false; }
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return ok;
  };

  const goNext = () => {
    const fields = step === 1 ? STEP1_FIELDS : step === 2 ? STEP2_FIELDS : STEP3_FIELDS;
    if (!validateStep(fields)) return;
    setAnim('forward');
    setAnimKey(k => k + 1);
    setStep(s => (s + 1) as Step);
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setAnim('back');
    setAnimKey(k => k + 1);
    setStep(s => (s - 1) as Step);
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(STEP3_FIELDS)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/supplier/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName:     data.companyName,
          contactPerson:   data.contactPerson,
          mobile:          data.mobile,
          email:           data.email,
          password:        data.password,
          confirmPassword: data.confirmPassword,
          categories:      data.categories,
          deliveryAreas:   data.deliveryAreas,
          termsAccepted:   data.termsAccepted,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error ?? 'Registration failed. Please try again.');
        setSubmitting(false);
        return;
      }
      router.push('/supplier/dashboard');
    } catch {
      setSubmitError('Network error. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  if (submitted) {
    const s = t.success;
    return (
      <div className="sr-root" lang={isArabic ? 'ar' : 'en'}>
        <BrandPanel t={t} />
        <main className="sr-form-panel" dir={dir}>
          <div className="sr-success">
            <div className="sr-success-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="sr-success-title">{s.title}</h2>
            <p className="sr-success-sub">{s.sub(data.companyName)}</p>
            <a href="/supplier/login" className="sr-btn-primary sr-btn-inline">{s.btn}</a>
            <p style={{ fontSize: 13, color: '#9aa3ae', marginTop: 4 }}>{s.note}</p>
          </div>
        </main>
      </div>
    );
  }

  const stepProps = { data, errors, touched, onChange: updateField, onBlur: touchField, onNext: goNext, t };
  const animClass = anim ? `anim-${anim}` : '';

  return (
    <div className="sr-root" lang={isArabic ? 'ar' : 'en'}>
      <BrandPanel t={t} />
      <main className="sr-form-panel" dir={dir}>
        <div className="sr-mobile-logo"><Logo /></div>
        <div className="sr-form-top">
          <ProgressSteps current={step} labels={t.stepLabels} />
        </div>
        <div className="sr-hero">
          <h1 className="sr-page-title">{t.pageTitle}</h1>
          <p className="sr-page-sub">{t.pageSub}</p>
          <span className="sr-step-badge">{t.stepBadge(step)}</span>
        </div>
        <div key={animKey} className={`sr-step-wrap ${animClass}`}>
          {step === 1 && <Step1 {...stepProps} />}
          {step === 2 && <Step2 {...stepProps} onBack={goBack} isArabic={isArabic} />}
          {step === 3 && (
            <Step3 data={data} errors={errors} touched={touched}
              onChange={updateField} onBack={goBack}
              onSubmit={handleSubmit} submitting={submitting}
              t={t} isArabic={isArabic} />
          )}
        </div>
        {submitError && <p className="sr-api-error" role="alert">{submitError}</p>}
        <p className="sr-signin">
          {t.signin}{' '}
          <a href="/supplier/login" className="sr-link">{t.signinLink}</a>
        </p>
      </main>
    </div>
  );
}

export default function SupplierRegisterPage() {
  return (
    <Suspense>
      <SupplierRegisterPageInner />
    </Suspense>
  );
}
ap ${animClass}`}>
          {step === 1 && <Step1 {...stepProps} />}
          {step === 2 && <Step2 {...stepProps} onBack={goBack} isArabic={isArabic} />}
          {step === 3 && (
            <Step3 data={data} errors={errors} touched={touched}
              onChange={updateField} onBack={goBack}
              onSubmit={handleSubmit} submitting={submitting}
              t={t} isArabic={isArabic} />
          )}
        </div>

        {submitError && <p className="sr-api-error" role="alert">{submitError}</p>}

        <p className="sr-signin">
          {t.signin}{' '}
          <a href="/supplier/login" className="sr-link">{t.signinLink}</a>
        </p>
      </main>
    </div>
  );
}

export default function SupplierRegisterPage() {
  return (
    <Suspense>
      <SupplierRegisterPageInner />
    </Suspense>
  );
}
error' : ''}`}>
        <label className="sr-check-lbl" htmlFor="terms">
          <input type="checkbox" id="terms" className="sr-checkbox"
            checked={data.termsAccepted}
            onChange={e => onChange('termsAccepted', e.target.checked)} />
          <span className={`sr-check-box${data.termsAccepted ? ' is-checked' : ''}`}>
            {data.termsAccepted && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </span>
          <span className="sr-check-txt">
            {s.termsPrefix}{' '}
            <a href="/terms" className="sr-link" target="_blank" rel="noopener noreferrer">{s.termsService}</a>
            {' '}{s.termsAnd}{' '}
            <a href="/privacy" className="sr-link" target="_blank" rel="noopener noreferrer">{s.termsPrivacy}</a>
          </span>
        </label>
        {termsErr && <p className="fi-err" role="alert" style={{ paddingInlineStart: 28 }}>{termsErr}</p>}
      </div>

      <div className="sr-btn-row">
        <button type="button" className="sr-btn-ghost" onClick={onBack} disabled={submitting}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="15 18 9 12 15 6"/></svg>
          {s.backBtn}
        </button>
        <button type="button" className="sr-btn-primary" onClick={onSubmit} disabled={submitting} aria-live="polite">
          {submitting
            ? <><span className="sr-spinner" aria-hidden /> {s.submitting}</>
            : <>{s.submitBtn} <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="9 18 15 12 9 6"/></svg></>}
        </button>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   Brand Panel (always left)
   ══════════════════════════════════════════════════════════════ */

function BrandPanel({ t }: { t: Translations }) {
  const b = t.brand;
  return (
    <aside className="sr-brand" aria-hidden="true">
      <div className="sr-brand-in">
        <Logo light />
        <div className="sr-brand-copy">
          <h1 className="sr-brand-title">{b.title}</h1>
          <p className="sr-brand-sub">{b.sub}</p>
        </div>
        <ul className="sr-benefits" role="list">
          {b.benefits.map((benefit, i) => (
            <li key={i} className="sr-benefit">
              <span className="sr-benefit-check">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </span>
              {benefit}
            </li>
          ))}
        </ul>
        <div className="sr-stats">
          {b.stats.map(s => (
            <div key={s.label} className="sr-stat">
              <span className="sr-stat-num">{s.num}</span>
              <span className="sr-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

/* ══════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════ */

const INIT: FormData = {
  companyName: '', contactPerson: '', mobile: '', email: '',
  password: '', confirmPassword: '',
  categories: [], deliveryAreas: [],
  termsAccepted: false,
};

const STEP1_FIELDS: FieldKey[] = ['companyName','contactPerson','mobile','email','password','confirmPassword'];
const STEP2_FIELDS: FieldKey[] = ['categories','deliveryAreas'];
const STEP3_FIELDS: FieldKey[] = ['termsAccepted'];

function SupplierRegisterPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const isArabic     = searchParams.get('lang') === 'ar';
  const t            = isArabic ? T.ar : T.en;
  const dir          = isArabic ? 'rtl' : 'ltr';

  const [step,       setStep]       = useState<Step>(1);
  const [anim,       setAnim]       = useState<Anim>('');
  const [animKey,    setAnimKey]    = useState(0);
  const [data,       setData]       = useState<FormData>(INIT);
  const [errors,     setErrors]     = useState<FieldErrors>({});
  const [touched,    setTouched]    = useState<Touched>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [submitError, setSubmitError] = useState('');

  const updateField = useCallback((field: FieldKey, value: FieldVal) => {
    setData(d => {
      const next = { ...d, [field]: value } as FormData;
      if (touched[field]) {
        setErrors(e => ({ ...e, [field]: validate(field, value, next, t) }));
      }
      return next;
    });
  }, [touched, t]);

  const touchField = useCallback((field: FieldKey) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    setData(d => {
      setErrors(e => ({ ...e, [field]: validate(field, d[field] as FieldVal, d, t) }));
      return d;
    });
  }, [t]);

  const validateStep = (fields: FieldKey[]): boolean => {
    const newTouched: Touched = {};
    const newErrors: FieldErrors = {};
    let ok = true;
    fields.forEach(f => {
      newTouched[f] = true;
      const err = validate(f, data[f] as FieldVal, data, t);
      if (err) { newErrors[f] = err; ok = false; }
    });
    setTouched(prev => ({ ...prev, ...newTouched }));
    setErrors(prev => ({ ...prev, ...newErrors }));
    return ok;
  };

  const goNext = () => {
    const fields = step === 1 ? STEP1_FIELDS : step === 2 ? STEP2_FIELDS : STEP3_FIELDS;
    if (!validateStep(fields)) return;
    setAnim('forward');
    setAnimKey(k => k + 1);
    setStep(s => (s + 1) as Step);
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    setAnim('back');
    setAnimKey(k => k + 1);
    setStep(s => (s - 1) as Step);
    scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    if (!validateStep(STEP3_FIELDS)) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/supplier/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName:     data.companyName,
          contactPerson:   data.contactPerson,
          mobile:          data.mobile,
          email:           data.email,
          password:        data.password,
          confirmPassword: data.confirmPassword,
          categories:      data.categories,
          deliveryAreas:   data.deliveryAreas,
          termsAccepted:   data.termsAccepted,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSubmitError(json.error ?? 'Registration failed. Please try again.');
        setSubmitting(false);
        return;
      }
      router.push('/supplier/dashboard');
    } catch {
      setSubmitError('Network error. Check your connection and try again.');
      setSubmitting(false);
    }
  };

  /* ── Success state ── */
  if (submitted) {
    const s = t.success;
    return (
      <div className="sr-root" lang={isArabic ? 'ar' : 'en'}>
        <BrandPanel t={t} />
        <main className="sr-form-panel" dir={dir}>
          <div className="sr-success">
            <div className="sr-success-icon">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h2 className="sr-success-title">{s.title}</h2>
            <p className="sr-success-sub">{s.sub(data.companyName)}</p>
            <a href="/supplier/login" className="sr-btn-primary sr-btn-inline">{s.btn}</a>
            <p style={{ fontSize: 13, color: '#9aa3ae', marginTop: 4 }}>{s.note}</p>
          </div>
        </main>
      </div>
    );
  }

  /* ── Main form ── */
  const stepProps = { data, errors, touched, onChange: updateField, onBlur: touchField, onNext: goNext, t };
  const animClass = anim ? `anim-${anim}` : '';

  return (
    /* sr-root has NO dir — layout is always LTR (brand left, form right).
       dir is applied per-panel so content direction flips correctly.      */
    <div className="sr-root" lang={isArabic ? 'ar' : 'en'}>
      <BrandPanel t={t} />

      <main className="sr-form-panel" dir={dir}>
        {/* Mobile logo */}
        <div className="sr-mobile-logo"><Logo /></div>

        {/* Progress */}
        <div className="sr-form-top">
          <ProgressSteps current={step} labels={t.stepLabels} />
        </div>

        {/* Page hero */}
        <div className="sr-hero">
          <h1 className="sr-page-title">{t.pageTitle}</h1>
          <p className="sr-page-sub">{t.pageSub}</p>
          <span className="sr-step-badge">{t.stepBadge(step)}</span>
        </div>

        {/* Step content */}
        <div key={animKey} className={`sr-step-wrap ${animClass}`}>
          {step === 1 && <Step1 {...stepProps} />}
          {step === 2 && <Step2 {...stepProps} onBack={goBack} isArabic={isArabic} />}
          {step === 3 && (
            <Step3 data={data} errors={errors} touched={touched}
              onChange={updateField} onBack={goBack}
              onSubmit={handleSubmit} submitting={submitting}
              t={t} isArabic={isArabic} />
          )}
        </div>

        {submitError && <p className="sr-api-error" role="alert">{submitError}</p>}

        <p className="sr-signin">
          {t.signin}{' '}
          <a href="/supplier/login" className="sr-link">{t.signinLink}</a>
        </p>
      </main>
    </div>
  );
}

export default function SupplierRegisterPage() {
  return (
    <Suspense>
      <SupplierRegisterPageInner />
    </Suspense>
  );
}
