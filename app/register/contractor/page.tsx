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
  companyName:      string;
  contactPerson:    string;
  mobile:           string;
  email:            string;
  password:         string;
  confirmPassword:  string;
  workTypes:        string[];
  companySize:      string;
  crNumber:         string;
  taxNumber:        string;
  countriesServed:  string[];
  yearsInBusiness:  string;
  city:             string;
  termsAccepted:    boolean;
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

const COUNTRIES = [
  { id: 'EG', en: 'Egypt',                ar: 'مصر' },
  { id: 'SA', en: 'Saudi Arabia',         ar: 'السعودية' },
  { id: 'AE', en: 'United Arab Emirates', ar: 'الإمارات العربية المتحدة' },
];

const YEARS_IN_BUSINESS_OPTS = [
  { id: '0-2',   en: 'Less than 2 years',  ar: 'أقل من سنتين' },
  { id: '2-5',   en: '2 – 5 years',        ar: '2 – 5 سنوات' },
  { id: '5-10',  en: '5 – 10 years',       ar: '5 – 10 سنوات' },
  { id: '10-15', en: '10 – 15 years',      ar: '10 – 15 سنة' },
  { id: '15+',   en: 'More than 15 years', ar: 'أكثر من 15 سنة' },
];

const EGYPT_GOVERNORATES = [
  { en: 'Cairo',          ar: 'القاهرة' },
  { en: 'Giza',           ar: 'الجيزة' },
  { en: 'Alexandria',     ar: 'الإسكندرية' },
  { en: 'Qalyubia',       ar: 'القليوبية' },
  { en: 'Port Said',      ar: 'بورسعيد' },
  { en: 'Suez',           ar: 'السويس' },
  { en: 'Dakahlia',       ar: 'الدقهلية' },
  { en: 'Sharqia',        ar: 'الشرقية' },
  { en: 'Gharbia',        ar: 'الغربية' },
  { en: 'Monufia',        ar: 'المنوفية' },
  { en: 'Beheira',        ar: 'البحيرة' },
  { en: 'Kafr El Sheikh', ar: 'كفر الشيخ' },
  { en: 'Damietta',       ar: 'دمياط' },
  { en: 'Ismailia',       ar: 'الإسماعيلية' },
  { en: 'Faiyum',         ar: 'الفيوم' },
  { en: 'Beni Suef',      ar: 'بني سويف' },
  { en: 'Minya',          ar: 'المنيا' },
  { en: 'Asyut',          ar: 'أسيوط' },
  { en: 'Sohag',          ar: 'سوهاج' },
  { en: 'Qena',           ar: 'قنا' },
  { en: 'Luxor',          ar: 'الأقصر' },
  { en: 'Aswan',          ar: 'أسوان' },
  { en: 'Red Sea',        ar: 'البحر الأحمر' },
  { en: 'New Valley',     ar: 'الوادي الجديد' },
  { en: 'Matrouh',        ar: 'مطروح' },
  { en: 'North Sinai',    ar: 'شمال سيناء' },
  { en: 'South Sinai',    ar: 'جنوب سيناء' },
];

const STEP1_FIELDS: FieldKey[] = ['companyName', 'contactPerson', 'mobile', 'email', 'password', 'confirmPassword'];
const STEP2_FIELDS: FieldKey[] = ['workTypes', 'companySize', 'city'];
const STEP3_FIELDS: FieldKey[] = ['termsAccepted'];

/* ══════════════════════════════════════════════════════════════
   i18n
   ══════════════════════════════════════════════════════════════ */

