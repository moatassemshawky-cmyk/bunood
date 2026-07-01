'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
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
  fullName:         string;
  mobile:           string;
  email:            string;
  password:         string;
  confirmPassword:  string;
  specialization:   string;
  otherSpec:        string;
  licenseNumber:    string;
  yearsExperience:  string;
  city:             string;
  termsAccepted:    boolean;
}
type FieldKey   = keyof FormData;
type FieldVal   = string | boolean;
type FieldErrors = Partial<Record<FieldKey, string>>;
type Touched     = Partial<Record<FieldKey, boolean>>;

/* ══════════════════════════════════════════════════════════════
   Constants
   ══════════════════════════════════════════════════════════════ */

const SPECIALIZATIONS = [
  { id: 'civil',         en: 'Civil Engineering',          ar: 'هندسة مدنية' },
  { id: 'structural',    en: 'Structural Engineering',     ar: 'هندسة إنشائية' },
  { id: 'electrical',    en: 'Electrical Engineering',     ar: 'هندسة كهربائية' },
  { id: 'mechanical',    en: 'Mechanical Engineering',     ar: 'هندسة ميكانيكية' },
  { id: 'architectural', en: 'Architecture',               ar: 'هندسة معمارية' },
  { id: 'hvac',          en: 'HVAC Engineering',           ar: 'هندسة تكييف وتهوية' },
  { id: 'plumbing',      en: 'Plumbing & Sanitary',        ar: 'هندسة صحية وسباكة' },
  { id: 'environmental', en: 'Environmental Engineering',  ar: 'هندسة بيئية' },
  { id: 'geotechnical',  en: 'Geotechnical Engineering',   ar: 'هندسة جيوتقنية' },
  { id: 'industrial',    en: 'Industrial Engineering',     ar: 'هندسة صناعية' },
  { id: 'surveying',     en: 'Surveying Engineering',      ar: 'هندسة مساحة' },
  { id: 'fire',          en: 'Fire Safety Engineering',    ar: 'هندسة السلامة من الحريق' },
  { id: 'other',         en: 'Other',                      ar: 'أخرى' },
];

const KSA_CITIES = [
  'Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam', 'Khobar',
  'Dhahran', 'Jubail', 'Tabuk', 'Abha', 'Hail', 'Najran',
  'Taif', 'Yanbu', 'Buraidah', 'Khamis Mushait', 'Qatif',
];

const EXPERIENCE_OPTS = [
  { id: '0-2',   en: 'Less than 2 years',  ar: 'أقل من سنتين' },
  { id: '2-5',   en: '2 – 5 years',        ar: '2 – 5 سنوات' },
  { id: '5-10',  en: '5 – 10 years',       ar: '5 – 10 سنوات' },
  { id: '10-15', en: '10 – 15 years',      ar: '10 – 15 سنة' },
  { id: '15+',   en: 'More than 15 years', ar: 'أكثر من 15 سنة' },
];

const STEP1_FIELDS: FieldKey[] = ['fullName', 'mobile', 'email', 'password', 'confirmPassword'];
const STEP2_FIELDS: FieldKey[] = ['specialization', 'licenseNumber', 'yearsExperience', 'city'];
const STEP3_FIELDS: FieldKey[] = ['termsAccepted'];

/* ══════════════════════════════════════════════════════════════
   i18n
   ══════════════════════════════════════════════════════════════ */

