'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
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
  workTypes:       string[];
  companySize:     string;
  crNumber:        string;
  city:            string;
  termsAccepted:   boolean;
}
type FieldKey    = keyof FormData;
type FieldVal    = string | boolean | string[];
type FieldErrors = Partial<Record<FieldKey, string>>;
type Touched     = Partial<Record<FieldKey, boolean>>;

/* ══════════════════════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════════════════════ */

const WORK_TYPES = [
  { id: 'building',      en: 'Building Construction',      ar: 'إنشاء المباني' },
  { id: 'roads',         en: 'Roads & Infrastructure',     ar: 'طرق وبنية تحتية' },
  { id: 'electrical',    en: 'Electrical Works',           ar: 'أعمال كهربائية' },
  { id: 'plumbing',      en: 'Plumbing & Sanitary',        ar: 'أعمال سباكة وصحية' },
  { id: 'hvac',          en: 'HVAC Systems',               ar: 'تكييف وتهوية' },
  { id: 'finishing',     en: 'Finishing & Interiors',      ar: 'تشطيبات وديكور' },
  { id: 'steel',         en: 'Steel Structures',           ar: 'إنشاءات معدنية' },
  { id: 'concrete',      en: 'Concrete Works',             ar: 'أعمال خرسانية' },
  { id: 'landscaping',   en: 'Landscaping',                ar: 'تنسيق مواقع' },
  { id: 'waterproofing', en: 'Waterproofing',              ar: 'عزل مائي' },
  { id: 'painting',      en: 'Painting & Coatings',        ar: 'دهانات وطلاء' },
  { id: 'demolition',    en: 'Demolition & Earthworks',    ar: 'هدم وأعمال ترابية' },
  { id: 'safety',        en: 'Safety & Fire Systems',      ar: 'أنظمة السلامة والحريق' },
  { id: 'other',         en: 'Other',                      ar: 'أخرى' },
];

const COMPANY_SIZES = [
  { id: '1-5',    en: '1 – 5 employees',    ar: '1 – 5 موظفين' },
  { id: '6-20',   en: '6 – 20 employees',   ar: '6 – 20 موظفاً' },
  { id: '21-50',  en: '21 – 50 employees',  ar: '21 – 50 موظفاً' },
  { id: '51-200', en: '51 – 200 employees', ar: '51 – 200 موظف' },
  { id: '200+',   en: 'More than 200',       ar: 'أكثر من 200' },
];

const KSA_CITIES = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar',
  'Dhahran', 'Jubail', 'Tabuk', 'Abha', 'Hail', 'Najran',
  'Taif', 'Yanbu', 'Buraidah', 'Khamis Mushait', 'Qatif',
];

const STEP1_FIELDS: FieldKey[] = ['companyName', 'contactPerson', 'mobile', 'email', 'password', 'confirmPassword'];
const STEP2_FIELDS: FieldKey[] = ['workTypes', 'companySize', 'city'];
const STEP3_FIELDS: FieldKey[] = ['termsAccepted'];

/* ══════════════════════════════════════════════════════════════
   i18n
   ══════════════════════════════════════════════════════════════ */

