'use client';

import { useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FormField } from '../../../components/forms/FormField';
import { PasswordField } from '../../../components/forms/PasswordField';
import { MultiSelectGrid } from '../../../components/forms/MultiSelectGrid';
import { StepProgress } from '../../../components/forms/StepProgress';
import { ReviewRow } from '../../../components/forms/ReviewRow';
import { AuthBrandPanel } from '../../../components/layout/AuthBrandPanel';
import './page.css';

/* ══════════════════════════════════════════════════════════════
   Types
   ══════════════════════════════════════════════════════════════ */

type Step = 1 | 2 | 3;
type Anim = 'forward' | 'back' | '';

interface FormData {
  fullName:         string;
  mobile:           string;
  email:            string;
  password:         string;
  confirmPassword:  string;
  specialization:   string;
  otherSpec:        string;
  company:          string;
  country:          string;
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

const COUNTRIES = [
  { id: 'EG', en: 'Egypt',         ar: 'مصر' },
  { id: 'SA', en: 'Saudi Arabia',  ar: 'السعودية' },
  { id: 'AE', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
];

const EXPERIENCE_OPTS = [
  { id: '0-2',   en: 'Less than 2 years',  ar: 'أقل من سنتين' },
  { id: '2-5',   en: '2 – 5 years',        ar: '2 – 5 سنوات' },
  { id: '5-10',  en: '5 – 10 years',       ar: '5 – 10 سنوات' },
  { id: '10-15', en: '10 – 15 years',      ar: '10 – 15 سنة' },
  { id: '15+',   en: 'More than 15 years', ar: 'أكثر من 15 سنة' },
];

const STEP1_FIELDS: FieldKey[] = ['fullName', 'mobile', 'email', 'password', 'confirmPassword'];
const STEP2_FIELDS: FieldKey[] = ['specialization', 'country', 'yearsExperience', 'city'];
const STEP3_FIELDS: FieldKey[] = ['termsAccepted'];

/* ══════════════════════════════════════════════════════════════
   i18n
   ══════════════════════════════════════════════════════════════ */

const T = {
  en: {
    brand: { title: 'Bunood for Engineers', sub: 'Join the network of certified engineers powering construction projects across the region.' },
    steps: ['Personal Info', 'Professional Details', 'Confirm'],
    nav: { back: 'Back', next: 'Next', submit: 'Create Account', login: 'Sign in' },
    labels: {
      fullName: 'Full Name', mobile: 'Mobile Number', email: 'Email Address',
      password: 'Password', confirmPassword: 'Confirm Password',
      specialization: 'Engineering Discipline', otherSpec: 'Specify Specialization',
      company: 'Company (Optional)', country: 'Country',
      licenseNumber: 'Engineering Syndicate Number (Optional)',
      engineeringCard: 'Upload Engineering Card (Optional)',
      yearsExperience: 'Years of Experience', city: 'City',
      termsAccepted: '',
    },
    placeholders: {
      fullName: 'Eng. Ahmed Al-Rashidi', mobile: '+20 1X XXX XXXX',
      email: 'eng@example.com', password: 'Min. 8 characters',
      confirmPassword: 'Re-enter password', otherSpec: 'Enter your specialization',
      company: 'Your company or firm', country: 'Select country',
      licenseNumber: 'Syndicate membership number',
      uploadCard: 'Choose a file (PDF, JPG, PNG)',
      city: 'Select city',
    },
    terms: 'I agree to the Terms of Service and Privacy Policy',
    loginPrompt: 'Already have an account?',
    benefits: [
      'Get matched with projects that need your engineering expertise',
      'Receive RFQs and procurement requests from top contractors',
      'Build your verified profile and grow your professional network',
    ],
    tags: ['🏗 Construction', '🌍 Middle East', '🔒 Verified'],
    stepTitle: ['Your Information', 'Professional Details', 'Review & Confirm'],
    stepSub: [
      'Create your engineer account',
      'Tell us about your expertise',
      'Almost there — one last step',
    ],
    verificationLabel: 'Verification',
    selectSpec: 'Select specialization',
    selectExp: 'Select experience',
    selectCity: 'Select city',
    selectCountry: 'Select country',
    success: 'Account created! Redirecting…',
    pwStrength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
  },
  ar: {
    brand: { title: 'بنود للمهندسين', sub: 'انضم إلى شبكة المهندسين المعتمدين الذين يقودون مشاريع البناء في المنطقة.' },
    steps: ['المعلومات الشخصية', 'التفاصيل المهنية', 'التأكيد'],
    nav: { back: 'رجوع', next: 'التالي', submit: 'إنشاء الحساب', login: 'تسجيل الدخول' },
    labels: {
      fullName: 'الاسم الكامل', mobile: 'رقم الجوال', email: 'البريد الإلكتروني',
      password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور',
      specialization: 'التخصص الهندسي', otherSpec: 'حدد التخصص',
      company: 'الشركة (اختياري)', country: 'الدولة',
      licenseNumber: 'رقم نقابة المهندسين (اختياري)',
      engineeringCard: 'رفع كارنيه نقابة المهندسين (اختياري)',
      yearsExperience: 'سنوات الخبرة', city: 'المدينة',
      termsAccepted: '',
    },
    placeholders: {
      fullName: 'م. أحمد الرشيدي', mobile: '+20 1X XXX XXXX',
      email: 'eng@example.com', password: '٨ أحرف على الأقل',
      confirmPassword: 'أعد إدخال كلمة المرور', otherSpec: 'أدخل تخصصك',
      company: 'شركتك أو مكتبك الهندسي', country: 'اختر الدولة',
      licenseNumber: 'رقم عضوية النقابة',
      uploadCard: 'اختر ملفاً (PDF, JPG, PNG)',
      city: 'اختر المدينة',
    },
    terms: 'أوافق على شروط الخدمة وسياسة الخصوصية',
    loginPrompt: 'لديك حساب بالفعل؟',
    benefits: [
      'تلقّ طلبات مشاريع تحتاج إلى خبرتك الهندسية',
      'احصل على طلبات عروض الأسعار من كبار المقاولين',
      'ابنِ ملفك المهني المعتمد ووسّع شبكة علاقاتك',
    ],
    tags: ['🏗 إنشاءات', '🌍 الشرق الأوسط', '🔒 موثّق'],
    stepTitle: ['معلوماتك', 'التفاصيل المهنية', 'المراجعة والتأكيد'],
    stepSub: [
      'أنشئ حسابك كمهندس',
      'أخبرنا عن خبرتك',
      'خطوة أخيرة فقط',
    ],
    verificationLabel: 'التحقق',
    selectSpec: 'اختر التخصص',
    selectExp: 'اختر سنوات الخبرة',
    selectCity: 'اختر المدينة',
    selectCountry: 'اختر الدولة',
    success: 'تم إنشاء الحساب! جارٍ التحويل…',
    pwStrength: ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية'],
  },
};

/* ══════════════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════════════ */

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
  if (fields.includes('country') && !data.country)
    e.country = 'Please select your country';
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
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const [success, setSuccess]       = useState(false);
  const [cardFileName, setCardFileName] = useState('');

  const [form, setForm] = useState<FormData>({
    fullName: '', mobile: '', email: '', password: '', confirmPassword: '',
    specialization: '', otherSpec: '', company: '', country: '',
    licenseNumber: '', yearsExperience: '', city: '', termsAccepted: false,
  });
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  const set = useCallback(<K extends FieldKey>(k: K, v: FieldVal) => {
    setForm(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
  }, []);

  const err = (k: FieldKey) => touched[k] ? errors[k] : undefined;

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

  return (
    <div className="er-root" dir={dir} lang={isArabic ? 'ar' : 'en'}>

      <AuthBrandPanel
        title={t.brand.title}
        sub={t.brand.sub}
        benefits={t.benefits}
        tags={t.tags}
        classPrefix="er"
      />

      {/* ── Form panel ── */}
      <main className="er-main">
        <div className="er-form-wrap">

          <StepProgress steps={t.steps} current={step} classPrefix="er" />

          {/* Card */}
          <div className={`er-card anim-${anim}`}>

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
                    <FormField label={t.labels.fullName} error={err('fullName')} classPrefix="er">
                      <input className={`er-input ${err('fullName') ? 'has-error' : ''}`}
                        type="text" placeholder={t.placeholders.fullName}
                        value={form.fullName} onChange={e => set('fullName', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, fullName: true }))} />
                    </FormField>

                    <FormField label={t.labels.mobile} error={err('mobile')} classPrefix="er">
                      <input className={`er-input ${err('mobile') ? 'has-error' : ''}`}
                        type="tel" placeholder={t.placeholders.mobile}
                        value={form.mobile} onChange={e => set('mobile', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, mobile: true }))} />
                    </FormField>

                    <FormField label={t.labels.email} error={err('email')} classPrefix="er">
                      <input className={`er-input ${err('email') ? 'has-error' : ''}`}
                        type="email" placeholder={t.placeholders.email}
                        value={form.email} onChange={e => set('email', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, email: true }))} />
                    </FormField>

                    <PasswordField
                      label={t.labels.password}
                      value={form.password}
                      onChange={v => set('password', v)}
                      onBlur={() => setTouched(t => ({ ...t, password: true }))}
                      placeholder={t.placeholders.password}
                      error={err('password')}
                      showStrength
                      strengthLabels={t.pwStrength}
                      classPrefix="er"
                    />

                    <PasswordField
                      label={t.labels.confirmPassword}
                      value={form.confirmPassword}
                      onChange={v => set('confirmPassword', v)}
                      onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
                      placeholder={t.placeholders.confirmPassword}
                      error={err('confirmPassword')}
                      classPrefix="er"
                    />
                  </div>
                )}

                {/* ── Step 2: Professional Details ── */}
                {step === 2 && (
                  <div className="er-fields">
                    <FormField label={t.labels.specialization} error={err('specialization')} classPrefix="er">
                      <MultiSelectGrid
                        options={SPECIALIZATIONS}
                        selected={form.specialization ? [form.specialization] : []}
                        onToggle={id => set('specialization', id)}
                        classPrefix="er-spec"
                      />
                    </FormField>

                    {form.specialization === 'other' && (
                      <FormField label={t.labels.otherSpec} error={err('otherSpec')} classPrefix="er">
                        <input className="er-input"
                          type="text" placeholder={t.placeholders.otherSpec}
                          value={form.otherSpec} onChange={e => set('otherSpec', e.target.value)} />
                      </FormField>
                    )}

                    <div className="er-row-2">
                      <FormField label={t.labels.company} classPrefix="er">
                        <input className="er-input"
                          type="text" placeholder={t.placeholders.company}
                          value={form.company} onChange={e => set('company', e.target.value)} />
                      </FormField>

                      <FormField label={t.labels.country} error={err('country')} classPrefix="er">
                        <select className={`er-select ${err('country') ? 'has-error' : ''}`}
                          value={form.country} onChange={e => set('country', e.target.value)}>
                          <option value="">{t.selectCountry}</option>
                          {COUNTRIES.map(c => (
                            <option key={c.id} value={c.id}>{isArabic ? c.ar : c.en}</option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <div className="er-row-2">
                      <FormField label={t.labels.yearsExperience} error={err('yearsExperience')} classPrefix="er">
                        <select className={`er-select ${err('yearsExperience') ? 'has-error' : ''}`}
                          value={form.yearsExperience} onChange={e => set('yearsExperience', e.target.value)}>
                          <option value="">{t.selectExp}</option>
                          {EXPERIENCE_OPTS.map(o => (
                            <option key={o.id} value={o.id}>{isArabic ? o.ar : o.en}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label={t.labels.city} error={err('city')} classPrefix="er">
                        <select className={`er-select ${err('city') ? 'has-error' : ''}`}
                          value={form.city} onChange={e => set('city', e.target.value)}>
                          <option value="">{t.selectCity}</option>
                          {KSA_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </FormField>
                    </div>

                    <div className="er-section-label">{t.verificationLabel}</div>

                    <FormField label={t.labels.licenseNumber} classPrefix="er">
                      <input className="er-input"
                        type="text" placeholder={t.placeholders.licenseNumber}
                        value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} />
                    </FormField>

                    <FormField label={t.labels.engineeringCard} classPrefix="er">
                      {/* Phase-3 placeholder: no upload wiring yet, just captures a filename locally. */}
                      <label className="er-upload">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="er-upload-input"
                          onChange={e => setCardFileName(e.target.files?.[0]?.name ?? '')}
                        />
                        <span className="er-upload-text">{cardFileName || t.placeholders.uploadCard}</span>
                      </label>
                    </FormField>
                  </div>
                )}

                {/* ── Step 3: Confirm ── */}
                {step === 3 && (
                  <div className="er-fields">
                    <div className="er-review">
                      <ReviewRow label={isArabic ? 'الاسم' : 'Name'} value={form.fullName} classPrefix="er" />
                      <ReviewRow label={isArabic ? 'الجوال' : 'Mobile'} value={form.mobile} classPrefix="er" />
                      <ReviewRow label={isArabic ? 'البريد الإلكتروني' : 'Email'} value={form.email} classPrefix="er" />
                      <ReviewRow label={isArabic ? 'التخصص' : 'Specialization'}
                        value={SPECIALIZATIONS.find(s => s.id === form.specialization)?.[isArabic ? 'ar' : 'en'] || form.otherSpec || '—'}
                        classPrefix="er" />
                      {form.company && <ReviewRow label={isArabic ? 'الشركة' : 'Company'} value={form.company} classPrefix="er" />}
                      <ReviewRow label={isArabic ? 'الدولة' : 'Country'}
                        value={COUNTRIES.find(c => c.id === form.country)?.[isArabic ? 'ar' : 'en'] || '—'}
                        classPrefix="er" />
                      {form.licenseNumber && <ReviewRow label={isArabic ? 'رقم النقابة' : 'Syndicate No.'} value={form.licenseNumber} classPrefix="er" />}
                      <ReviewRow label={isArabic ? 'الخبرة' : 'Experience'}
                        value={EXPERIENCE_OPTS.find(o => o.id === form.yearsExperience)?.[isArabic ? 'ar' : 'en'] || '—'}
                        classPrefix="er" />
                      <ReviewRow label={isArabic ? 'المدينة' : 'City'} value={form.city} classPrefix="er" />
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

export default function EngineerRegisterPage() {
  return (
    <Suspense>
      <EngineerRegisterPageInner />
    </Suspense>
  );
}