const T = {
  en: {
    brand: { title: 'Bunood for Engineers', sub: 'Join the network of certified engineers powering construction projects across Saudi Arabia.' },
    steps: ['Personal Info', 'Professional Details', 'Confirm'],
    nav: { back: 'Back', next: 'Next', submit: 'Create Account', login: 'Sign in' },
    labels: {
      fullName: 'Full Name', mobile: 'Mobile Number', email: 'Email Address',
      password: 'Password', confirmPassword: 'Confirm Password',
      specialization: 'Engineering Specialization', otherSpec: 'Specify Specialization',
      licenseNumber: 'Engineering License / ID Number',
      yearsExperience: 'Years of Experience', city: 'City',
      termsAccepted: '',
    },
    placeholders: {
      fullName: 'Eng. Ahmed Al-Rashidi', mobile: '+966 5X XXX XXXX',
      email: 'eng@example.com', password: 'Min. 8 characters',
      confirmPassword: 'Re-enter password', otherSpec: 'Enter your specialization',
      licenseNumber: 'Saudi Council of Engineers ID',
      city: 'Select city',
    },
    terms: 'I agree to the Terms of Service and Privacy Policy',
    loginPrompt: 'Already have an account?',
    benefits: [
      'Get matched with projects that need your engineering expertise',
      'Receive RFQs and procurement requests from top contractors',
      'Build your verified profile and grow your professional network',
    ],
    stepTitle: ['Your Information', 'Professional Details', 'Review & Confirm'],
    stepSub: [
      'Create your engineer account',
      'Tell us about your expertise',
      'Almost there — one last step',
    ],
    selectSpec: 'Select specialization',
    selectExp: 'Select experience',
    selectCity: 'Select city',
    success: 'Account created! Redirecting…',
    pwStrength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
  },
  ar: {
    brand: { title: 'بنود للمهندسين', sub: 'انضم إلى شبكة المهندسين المعتمدين الذين يقودون مشاريع البناء في المملكة العربية السعودية.' },
    steps: ['المعلومات الشخصية', 'التفاصيل المهنية', 'التأكيد'],
    nav: { back: 'رجوع', next: 'التالي', submit: 'إنشاء الحساب', login: 'تسجيل الدخول' },
    labels: {
      fullName: 'الاسم الكامل', mobile: 'رقم الجوال', email: 'البريد الإلكتروني',
      password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور',
      specialization: 'التخصص الهندسي', otherSpec: 'حدد التخصص',
      licenseNumber: 'رقم الرخصة / هيئة المهندسين',
      yearsExperience: 'سنوات الخبرة', city: 'المدينة',
      termsAccepted: '',
    },
    placeholders: {
      fullName: 'م. أحمد الرشيدي', mobile: '+966 5X XXX XXXX',
      email: 'eng@example.com', password: '٨ أحرف على الأقل',
      confirmPassword: 'أعد إدخال كلمة المرور', otherSpec: 'أدخل تخصصك',
      licenseNumber: 'رقم هيئة المهندسين السعوديين',
      city: 'اختر المدينة',
    },
    terms: 'أوافق على شروط الخدمة وسياسة الخصوصية',
    loginPrompt: 'لديك حساب بالفعل؟',
    benefits: [
      'تلقّ طلبات مشاريع تحتاج إلى خبرتك الهندسية',
      'احصل على طلبات عروض الأسعار من كبار المقاولين',
      'ابنِ ملفك المهني المعتمد ووسّع شبكة علاقاتك',
    ],
    stepTitle: ['معلوماتك', 'التفاصيل المهنية', 'المراجعة والتأكيد'],
    stepSub: [
      'أنشئ حسابك كمهندس',
      'أخبرنا عن خبرتك',
      'خطوة أخيرة فقط',
    ],
    selectSpec: 'اختر التخصص',
    selectExp: 'اختر سنوات الخبرة',
    selectCity: 'اختر المدينة',
    success: 'تم إنشاء الحساب! جارٍ التحويل…',
    pwStrength: ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'],
  },
};

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
  return { score, label: '', color: ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][score] };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[\d\s\+\-\(\)]{7,20}$/;