const T = {
  en: {
    brand: { title: 'Bunood for Contractors', sub: 'Streamline your procurement. Get matched with verified suppliers across Saudi Arabia.' },
    steps: ['Company Info', 'Work Details', 'Confirm'],
    nav: { back: 'Back', next: 'Next', submit: 'Create Account', login: 'Sign in' },
    labels: {
      companyName: 'Company Name', contactPerson: 'Contact Person',
      mobile: 'Mobile Number', email: 'Email Address',
      password: 'Password', confirmPassword: 'Confirm Password',
      workTypes: 'Type of Work (select all that apply)',
      companySize: 'Company Size', crNumber: 'Commercial Registration No. (CR)',
      city: 'City',
    },
    placeholders: {
      companyName: 'Al-Rashidi Construction Co.', contactPerson: 'Mohammed Al-Otaibi',
      mobile: '+966 5X XXX XXXX', email: 'info@company.com',
      password: 'Min. 8 characters', confirmPassword: 'Re-enter password',
      crNumber: 'Optional — CR number',
    },
    terms: 'I agree to the Terms of Service and Privacy Policy',
    loginPrompt: 'Already have an account?',
    benefits: [
      'AI-powered supplier matching for your exact project needs',
      'Get competitive quotes from verified suppliers instantly',
      'Manage all procurement in one platform — BOQ to delivery',
    ],
    stepTitle: ['Company Information', 'Work & Operations', 'Review & Confirm'],
    stepSub: ['Set up your contractor account', 'Tell us what you build', 'Almost there'],
    selectSize: 'Select company size',
    selectCity: 'Select city',
    selectWorkTypes: 'Select at least one work type',
    success: 'Account created! Redirecting…',
    pwStrength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
  },
  ar: {
    brand: { title: 'بنود للمقاولين', sub: 'بسّط عمليات المشتريات. تواصل مع الموردين المعتمدين في جميع أنحاء المملكة العربية السعودية.' },
    steps: ['معلومات الشركة', 'تفاصيل العمل', 'التأكيد'],
    nav: { back: 'رجوع', next: 'التالي', submit: 'إنشاء الحساب', login: 'تسجيل الدخول' },
    labels: {
      companyName: 'اسم الشركة', contactPerson: 'الشخص المسؤول',
      mobile: 'رقم الجوال', email: 'البريد الإلكتروني',
      password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور',
      workTypes: 'نوع الأعمال (اختر كل ما ينطبق)',
      companySize: 'حجم الشركة', crNumber: 'رقم السجل التجاري',
      city: 'المدينة',
    },
    placeholders: {
      companyName: 'شركة الرشيدي للإنشاءات', contactPerson: 'محمد العتيبي',
      mobile: '+966 5X XXX XXXX', email: 'info@company.com',
      password: '٨ أحرف على الأقل', confirmPassword: 'أعد إدخال كلمة المرور',
      crNumber: 'اختياري — رقم السجل التجاري',
    },
    terms: 'أوافق على شروط الخدمة وسياسة الخصوصية',
    loginPrompt: 'لديك حساب بالفعل؟',
    benefits: [
      'مطابقة موردين مدعومة بالذكاء الاصطناعي لمتطلبات مشروعك',
      'احصل على عروض أسعار تنافسية من موردين معتمدين فوراً',
      'إدارة جميع المشتريات في منصة واحدة — من جدول الكميات للتسليم',
    ],
    stepTitle: ['معلومات الشركة', 'الأعمال والعمليات', 'المراجعة والتأكيد'],
    stepSub: ['أنشئ حساب المقاول الخاص بك', 'أخبرنا بما تنفّذه', 'خطوة أخيرة'],
    selectSize: 'اختر حجم الشركة',
    selectCity: 'اختر المدينة',
    selectWorkTypes: 'اختر نوع عمل واحداً على الأقل',
    success: 'تم إنشاء الحساب! جارٍ التحويل…',
    pwStrength: ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'],
  },
};

/* ══════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════ */

function calcStrength(pw: string): { score: StrScore; color: string } {
  if (!pw) return { score: 0, color: '' };
  let s = 0;
  if (pw.length >= 8)  s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw))   s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.min(4, s) as StrScore;
  return { score, color: ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][score] };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

function validate(data: FormData, step: Step): FieldErrors {
  const e: FieldErrors = {};
  const fields = step === 1 ? STEP1_FIELDS : step === 2 ? STEP2_FIELDS : STEP3_FIELDS;
  if (fields.includes('companyName') && data.companyName.trim().length < 2)    e.companyName = 'Company name is required';
  if (fields.includes('contactPerson') && data.contactPerson.trim().length < 2) e.contactPerson = 'Contact person required';
  if (fields.includes('mobile') && !MOBILE_RE.test(data.mobile.trim()))         e.mobile = 'Valid mobile number required';
  if (fields.includes('email') && !EMAIL_RE.test(data.email.trim()))            e.email = 'Valid email required';
  if (fields.includes('password') && data.password.length < 8)                  e.password = 'Password must be at least 8 characters';
  if (fields.includes('confirmPassword') && data.password !== data.confirmPassword) e.confirmPassword = 'Passwords do not match';
  if (fields.includes('workTypes') && data.workTypes.length === 0)              e.workTypes = 'Select at least one work type';
  if (fields.includes('companySize') && !data.companySize)                      e.companySize = 'Please select company size';
  if (fields.includes('city') && !data.city)                                    e.city = 'Please select your city';
  if (fields.includes('termsAccepted') && !data.termsAccepted)                  e.termsAccepted = 'You must accept the terms';
  return e;
}