const T = {
  en: {
    brand: { title: 'Bunood for Contractors', sub: 'Streamline your procurement. Get matched with verified suppliers across the region.' },
    steps: ['Company Info', 'Work Details', 'Confirm'],
    nav: { back: 'Back', next: 'Next', submit: 'Create Account', login: 'Sign in' },
    labels: {
      companyName: 'Company Name', contactPerson: 'Contact Person',
      mobile: 'Mobile Number', email: 'Email Address',
      password: 'Password', confirmPassword: 'Confirm Password',
      workTypes: 'Main Activity (select all that apply)',
      companySize: 'Company Size', crNumber: 'Commercial Registration No. (CR)',
      taxNumber: 'Tax Number (Optional)', countriesServed: 'Countries Served',
      yearsInBusiness: 'Years in Business', city: 'Governorate',
      crUpload: 'Upload Commercial Registration (Optional)',
      logoUpload: 'Upload Company Logo (Optional)',
    },
    placeholders: {
      companyName: 'Al-Rashidi Construction Co.', contactPerson: 'Mohammed Al-Otaibi',
      mobile: '+20 1X XXX XXXX', email: 'info@company.com',
      password: 'Min. 8 characters', confirmPassword: 'Re-enter password',
      crNumber: 'Optional — CR number', taxNumber: 'Optional — tax registration number',
      uploadCr: 'Choose a file (PDF, JPG, PNG)', uploadLogo: 'Choose an image (JPG, PNG, SVG)',
    },
    terms: 'I agree to the Terms of Service and Privacy Policy',
    loginPrompt: 'Already have an account?',
    benefits: [
      'AI-powered supplier matching for your exact project needs',
      'Get competitive quotes from verified suppliers instantly',
      'Manage all procurement in one platform — BOQ to delivery',
    ],
    tags: ['🏗 Construction', '🇪🇬 Egypt', '⚡ Procurement'],
    stepTitle: ['Company Information', 'Work & Operations', 'Review & Confirm'],
    stepSub: ['Set up your contractor account', 'Tell us what you build', 'Almost there'],
    verificationLabel: 'Verification',
    selectSize: 'Select company size',
    selectCity: 'Select governorate',
    selectYears: 'Select years in business',
    selectWorkTypes: 'Select at least one work type',
    success: 'Account created! Redirecting…',
    pwStrength: ['', 'Weak', 'Fair', 'Good', 'Strong'],
  },
  ar: {
    brand: { title: 'بنود للمقاولين', sub: 'بسّط عمليات المشتريات. تواصل مع الموردين المعتمدين في المنطقة.' },
    steps: ['معلومات الشركة', 'تفاصيل العمل', 'التأكيد'],
    nav: { back: 'رجوع', next: 'التالي', submit: 'إنشاء الحساب', login: 'تسجيل الدخول' },
    labels: {
      companyName: 'اسم الشركة', contactPerson: 'الشخص المسؤول',
      mobile: 'رقم الجوال', email: 'البريد الإلكتروني',
      password: 'كلمة المرور', confirmPassword: 'تأكيد كلمة المرور',
      workTypes: 'النشاط الرئيسي (اختر كل ما ينطبق)',
      companySize: 'حجم الشركة', crNumber: 'رقم السجل التجاري',
      taxNumber: 'الرقم الضريبي (اختياري)', countriesServed: 'الدول التي تخدمها',
      yearsInBusiness: 'سنوات العمل', city: 'المحافظة',
      crUpload: 'رفع السجل التجاري (اختياري)',
      logoUpload: 'رفع شعار الشركة (اختياري)',
    },
    placeholders: {
      companyName: 'شركة الرشيدي للإنشاءات', contactPerson: 'محمد العتيبي',
      mobile: '+20 1X XXX XXXX', email: 'info@company.com',
      password: '٨ أحرف على الأقل', confirmPassword: 'أعد إدخال كلمة المرور',
      crNumber: 'اختياري — رقم السجل التجاري', taxNumber: 'اختياري — الرقم الضريبي',
      uploadCr: 'اختر ملفاً (PDF, JPG, PNG)', uploadLogo: 'اختر صورة (JPG, PNG, SVG)',
    },
    terms: 'أوافق على شروط الخدمة وسياسة الخصوصية',
    loginPrompt: 'لديك حساب بالفعل؟',
    benefits: [
      'مطابقة موردين مدعومة بالذكاء الاصطناعي لمتطلبات مشروعك',
      'احصل على عروض أسعار تنافسية من موردين معتمدين فوراً',
      'إدارة جميع المشتريات في منصة واحدة — من جدول الكميات للتسليم',
    ],
    tags: ['🏗 إنشاءات', '🇪🇬 مصر', '⚡ مشتريات'],
    stepTitle: ['معلومات الشركة', 'الأعمال والعمليات', 'المراجعة والتأكيد'],
    stepSub: ['أنشئ حساب المقاول الخاص بك', 'أخبرنا بما تنفّذه', 'خطوة أخيرة'],
    verificationLabel: 'التحقق',
    selectSize: 'اختر حجم الشركة',
    selectCity: 'اختر المحافظة',
    selectYears: 'اختر سنوات العمل',
    selectWorkTypes: 'اختر نوع عمل واحداً على الأقل',
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
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const [success, setSuccess]       = useState(false);
  const [crFileName, setCrFileName]     = useState('');
  const [logoFileName, setLogoFileName] = useState('');

  const [form, setForm] = useState<FormData>({
    companyName: '', contactPerson: '', mobile: '', email: '',
    password: '', confirmPassword: '', workTypes: [],
    companySize: '', crNumber: '', taxNumber: '', countriesServed: [],
    yearsInBusiness: '', city: '', termsAccepted: false,
  });
  const [errors, setErrors]   = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Touched>({});

  const set = useCallback(<K extends FieldKey>(k: K, v: FieldVal) => {
    setForm(f => ({ ...f, [k]: v }));
    setTouched(t => ({ ...t, [k]: true }));
  }, []);

  const err = (k: FieldKey) => touched[k] ? errors[k] : undefined;

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

      <AuthBrandPanel
        title={t.brand.title}
        sub={t.brand.sub}
        benefits={t.benefits}
        tags={t.tags}
        classPrefix="cr"
      />

      {/* ── Form panel ── */}
      <main className="cr-main">
        <div className="cr-form-wrap">

          <StepProgress steps={t.steps} current={step} classPrefix="cr" />

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
                    <FormField label={t.labels.companyName} error={err('companyName')} classPrefix="cr">
                      <input className={`cr-input ${err('companyName') ? 'has-error' : ''}`}
                        type="text" placeholder={t.placeholders.companyName}
                        value={form.companyName} onChange={e => set('companyName', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, companyName: true }))} />
                    </FormField>

                    <FormField label={t.labels.contactPerson} error={err('contactPerson')} classPrefix="cr">
                      <input className={`cr-input ${err('contactPerson') ? 'has-error' : ''}`}
                        type="text" placeholder={t.placeholders.contactPerson}
                        value={form.contactPerson} onChange={e => set('contactPerson', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, contactPerson: true }))} />
                    </FormField>

                    <FormField label={t.labels.mobile} error={err('mobile')} classPrefix="cr">
                      <input className={`cr-input ${err('mobile') ? 'has-error' : ''}`}
                        type="tel" placeholder={t.placeholders.mobile}
                        value={form.mobile} onChange={e => set('mobile', e.target.value)}
                        onBlur={() => setTouched(t => ({ ...t, mobile: true }))} />
                    </FormField>

                    <FormField label={t.labels.email} error={err('email')} classPrefix="cr">
                      <input className={`cr-input ${err('email') ? 'has-error' : ''}`}
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
                      classPrefix="cr"
                    />

                    <PasswordField
                      label={t.labels.confirmPassword}
                      value={form.confirmPassword}
                      onChange={v => set('confirmPassword', v)}
                      onBlur={() => setTouched(t => ({ ...t, confirmPassword: true }))}
                      placeholder={t.placeholders.confirmPassword}
                      error={err('confirmPassword')}
                      classPrefix="cr"
                    />
                  </div>
                )}

                {/* ── Step 2: Work Details ── */}
                {step === 2 && (
                  <div className="cr-fields">
                    <FormField label={t.labels.workTypes} error={err('workTypes')} classPrefix="cr">
                      <MultiSelectGrid
                        options={WORK_TYPES}
                        selected={form.workTypes}
                        onToggle={id => set('workTypes', toggleItem(form.workTypes, id))}
                        classPrefix="cr-work"
                        showCheck
                      />
                    </FormField>

                    <div className="cr-row-2">
                      <FormField label={t.labels.companySize} error={err('companySize')} classPrefix="cr">
                        <select className={`cr-select ${err('companySize') ? 'has-error' : ''}`}
                          value={form.companySize} onChange={e => set('companySize', e.target.value)}>
                          <option value="">{t.selectSize}</option>
                          {COMPANY_SIZES.map(s => (
                            <option key={s.id} value={s.id}>{isArabic ? s.ar : s.en}</option>
                          ))}
                        </select>
                      </FormField>

                      <FormField label={t.labels.city} error={err('city')} classPrefix="cr">
                        <select className={`cr-select ${err('city') ? 'has-error' : ''}`}
                          value={form.city} onChange={e => set('city', e.target.value)}>
                          <option value="">{t.selectCity}</option>
                          {EGYPT_GOVERNORATES.map(g => (
                            <option key={g.en} value={g.en}>{isArabic ? g.ar : g.en}</option>
                          ))}
                        </select>
                      </FormField>
                    </div>

                    <FormField label={t.labels.yearsInBusiness} classPrefix="cr">
                      <select className="cr-select"
                        value={form.yearsInBusiness} onChange={e => set('yearsInBusiness', e.target.value)}>
                        <option value="">{t.selectYears}</option>
                        {YEARS_IN_BUSINESS_OPTS.map(o => (
                          <option key={o.id} value={o.id}>{isArabic ? o.ar : o.en}</option>
                        ))}
                      </select>
                    </FormField>

                    <FormField label={t.labels.countriesServed} classPrefix="cr">
                      <MultiSelectGrid
                        options={COUNTRIES}
                        selected={form.countriesServed}
                        onToggle={id => set('countriesServed', toggleItem(form.countriesServed, id))}
                        classPrefix="cr-country"
                        showCheck
                      />
                    </FormField>

                    <div className="cr-section-label">{t.verificationLabel}</div>

                    <div className="cr-row-2">
                      <FormField label={t.labels.crNumber} classPrefix="cr">
                        <input className="cr-input"
                          type="text" placeholder={t.placeholders.crNumber}
                          value={form.crNumber} onChange={e => set('crNumber', e.target.value)} />
                      </FormField>

                      <FormField label={t.labels.taxNumber} classPrefix="cr">
                        <input className="cr-input"
                          type="text" placeholder={t.placeholders.taxNumber}
                          value={form.taxNumber} onChange={e => set('taxNumber', e.target.value)} />
                      </FormField>
                    </div>

                    <FormField label={t.labels.crUpload} classPrefix="cr">
                      {/* Phase-3 placeholder: no upload wiring yet, just captures a filename locally. */}
                      <label className="cr-upload">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          className="cr-upload-input"
                          onChange={e => setCrFileName(e.target.files?.[0]?.name ?? '')}
                        />
                        <span className="cr-upload-text">{crFileName || t.placeholders.uploadCr}</span>
                      </label>
                    </FormField>

                    <FormField label={t.labels.logoUpload} classPrefix="cr">
                      <label className="cr-upload">
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.svg"
                          className="cr-upload-input"
                          onChange={e => setLogoFileName(e.target.files?.[0]?.name ?? '')}
                        />
                        <span className="cr-upload-text">{logoFileName || t.placeholders.uploadLogo}</span>
                      </label>
                    </FormField>
                  </div>
                )}

                {/* ── Step 3: Confirm ── */}
                {step === 3 && (
                  <div className="cr-fields">
                    <div className="cr-review">
                      <ReviewRow label={isArabic ? 'الشركة' : 'Company'} value={form.companyName} classPrefix="cr" />
                      <ReviewRow label={isArabic ? 'المسؤول' : 'Contact'} value={form.contactPerson} classPrefix="cr" />
                      <ReviewRow label={isArabic ? 'الجوال' : 'Mobile'} value={form.mobile} classPrefix="cr" />
                      <ReviewRow label={isArabic ? 'البريد الإلكتروني' : 'Email'} value={form.email} classPrefix="cr" />
                      <ReviewRow label={isArabic ? 'النشاط' : 'Main Activity'}
                        value={form.workTypes.map(id =>
                          WORK_TYPES.find(w => w.id === id)?.[isArabic ? 'ar' : 'en'] || id
                        ).join(', ')}
                        classPrefix="cr" />
                      <ReviewRow label={isArabic ? 'حجم الشركة' : 'Company Size'}
                        value={COMPANY_SIZES.find(s => s.id === form.companySize)?.[isArabic ? 'ar' : 'en'] || '—'}
                        classPrefix="cr" />
                      <ReviewRow label={isArabic ? 'المحافظة' : 'Governorate'} value={form.city} classPrefix="cr" />
                      {form.yearsInBusiness && (
                        <ReviewRow label={isArabic ? 'سنوات العمل' : 'Years in Business'}
                          value={YEARS_IN_BUSINESS_OPTS.find(o => o.id === form.yearsInBusiness)?.[isArabic ? 'ar' : 'en'] || '—'}
                          classPrefix="cr" />
                      )}
                      {form.countriesServed.length > 0 && (
                        <ReviewRow label={isArabic ? 'الدول' : 'Countries Served'}
                          value={form.countriesServed.map(id =>
                            COUNTRIES.find(c => c.id === id)?.[isArabic ? 'ar' : 'en'] || id
                          ).join(', ')}
                          classPrefix="cr" />
                      )}
                      {form.crNumber && <ReviewRow label={isArabic ? 'السجل التجاري' : 'CR Number'} value={form.crNumber} classPrefix="cr" />}
                      {form.taxNumber && <ReviewRow label={isArabic ? 'الرقم الضريبي' : 'Tax Number'} value={form.taxNumber} classPrefix="cr" />}
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

export default function ContractorRegisterPage() {
  return (
    <Suspense>
      <ContractorRegisterPageInner />
    </Suspense>
  );
}