function validate(data: FormData, step: Step): FieldErrors {
  const e: FieldErrors = {};
  const fields = step === 1 ? STEP1_FIELDS : step === 2 ? STEP2_FIELDS : STEP3_FIELDS;
  if (fields.includes('fullName') && data.fullName.trim().length < 2)
    e.fullName = 'Full name is required';
  if (fields.includes('mobile') && !MOBILE_RE.test(data.mobile.trim()))
    e.mobile = 'Valid mobile number required';
  if (fields.includes('email') && !EMAIL_RE.test(data.email.trim()))
    e.email = 'Valid email address required';
  if (fields.includes('password') && data.password.length < 8)
    e.password = 'Password must be at least 8 characters';
  if (fields.includes('confirmPassword') && data.password !== data.confirmPassword)
    e.confirmPassword = 'Passwords do not match';
  if (fields.includes('specialization') && !data.specialization)
    e.specialization = 'Please select your specialization';
  if (fields.includes('yearsExperience') && !data.yearsExperience)
    e.yearsExperience = 'Please select years of experience';
  if (fields.includes('city') && !data.city)
    e.city = 'Please select your city';
  if (fields.includes('termsAccepted') && !data.termsAccepted)
    e.termsAccepted = 'You must accept the terms';
  return e;
}

/* ══════════════════════════════════════════════════════════════
   Inner Component
   ══════════════════════════════════════════════════════════════ */