function toggleItem(arr: string[], item: string): string[] {
  return arr.includes(item) ? arr.filter(x => x !== item) : [...arr, item];
}

/* ══════════════════════════════════════════════════════════════
   Inner Component
   ══════════════════════════════════════════════════════════════ */

function ContractorRegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isArabic = searchParams.get('lang') === 'ar';
  const t = isArabic ? T.ar : T.en;
  const dir = isArabic ? 'rtl' : 'ltr';

  const [step, setStep]     = useState<Step>(1);
  const [anim, setAnim]     = useState<Anim>('');
  const [showPw, setShowPw] = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const [success, setSuccess]       = useState(false);

  const [form, setForm] = useState<FormData>({
    companyName: '', contactPerson: '', mobile: '', email: '',
    password: '', confirmPassword: '', workTypes: [],
    companySize: '', crNumber: '', city: '', termsAccepted: false,
  });
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  const set = useCallback(<K extends FieldKey>(k: K, v: FieldVal) => {
    setForm(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
  }, []);

  const err = (k: FieldKey) => touched[k] ? errors[k] : undefined;
  const pwStrength = calcStrength(form.password);
  const pct = step === 1 ? 33 : step === 2 ? 66 : 100;

  function goNext() {
    const stepFields = step === 1 ? STEP1_FIELDS : STEP2_FIELDS;
    setTouched(Object.fromEntries(stepFields.map(k => [k, true])));
    const errs = validate(form, step);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setAnim('forward');
    setTimeout(() => { setStep(s => (s + 1) as Step); setAnim(''); }, 220);
  }

  function goBack() {
    setAnim('back');
    setTimeout(() => { setStep(s => (s - 1) as Step); setAnim(''); }, 220);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ termsAccepted: true });
    const errs = validate(form, 3);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setSubmitting(true);
    setApiError('');
    try {
      const res = await fetch('/api/contractor/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Registration failed'); setSubmitting(false); return; }
      setSuccess(true);
      setTimeout(() => router.push('/contractor/dashboard'), 1500);
    } catch {
      setApiError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  return (
    <div className="cr-root" dir={dir} lang={isArabic ? 'ar' : 'en'}>

      {/* ── Brand panel ── */}
      <aside className="cr-brand">
        <div className="cr-brand-in">
          <Link href="/" className="cr-logo">
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <rect x="0" y="0"   width="28" height="5" rx="2.5" fill="#2f6fe0"/>
              <rect x="0" y="8.5" width="20" height="5" rx="2.5" fill="#fff" opacity=".9"/>
              <rect x="0" y="17"  width="28" height="5" rx="2.5" fill="#fff" opacity=".55"/>
            </svg>
            <span className="cr-wordmark">bun<span className="oo">oo</span>d</span>
          </Link>
          <div className="cr-brand-copy">
            <h1 className="cr-brand-title">{t.brand.title}</h1>
            <p className="cr-brand-sub">{t.brand.sub}</p>
          </div>
          <ul className="cr-benefits">
            {t.benefits.map((b, i) => (
              <li key={i} className="cr-benefit">
                <span className="cr-benefit-dot" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="cr-brand-footer">
            <span className="cr-tag">🏗 Construction</span>
            <span className="cr-tag">🇸🇦 Saudi Arabia</span>
            <span className="cr-tag">⚡ Procurement</span>
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <main className="cr-main">
        <div className="cr-form-wrap">

          <div className="cr-progress-bar">
            <div className="cr-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          <div className="cr-steps">
            {t.steps.map((label, i) => (
              <div key={i} className={`cr-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
                <div className="cr-step-dot">
                  {step > i + 1
                    ? <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>
                    : i + 1}
                </div>
                <span className="cr-step-label">{label}</span>
              </div>
            ))}
          </div>

          <div className={`cr-card anim-${anim}`}>
            {success ? (
              <div className="cr-success">
                <div className="cr-success-icon">✓</div>
                <p>{t.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="cr-card-head">
                  <h2 className="cr-card-title">{t.stepTitle[step - 1]}</h2>
                  <p className="cr-card-sub">{t.stepSub[step - 1]}</p>
                </div>

                {apiError && <div className="cr-api-error">{apiError}</div>}

                {/* ── Step 1: Company Info ── */}
                {step === 1 && (
                  <div className="cr-fields">
                    <Field label={t.labels.companyName} error={err('companyName')}>
                      <input className={`cr-input ${err('companyName') ? 'has-error' : ''}`}
                        type="text" placeholder={t.placeholders.companyName}
                        value={form.companyName} onChange={e => set('companyName', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, companyName: true }))} />
                    </Field>

                    <Field label={t.labels.contactPerson} error={err('contactPerson')}>
                      <input className={`cr-input ${err('contactPerson') ? 'has-error' : ''}`}
                        type="text" placeholder={t.placeholders.contactPerson}
                        value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, contactPerson: true }))} />
                    </Field>

                    <Field label={t.labels.mobile} error={err('mobile')}>
                      <input className={`cr-input ${err('mobile') ? 'has-error' : ''}`}
                        type="tel" placeholder={t.placeholders.mobile}
                        value={form.mobile} onChange={e => set('mobile', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, mobile: true }))} />
                    </Field>

                    <Field label={t.labels.email} error={err('email')}>
                      <input className={`cr-input ${err('email') ? 'has-error' : ''}`}
                        type="email" placeholder={t.placeholders.email}
                        value={form.email} onChange={e => set('email', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, email: true }))} />
                    </Field>

                    <Field label={t.labels.password} error={err('password')}>
                      <div className="cr-pw-wrap">
                        <input className={`cr-input ${err('password') ? 'has-error' : ''}`}
                          type={showPw ? 'text' : 'password'} placeholder={t.placeholders.password}
                          value={form.password} onChange={e => set('password', e.target.value)}
                          onBlur={() => setTouched(t => ({ ...t, password: true }))} />
                        <button type="button" className="cr-pw-toggle" onClick={() => setShowPw(v => !v)}>
                          {showPw ? '🙈' : '👁'}
                        </button>
                      </div>
                      {form.password && (
                        <div className="cr-pw-strength">
                          <div className="cr-pw-bars">
                            {[1,2,3,4].map(n => (
                              <div key={n} className="cr-pw-bar" style={{ background: pwStrength.score >= n ? pwStrength.color : undefined }} />
                            ))}
                          </div>
                          <span style={{ color: pwStrength.color }}>{t.pwStrength[pwStrength.score]}</span>
                        </div>
                      )}
                    </Field>

                    <Field label={t.labels.confirmPassword} error={err('confirmPassword')}>
                      <div className="cr-pw-wrap">
                        <input className={`cr-input ${err('confirmPassword') ? 'has-error' : ''}`}
                          type={showCPw ? 'text' : 'password'} placeholder={t.placeholders.confirmPassword}
                          value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                          onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))} />
                        <button type="button" className="cr-pw-toggle" onClick={() => setShowCPw(v => !v)}>
                          {showCPw ? '🙈' : '👁'}
                        </button>
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── Step 2: Work Details ── */}
                {step === 2 && (
                  <div className="cr-fields">
                    <Field label={t.labels.workTypes} error={err('workTypes')}>
                      <div className="cr-work-grid">
                        {WORK_TYPES.map(w => (
                          <button key={w.id} type="button"
                            className={`cr-work-btn ${form.workTypes.includes(w.id) ? 'selected' : ''}`}
                            onClick={() => set('workTypes', toggleItem(form.workTypes, w.id))}>
                            <span className="cr-work-en">{w.en}</span>
                            <span className="cr-work-ar">{w.ar}</span>
                            {form.workTypes.includes(w.id) && (
                              <span className="cr-work-check">✓</span>
                            )}
                          </button>
                        ))}
                      </div>
                    </Field>

                    <div className="cr-row-2">
                      <Field label={t.labels.companySize} error={err('companySize')}>
                        <select className={`cr-select ${err('companySize') ? 'has-error' : ''}`}
                          value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                          <option value="">{t.selectSize}</option>
                          {COMPANY_SIZES.map(s => (
                            <option key={s.id} value={s.id}>{isArabic ? s.ar : s.en}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label={t.labels.city} error={err('city')}>
                        <select className={`cr-select ${err('city') ? 'has-error' : ''}`}
                          value={form.city} onChange={e => set('city', e.target.value)}>
                          <option value="">{t.selectCity}</option>
                          {KSA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>

                    <Field label={t.labels.crNumber} error={err('crNumber')}>
                      <input className="cr-input"
                        type="text" placeholder={t.placeholders.crNumber}
                        value={form.crNumber} onChange={e => set('crNumber', e.target.value)} />
                    </Field>
                  </div>
                )}

                {/* ── Step 3: Confirm ── */}
                {step === 3 && (
                  <div className="cr-fields">
                    <div className="cr-review">
                      <ReviewRow label={isArabic ? 'الشركة' : 'Company'} value={form.companyName} />
                      <ReviewRow label={isArabic ? 'المسؤول' : 'Contact'} value={form.contactPerson} />
                      <ReviewRow label={isArabic ? 'الجوال' : 'Mobile'} value={form.mobile} />
                      <ReviewRow label={isArabic ? 'البريد الإلكتروني' : 'Email'} value={form.email} />
                      <ReviewRow label={isArabic ? 'الأعمال' : 'Work Types'}
                        value={form.workTypes.map(id =>
                          WORK_TYPES.find(w => w.id === id)?.[isArabic ? 'ar' : 'en'] || id
                        ).join(', ')} />
                      <ReviewRow label={isArabic ? 'حجم الشركة' : 'Company Size'}
                        value={COMPANY_SIZES.find(s => s.id === form.companySize)?.[isArabic ? 'ar' : 'en'] || '—'} />
                      <ReviewRow label={isArabic ? 'المدينة' : 'City'} value={form.city} />
                      {form.crNumber && <ReviewRow label={isArabic ? 'السجل التجاري' : 'CR Number'} value={form.crNumber} />}
                    </div>

                    <label className={`cr-terms ${err('termsAccepted') ? 'has-error' : ''}`}>
                      <input type="checkbox" checked={form.termsAccepted}
                        onChange={e => set('termsAccepted', e.target.checked)} />
                      <span>{t.terms}</span>
                    </label>
                    {err('termsAccepted') && <span className="cr-field-error">{err('termsAccepted')}</span>}
                  </div>
                )}

                <div className="cr-nav">
                  {step > 1 && (
                    <button type="button" className="cr-btn-back" onClick={goBack}>{t.nav.back}</button>
                  )}
                  {step < 3 ? (
                    <button type="button" className="cr-btn-next" onClick={goNext}>{t.nav.next}</button>
                  ) : (
                    <button type="submit" className="cr-btn-submit" disabled={submitting}>
                      {submitting ? '…' : t.nav.submit}
                    </button>
                  )}
                </div>

                <p className="cr-login-link">
                  {t.loginPrompt}{' '}
                  <a href={`/contractor/login${isArabic ? '?lang=ar' : ''}`}>{t.nav.login}</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="cr-field">
      {label && <label className="cr-label">{label}</label>}
      {children}
      {error && <span className="cr-field-error">{error}</span>}
    </div>
  );
}
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="cr-review-row">
      <span className="cr-review-label">{label}</span>
      <span className="cr-review-value">{value}</span>
    </div>
  );
}

export default function ContractorRegisterPage() {
  return (
    <Suspense>
      <ContractorRegisterPageInner />
    </Suspense>
  );
}