function EngineerRegisterPageInner() {
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
    fullName: '', mobile: '', email: '', password: '', confirmPassword: '',
    specialization: '', otherSpec: '', licenseNumber: '',
    yearsExperience: '', city: '', termsAccepted: false,
  });
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  const formRef = useRef<HTMLDivElement>(null);

  const set = useCallback(<K extends FieldKey>(k: K, v: FieldVal) => {
    setForm(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
  }, []);

  const err = (k: FieldKey) => touched[k] ? errors[k] : undefined;

  const pwStrength = calcStrength(form.password);

  function goNext() {
    setTouched(Object.fromEntries((step === 1 ? STEP1_FIELDS : STEP2_FIELDS).map(k => [k, true])));
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
      const res = await fetch('/api/engineer/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setApiError(data.error || 'Registration failed'); setSubmitting(false); return; }
      setSuccess(true);
      setTimeout(() => router.push('/engineer/dashboard'), 1500);
    } catch {
      setApiError('Network error. Please try again.');
      setSubmitting(false);
    }
  }

  /* ── Progress % ── */
  const pct = step === 1 ? 33 : step === 2 ? 66 : 100;

  return (
    <div className="er-root" dir={dir} lang={isArabic ? 'ar' : 'en'}>

      {/* ── Brand panel ── */}
      <aside className="er-brand">
        <div className="er-brand-in">
          <Link href="/" className="er-logo">
            <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
              <rect x="0" y="0"  width="28" height="5" rx="2.5" fill="#2f6fe0"/>
              <rect x="0" y="8.5" width="20" height="5" rx="2.5" fill="#fff" opacity=".9"/>
              <rect x="0" y="17" width="28" height="5" rx="2.5" fill="#fff" opacity=".55"/>
            </svg>
            <span className="er-wordmark">bun<span className="oo">oo</span>d</span>
          </Link>
          <div className="er-brand-copy">
            <h1 className="er-brand-title">{t.brand.title}</h1>
            <p className="er-brand-sub">{t.brand.sub}</p>
          </div>
          <ul className="er-benefits">
            {t.benefits.map((b, i) => (
              <li key={i} className="er-benefit">
                <span className="er-benefit-dot" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
          <div className="er-brand-footer">
            <span className="er-tag">🏗 Construction</span>
            <span className="er-tag">🇸🇦 Saudi Arabia</span>
            <span className="er-tag">🔒 Verified</span>
          </div>
        </div>
      </aside>

      {/* ── Form panel ── */}
      <main className="er-main">
        <div className="er-form-wrap">

          {/* Progress */}
          <div className="er-progress-bar">
            <div className="er-progress-fill" style={{ width: `${pct}%` }} />
          </div>

          {/* Steps */}
          <div className="er-steps">
            {t.steps.map((label, i) => (
              <div key={i} className={`er-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
                <div className="er-step-dot">
                  {step > i + 1 ? <svg width="10" height="8" viewBox="0 0 10 8"><path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg> : i + 1}
                </div>
                <span className="er-step-label">{label}</span>
              </div>
            ))}
          </div>

          {/* Card */}
          <div className={`er-card anim-${anim}`} ref={formRef}>

            {success ? (
              <div className="er-success">
                <div className="er-success-icon">✓</div>
                <p>{t.success}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="er-card-head">
                  <h2 className="er-card-title">{t.stepTitle[step - 1]}</h2>
                  <p className="er-card-sub">{t.stepSub[step - 1]}</p>
                </div>

                {apiError && <div className="er-api-error">{apiError}</div>}

                {/* ── Step 1: Personal Info ── */}
                {step === 1 && (
                  <div className="er-fields">
                    <Field label={t.labels.fullName} error={err('fullName')}>
                      <input className={`er-input ${err('fullName') ? 'has-error' : ''}`}
                        type="text" placeholder={t.placeholders.fullName}
                        value={form.fullName} onChange={e => set('fullName', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, fullName: true }))} />
                    </Field>

                    <Field label={t.labels.mobile} error={err('mobile')}>
                      <input className={`er-input ${err('mobile') ? 'has-error' : ''}`}
                        type="tel" placeholder={t.placeholders.mobile}
                        value={form.mobile} onChange={e => set('mobile', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, mobile: true }))} />
                    </Field>

                    <Field label={t.labels.email} error={err('email')}>
                      <input className={`er-input ${err('email') ? 'has-error' : ''}`}
                        type="email" placeholder={t.placeholders.email}
                        value={form.email} onChange={e => set('email', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, email: true }))} />
                    </Field>

                    <Field label={t.labels.password} error={err('password')}>
                      <div className="er-pw-wrap">
                        <input className={`er-input ${err('password') ? 'has-error' : ''}`}
                          type={showPw ? 'text' : 'password'} placeholder={t.placeholders.password}
                          value={form.password} onChange={e => set('password', e.target.value)}
                          onBlur={() => setTouched(t => ({ ...t, password: true }))} />
                        <button type="button" className="er-pw-toggle" onClick={() => setShowPw(v => !v)}>
                          {showPw ? '🙈' : '👁'}
                        </button>
                      </div>
                      {form.password && (
                        <div className="er-pw-strength">
                          <div className="er-pw-bars">
                            {[1,2,3,4].map(n => (
                              <div key={n} className="er-pw-bar" style={{ background: pwStrength.score >= n ? pwStrength.color : undefined }} />
                            ))}
                          </div>
                          <span style={{ color: pwStrength.color }}>{t.pwStrength[pwStrength.score]}</span>
                        </div>
                      )}
                    </Field>

                    <Field label={t.labels.confirmPassword} error={err('confirmPassword')}>
                      <div className="er-pw-wrap">
                        <input className={`er-input ${err('confirmPassword') ? 'has-error' : ''}`}
                          type={showCPw ? 'text' : 'password'} placeholder={t.placeholders.confirmPassword}
                          value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                          onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))} />
                        <button type="button" className="er-pw-toggle" onClick={() => setShowCPw(v => !v)}>
                          {showCPw ? '🙈' : '👁'}
                        </button>
                      </div>
                    </Field>
                  </div>
                )}

                {/* ── Step 2: Professional Details ── */}
                {step === 2 && (
                  <div className="er-fields">
                    <Field label={t.labels.specialization} error={err('specialization')}>
                      <div className="er-spec-grid">
                        {SPECIALIZATIONS.map(s => (
                          <button key={s.id} type="button"
                            className={`er-spec-btn ${form.specialization === s.id ? 'selected' : ''}`}
                            onClick={() => set('specialization', s.id)}>
                            <span className="er-spec-en">{s.en}</span>
                            <span className="er-spec-ar">{s.ar}</span>
                          </button>
                        ))}
                      </div>
                    </Field>

                    {form.specialization === 'other' && (
                      <Field label={t.labels.otherSpec} error={err('otherSpec')}>
                        <input className="er-input"
                          type="text" placeholder={t.placeholders.otherSpec}
                          value={form.otherSpec} onChange={e => set('otherSpec', e.target.value)} />
                      </Field>
                    )}

                    <Field label={t.labels.licenseNumber} error={err('licenseNumber')}>
                      <input className="er-input"
                        type="text" placeholder={t.placeholders.licenseNumber}
                        value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
                    </Field>

                    <div className="er-row-2">
                      <Field label={t.labels.yearsExperience} error={err('yearsExperience')}>
                        <select className={`er-select ${err('yearsExperience') ? 'has-error' : ''}`}
                          value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)}>
                          <option value="">{t.selectExp}</option>
                          {EXPERIENCE_OPTS.map(o => (
                            <option key={o.id} value={o.id}>{isArabic ? o.ar : o.en}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label={t.labels.city} error={err('city')}>
                        <select className={`er-select ${err('city') ? 'has-error' : ''}`}
                          value={form.city} onChange={e => set('city', e.target.value)}>
                          <option value="">{t.selectCity}</option>
                          {KSA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                {/* ── Step 3: Confirm ── */}
                {step === 3 && (
                  <div className="er-fields">
                    <div className="er-review">
                      <ReviewRow label={isArabic ? 'الاسم' : 'Name'} value={form.fullName} />
                      <ReviewRow label={isArabic ? 'الجوال' : 'Mobile'} value={form.mobile} />
                      <ReviewRow label={isArabic ? 'البريد الإلكتروني' : 'Email'} value={form.email} />
                      <ReviewRow label={isArabic ? 'التخصص' : 'Specialization'}
                        value={SPECIALIZATIONS.find(s => s.id === form.specialization)?.[isArabic ? 'ar' : 'en'] || form.otherSpec || '—'} />
                      {form.licenseNumber && <ReviewRow label={isArabic ? 'رقم الرخصة' : 'License No.'} value={form.licenseNumber} />}
                      <ReviewRow label={isArabic ? 'الخبرة' : 'Experience'}
                        value={EXPERIENCE_OPTS.find(o => o.id === form.yearsExperience)?.[isArabic ? 'ar' : 'en'] || '—'} />
                      <ReviewRow label={isArabic ? 'المدينة' : 'City'} value={form.city} />
                    </div>

                    <label className={`er-terms ${err('termsAccepted') ? 'has-error' : ''}`}>
                      <input type="checkbox" checked={form.termsAccepted}
                        onChange={e => set('termsAccepted', e.target.checked)} />
                      <span>{t.terms}</span>
                    </label>
                    {err('termsAccepted') && <span className="er-field-error">{err('termsAccepted')}</span>}
                  </div>
                )}

                {/* ── Nav ── */}
                <div className="er-nav">
                  {step > 1 && (
                    <button type="button" className="er-btn-back" onClick={goBack}>{t.nav.back}</button>
                  )}
                  {step < 3 ? (
                    <button type="button" className="er-btn-next" onClick={goNext}>{t.nav.next}</button>
                  ) : (
                    <button type="submit" className="er-btn-submit" disabled={submitting}>
                      {submitting ? '…' : t.nav.submit}
                    </button>
                  )}
                </div>

                <p className="er-login-link">
                  {t.loginPrompt}{' '}
                  <a href={`/engineer/login${isArabic ? '?lang=ar' : ''}`}>{t.nav.login}</a>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

/* ── Sub-components ── */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="er-field">
      {label && <label className="er-label">{label}</label>}
      {children}
      {error && <span className="er-field-error">{error}</span>}
    </div>
  );
}
function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="er-review-row">
      <span className="er-review-label">{label}</span>
      <span className="er-review-value">{value}</span>
    </div>
  );
}

export default function EngineerRegisterPage() {
  return (
    <Suspense>
      <EngineerRegisterPageInner />
    </Suspense>
  );
}
