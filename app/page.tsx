'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import './page.css';

/* ------------------------------------------------------------------ */
/* bunood — home page (Arabic-first, RTL)                              */
/* Procurement · Connect suppliers & contractors · AI estimation       */
/* ------------------------------------------------------------------ */

type Lang = 'ar' | 'en';
/** Non-nullable role identifier */
type RoleId = 'engineer' | 'contractor' | 'supplier';
/** Nullable role — null means "not yet chosen" */
type Role = RoleId | null;

/* ---- Shared types -------------------------------------------------- */
const ROLE_LABEL: Record<Lang, Record<RoleId, string>> = {
  ar: { engineer: 'مهندس', contractor: 'مقاول', supplier: 'مورّد' },
  en: { engineer: 'Engineer', contractor: 'Contractor', supplier: 'Supplier' },
};

/**
 * Role items used in the signup modal. Kept as a typed constant rather than
 * inline JSX so the data is reusable and the template is readable.
 */
const MODAL_ROLES: Array<{
  id: RoleId;
  ar: string;
  en: string;
  arSub: string;
  enSub: string;
}> = [
  { id: 'engineer',   ar: 'مهندس / استشاري', en: 'Engineer / Consultant', arSub: 'سعّر المقايسات وصدّر التقارير.', enSub: 'Price BOQs and export reports.' },
  { id: 'contractor', ar: 'مقاول',            en: 'Contractor',           arSub: 'من المقايسة للتوريد أسرع.',    enSub: 'From BOQ to procurement, faster.' },
  { id: 'supplier',   ar: 'مورّد',            en: 'Supplier',             arSub: 'استقبل الطلبات وابعت عروضك.', enSub: 'Receive RFQs and send your quotes.' },
];

/* ---- i18n copy ----------------------------------------------------- */
const COPY = {
  ar: {
    dir: 'rtl' as const,
    nav: {
      whatWeDo: 'ما نفعله',
      signup: 'إنشاء حساب',
      login: 'تسجيل الدخول',
    },
    hero: {
      eyebrow: 'نظام مشتريات البناء',
      title: ['من المقايسة للعروض —', 'في دقائق، لا أسابيع.', ''],
      sub: 'بنود يقرأ أي مقايسة، يصنّف كل بند تلقائياً، ويرسل طلبات التوريد لموردين معتمدين. قارن العروض جنباً لجنب واتخذ قرارك في الحال.',
      ctaPrimary: 'ابدأ مجاناً',
      ctaSecondary: 'شاهد كيف يعمل',
      proof: '٥٠٠+ مورّد · توفير ١٥٪ · ٢,٤٠٠+ طلب مكتمل',
      stats: [
        { val: '500+',  lbl: 'مورّد معتمد' },
        { val: '15%',   lbl: 'متوسط التوفير' },
        { val: '< 48س', lbl: 'وقت الرد' },
        { val: '2,400', lbl: 'طلب مكتمل' },
      ],
      features: [
        { icon: 'upload' as const, title: 'ارفع المقايسة',  desc: 'PDF أو Excel أو صورة هاتف.' },
        { icon: 'zap'    as const, title: 'تصنيف ذكي',     desc: 'كل بند يُصنَّف تلقائياً في ثوانٍ.' },
        { icon: 'award'  as const, title: 'عروض حقيقية',   desc: 'من موردين معتمدين ومتنافسين.' },
        { icon: 'chart'  as const, title: 'مقارنة فورية',  desc: 'اختر الأفضل سعراً بنقرة واحدة.' },
      ],
    },
    strip: ['وداعًا لأسابيع الإكسيل.', 'أسعار حقيقية، حي بحي — مش متوسطات.', 'الموردين في إيدك، قارن العروض في دقايق.'],
    how: {
      label: 'إزاي بيشتغل',
      steps: [
        { t: 'ارفع المقايسة', d: 'PDF أو Excel أو صورة من ورقة مطبوعة — بنود بيقراها كلها.' },
        { t: 'تصنيف تلقائي', d: 'كل بند بيتطابق مع مكتبة بنود، والذكاء الاصطناعي يكمّل الناقص وانت بتأكّد.' },
        { t: 'تسعير لحظي', d: 'أسعار مصرية على مستوى الحي، بتتحدّث باستمرار.' },
        { t: 'طلب توريد فوري', d: 'حوّل البنود لطلبات توريد وابعتها للموردين على واتساب أو إيميل.' },
      ],
    },
    roles: {
      label: 'اختر دورك',
      title: 'بنود بيشتغل معاك إنت بالذات.',
      sub: 'كل دور ليه مساره الخاص. اختر اللي يوصّفك، وكمّل تسجيل.',
      items: [
        { id: 'engineer' as const,   t: 'مهندس / استشاري', d: 'سعّر المقايسات، راجع كل بند بدقة، وصدّر تقرير جاهز.' },
        { id: 'contractor' as const, t: 'مقاول',            d: 'من المقايسة للتوريد — سعّر، قارن، وقدّم عروضك أسرع.' },
        { id: 'supplier' as const,   t: 'مورّد',            d: 'استقبل طلبات التوريد وابعت عروض أسعارك للمقاولين.' },
      ],
      cta: 'ابدأ كـ',
    },
    feat: {
      label: 'ليه بنود',
      items: [
        { t: 'المكتبة هي الحصن', d: 'كل مقايسة بتشغّلها بتخلّي التصنيف أدقّ للي بعدها. الكتالوج بيتراكم — مبيرجعش من الأول.' },
        { t: 'محرّك واحد، وصفات كتير', d: 'معادلات التكلفة ثابتة؛ بيتغيّر بس الخامات والمعاملات. نتايج ثابتة وقابلة للمراجعة.' },
        { t: 'تسعير عارف القاهرة', d: 'الأسعار بتفرق من شارع لشارع، مش بس من محافظة لمحافظة. بنود بيتابع التفصيلة دي.' },
        { t: 'توريد من غير وجع دماغ', d: 'طلبات التوريد بتتبعت بواتساب وإيميل، والعروض بترجعلك مرتّبة وجاهزة للمقارنة.' },
      ],
    },
    modal: {
      eyebrow: 'إنشاء حساب',
      title: 'انت مين في المشروع؟',
      sub: 'اختر دورك وهنخصّص تجربتك من اللحظة الأولى.',
    },
    cta: {
      title: 'كن أول من يربط ويسعّر ويورّد مع بنود.',
      sub: 'سجّل في قائمة الوصول المبكر، وهنكلّمك على واتساب أول ما مكانك يجهز.',
    },
    form: {
      email: 'بريدك الإلكتروني',
      whatsapp: 'رقم واتساب (اختياري)',
      cta: 'سجّلني',
      sending: 'جاري الإرسال…',
      success: 'تمام، اسمك في القائمة. هنتواصل معاك قريب.',
      errBad: 'اكتب بريد إلكتروني صحيح.',
      errFail: 'حصل خطأ. جرّب تاني.',
      asTag: 'بتسجّل كـ',
    },
    footer: { tag: 'بنود — منصة المشتريات الفورية للمقاولات.', rights: 'كل الحقوق محفوظة.' },
  },
  en: {
    dir: 'ltr' as const,
    nav: {
      whatWeDo: 'What we do',
      signup: 'Sign up',
      login: 'Login',
    },
    hero: {
      eyebrow: 'Construction Procurement OS',
      title: ['From BOQ to quotes.', 'In minutes, not weeks.', ''],
      sub: 'Upload any BOQ format. Bunood classifies every line and dispatches RFQs to verified suppliers automatically. Compare real bids side-by-side and award instantly.',
      ctaPrimary: 'Start free',
      ctaSecondary: 'See how it works',
      proof: '500+ suppliers · 15% avg savings · 2,400+ RFQs completed',
      stats: [
        { val: '500+',   lbl: 'Verified suppliers' },
        { val: '15%',    lbl: 'Avg. savings' },
        { val: '< 48h',  lbl: 'Quote response' },
        { val: '2,400+', lbl: 'RFQs completed' },
      ],
      features: [
        { icon: 'upload' as const, title: 'Upload BOQ',       desc: 'PDF, Excel, or a phone photo.' },
        { icon: 'zap'    as const, title: 'AI Classify',      desc: 'Every line tagged in seconds.' },
        { icon: 'award'  as const, title: 'Real Quotes',      desc: 'From verified, competing suppliers.' },
        { icon: 'chart'  as const, title: 'Compare & Award',  desc: 'Pick the best offer in one click.' },
      ],
    },
    strip: ['Goodbye, weeks in Excel.', 'Real rates, street by street — not averages.', 'Suppliers at hand — compare quotes in minutes.'],
    how: {
      label: 'How it works',
      steps: [
        { t: 'Upload your BOQ', d: 'PDF, Excel, or a phone scan — Bunood reads all three.' },
        { t: 'Auto-classified', d: "Each line matches Bunood's library; AI fills the gaps and you confirm." },
        { t: 'Priced live', d: 'Real Egyptian rates down to the neighbourhood, refreshed continuously.' },
        { t: 'Instant RFQ', d: 'Turn lines into procurement requests and send to suppliers on WhatsApp or email.' },
      ],
    },
    roles: {
      label: 'Choose your role',
      title: 'Bunood works the way you do.',
      sub: 'Each role has its own flow. Pick the one that fits and continue.',
      items: [
        { id: 'engineer' as const,   t: 'Engineer / Consultant', d: 'Price BOQs, review every line precisely, export a ready report.' },
        { id: 'contractor' as const, t: 'Contractor',            d: 'From BOQ to procurement — price, compare, and bid faster.' },
        { id: 'supplier' as const,   t: 'Supplier',              d: 'Receive RFQs and send your quotes back to contractors.' },
      ],
      cta: 'Start as',
    },
    feat: {
      label: 'Why bunood',
      items: [
        { t: 'The library is the moat', d: "Every BOQ you run sharpens the next. The catalogue compounds — it doesn't reset." },
        { t: 'One engine, many recipes', d: 'The cost maths never change; only materials and coefficients do. Consistent, auditable.' },
        { t: 'Pricing that knows Cairo', d: 'Rates shift street to street, not just by governorate. Bunood tracks that granularity.' },
        { t: 'Procurement without the headache', d: 'RFQs go out by WhatsApp and email; quotes come back sorted and ready to compare.' },
      ],
    },
    modal: {
      eyebrow: 'Create account',
      title: 'What is your role?',
      sub: "Pick your role and we'll tailor the experience from day one.",
    },
    cta: {
      title: 'Be first to connect, price, and procure with Bunood.',
      sub: "Join the early-access list. We'll reach out on WhatsApp when your seat is ready.",
    },
    form: {
      email: 'you@company.com',
      whatsapp: 'WhatsApp number (optional)',
      cta: 'Join the list',
      sending: 'Sending…',
      success: "You're on the list. We'll reach out soon.",
      errBad: 'Enter a valid email address.',
      errFail: 'Something went wrong. Try again.',
      asTag: 'Joining as',
    },
    footer: { tag: 'Bunood — instant procurement for construction.', rights: 'All rights reserved.' },
  },
} as const;

/* ---- Procurement OS dashboard data --------------------------------- */
const PROC_STEPS = {
  en: ['BOQ', 'Analysis', 'RFQs', 'Comparing', 'Award'],
  ar: ['تجميع الكميات', 'تحليل الأسعار', 'طلبات الموردين', 'مقارنة العروض', 'الترسية'],
};
const ACTIVITY_DATA = {
  en: [
    { txt: 'Delta Steel submitted final quotation', time: 'just now', type: 'blue'  },
    { txt: 'Al-Masry Steel revised bid −4.2%',      time: '2m ago',   type: 'green' },
    { txt: '3 new suppliers accepted the RFQ',      time: '6m ago',   type: 'grey'  },
  ],
  ar: [
    { txt: 'دلتا ستيل قدّم عرضه النهائي',      time: 'الآن', type: 'blue'  },
    { txt: 'الأهلي للحديد خفّض عرضه 4.2%',    time: 'م 2',  type: 'green' },
    { txt: '3 موردين جدد قبلوا طلب الأسعار',  time: 'م 6',  type: 'grey'  },
  ],
};

const formatNumber = (n: number) => n.toLocaleString('en-US');

/* ================================================================== */

export default function Home() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>('ar');
  const [role, setRole] = useState<Role>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const t = COPY[lang];

  /** Select a role — suppliers go straight to registration, others scroll to waitlist. */
  const pickRole = (r: RoleId) => {
    if (r === 'supplier') {
      router.push('/register/supplier');
      return;
    }
    setRole(r);
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('waitlist')?.scrollIntoView({
      behavior: prefersReduced ? 'auto' : 'smooth',
    });
  };

  const openModal  = () => setShowRoleModal(true);
  const closeModal = () => setShowRoleModal(false);

  /** Close the modal when the user presses Escape. */
  useEffect(() => {
    if (!showRoleModal) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showRoleModal]);

  return (
    <div className="bn-root" dir={t.dir} lang={lang}>

      {/* ---- Role selection modal ------------------------------------ */}
      {showRoleModal && (
        <div
          className="bn-modal-backdrop"
          onClick={closeModal}
          dir={t.dir}
          aria-label="Dismiss modal"
        >
          <div
            className="bn-modal"
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <button className="bn-modal-close" onClick={closeModal} aria-label="Close">✕</button>
            <p className="bn-modal-eyebrow">{t.modal.eyebrow}</p>
            <h2 id="modal-title" className="bn-modal-title">{t.modal.title}</h2>
            <p className="bn-modal-sub">{t.modal.sub}</p>
            <div className="bn-modal-roles">
              {MODAL_ROLES.map(item => (
                <button
                  key={item.id}
                  className="bn-role-card"
                  onClick={() => { pickRole(item.id); closeModal(); }}
                >
                  <span className="bn-role-card-icon"><RoleIcon id={item.id} /></span>
                  <span className="bn-role-card-label">{lang === 'ar' ? item.ar : item.en}</span>
                  <span className="bn-role-card-sub">{lang === 'ar' ? item.arSub : item.enSub}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ---- Header ------------------------------------------------- */}
      <header className="bn-header">
        <div className="bn-wrap bn-header-in">
          <Logo />
          <div className="bn-nav-ctas">
            <button onClick={openModal} className="bn-btn bn-btn-ghost bn-btn-sm">{t.nav.signup}</button>
            <a href="#waitlist" className="bn-btn bn-btn-sm">{t.nav.login}</a>
          </div>
          <nav className="bn-nav" aria-label="Main navigation">
            <a href="#how" className="bn-navlink">{t.nav.whatWeDo}</a>
            <button
              className="bn-lang"
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              aria-label="Switch language"
            >
              {lang === 'ar' ? 'EN' : 'العربية'}
            </button>
          </nav>
        </div>
      </header>

      {/* ---- Hero --------------------------------------------------- */}
      <section className="bn-hero" aria-labelledby="hero-heading">
        <div className={`bn-hero-stage${lang === 'ar' ? ' is-rtl' : ''}`}>

          <div className="bn-hero-ledger-col">
            <Ledger lang={lang} />
          </div>

          <div className="bn-hero-copy-col" dir={t.dir}>
            <span className="bn-eyebrow">{t.hero.eyebrow}</span>
            <h1 id="hero-heading" className="bn-h1">
              {t.hero.title[0]}<span className="bn-accent">{t.hero.title[1]}</span><span className="bn-h1-trail">{t.hero.title[2]}</span>
            </h1>
            <p className="bn-hero-lede">{t.hero.sub}</p>
            <div className="bn-hero-cta">
              <a href="#waitlist" className="bn-btn bn-btn-hero">{t.hero.ctaPrimary}</a>
              <a href="#roles" className="bn-btn bn-btn-ghost">{t.hero.ctaSecondary}</a>
            </div>
            <div className="bn-hero-stats">
              {t.hero.stats.map(s => (
                <div className="bn-stat-item" key={s.lbl}>
                  <span className="bn-stat-val">{s.val}</span>
                  <span className="bn-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
            <div className="bn-hero-features">
              {t.hero.features.map(f => (
                <div className="bn-feat-item" key={f.title}>
                  <span className="bn-feat-icon"><HeroIcon icon={f.icon} /></span>
                  <span className="bn-feat-body">
                    <span className="bn-feat-title">{f.title}</span>
                    <span className="bn-feat-desc">{f.desc}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* ---- Selling strip ------------------------------------------ */}
      <div className="bn-strip" aria-hidden>
        <div className="bn-wrap bn-strip-in">
          {t.strip.map(s => (
            <span className="bn-strip-item" key={s}>{s}</span>
          ))}
        </div>
      </div>

      {/* ---- How it works ------------------------------------------- */}
      <section className="bn-section" id="how" aria-labelledby="how-heading">
        <div className="bn-wrap">
          <span className="bn-label" id="how-heading">{t.how.label}</span>
          <div className="bn-steps">
            {t.how.steps.map((s, i) => (
              <div className="bn-step" key={s.t}>
                <span className="bn-step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="bn-step-t">{s.t}</h3>
                <p className="bn-step-d">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Roles -------------------------------------------------- */}
      <section className="bn-section bn-section-alt" id="roles" aria-labelledby="roles-heading">
        <div className="bn-wrap">
          <span className="bn-label" id="roles-heading">{t.roles.label}</span>
          <h2 className="bn-h2">{t.roles.title}</h2>
          <p className="bn-lede bn-roles-sub">{t.roles.sub}</p>
          <div className="bn-roles">
            {t.roles.items.map(r => (
              <button
                key={r.id}
                className={`bn-role ${role === r.id ? 'is-on' : ''}`}
                onClick={() => pickRole(r.id)}
                aria-pressed={role === r.id}
              >
                <RoleIcon id={r.id} />
                <h3 className="bn-role-t">{r.t}</h3>
                <p className="bn-role-d">{r.d}</p>
                <span className="bn-role-cta">{t.roles.cta} {ROLE_LABEL[lang][r.id]} ←</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Features ----------------------------------------------- */}
      <section className="bn-section" aria-labelledby="feat-heading">
        <div className="bn-wrap">
          <span className="bn-label" id="feat-heading">{t.feat.label}</span>
          <div className="bn-feats">
            {t.feat.items.map(f => (
              <div className="bn-feat" key={f.t}>
                <h3 className="bn-feat-t">{f.t}</h3>
                <p className="bn-feat-d">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- Waitlist ----------------------------------------------- */}
      <section className="bn-section bn-cta" id="waitlist" aria-labelledby="cta-heading">
        <div className="bn-wrap bn-cta-in">
          <h2 id="cta-heading" className="bn-h2">{t.cta.title}</h2>
          <p className="bn-lede bn-cta-sub">{t.cta.sub}</p>
          <WaitlistForm lang={lang} role={role} />
        </div>
      </section>

      {/* ---- Footer ------------------------------------------------- */}
      <footer className="bn-footer">
        <div className="bn-wrap bn-footer-in">
          <Logo small />
          <span className="bn-foot-tag">{t.footer.tag}</span>
          <span className="bn-foot-rights">© {new Date().getFullYear()} bunood · {t.footer.rights}</span>
        </div>
      </footer>
    </div>
  );
}

/* ---- Logo ---------------------------------------------------------- */
function Logo({ small }: { small?: boolean }) {
  const size = small ? 20 : 34;
  return (
    <span className={`bn-logo${small ? ' bn-logo-sm' : ''}`} dir="ltr">
      <svg width={size} height={size} viewBox="0 0 96 96" fill="none" aria-hidden>
        <g stroke="#2F6FE0" strokeWidth="7" strokeLinecap="round">
          <path d="M20 38 V23 Q20 20 23 20 H38" fill="none" />
          <path d="M76 58 V73 Q76 76 73 76 H58" fill="none" />
        </g>
        <g strokeWidth="6.5" strokeLinecap="round">
          <line x1="33" y1="38" x2="66" y2="38" stroke="#2C313A" />
          <line x1="33" y1="48" x2="58" y2="48" stroke="#2F6FE0" />
          <line x1="33" y1="58" x2="63" y2="58" stroke="#2C313A" />
        </g>
      </svg>
      <span className="bn-word">bun<span className="bn-accent">oo</span>d</span>
    </span>
  );
}

/* ---- Role icons ---------------------------------------------------- */
function RoleIcon({ id }: { id: RoleId }) {
  const p = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" className="bn-role-ic" aria-hidden>
      {id === 'engineer'   && (<><path {...p} d="M5 19 L19 19 L5 5 Z" /><path {...p} d="M5 12 L12 12" /></>)}
      {id === 'contractor' && (<><path {...p} d="M3 18 H21" /><path {...p} d="M5 18 a7 7 0 0 1 14 0" /><path {...p} d="M11 5 h2 v3" /></>)}
      {id === 'supplier'   && (<><path {...p} d="M4 8 L12 4 L20 8 V16 L12 20 L4 16 Z" /><path {...p} d="M4 8 L12 12 L20 8" /><path {...p} d="M12 12 V20" /></>)}
    </svg>
  );
}

/* ---- Hero feature icons -------------------------------------------- */
function HeroIcon({ icon }: { icon: 'upload' | 'zap' | 'award' | 'chart' }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      {icon === 'upload' && (<><path {...p} d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline {...p} points="17 8 12 3 7 8"/><line {...p} x1="12" y1="3" x2="12" y2="15"/></>)}
      {icon === 'zap'    && (<polygon {...p} points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>)}
      {icon === 'award'  && (<><circle {...p} cx="12" cy="8" r="6"/><path {...p} d="M8.2 14.3 7 22l5-3 5 3-1.2-7.7"/></>)}
      {icon === 'chart'  && (<><path {...p} d="M3 3v18h18"/><path {...p} d="m7 16 4-6 4 4 4-7"/></>)}
    </svg>
  );
}

/* ---- Animated procurement OS dashboard ----------------------------- */
function Ledger({ lang }: { lang: Lang }) {
  const [actStep, setActStep] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setActStep(3); return; }
    const id = setInterval(() => setActStep(s => (s >= 5 ? 0 : s + 1)), 2200);
    return () => clearInterval(id);
  }, []);

  const steps    = PROC_STEPS[lang];
  const activity = ACTIVITY_DATA[lang];
  const visAct   = Math.min(actStep, 3);

  const L = lang === 'ar' ? {
    file:           'نظام-المشتريات.bunood',
    live:           'مباشر',
    project:        'برج A — بنية تحتية',
    projectId:      'المشروع #BN-2847',
    m1Lbl: 'طلبات مكتملة',  m1Val: '127',            m1Sub: 'طلب',
    m2Lbl: 'موردين مشاركين', m2Val: '46',             m2Sub: 'مورد',
    m3Lbl: 'أفضل سعر',      m3Val: '١.٢٤ م.م',       m3Sub: 'ر.س',
    m4Lbl: 'وفر متوقع',     m4Val: '↓ 218 ألف',      m4Sub: '(15%)',
    aiRec:      'أفضل العروض',
    aiSavings:  'توفير 15%',
    suppName:   'شركة البناء المتقدمة',
    suppPrice:  'ر.س 1,245,000',
    suppDelivery: 'التسليم: 14 يوم',
    suppPayment:  'الدفع: 30 يوم',
    acceptBtn:  'عرض التفصيل والمقارنة ↙',
    compareBtn: 'مقارنة 46 عرضاً',
    liveTitle:  'نشاط مباشر',
    footer:     'تحديث منذ 5 دقائق',
  } : {
    file:           'procurement-os.bunood',
    live:           'LIVE',
    project:        'Tower Block A — Infrastructure',
    projectId:      'Project #BN-2847',
    m1Lbl: 'Completed RFQs',       m1Val: '127',     m1Sub: 'requests',
    m2Lbl: 'Active Suppliers',     m2Val: '46',      m2Sub: 'suppliers',
    m3Lbl: 'Best Price',           m3Val: '1.24M',   m3Sub: 'SAR',
    m4Lbl: 'Expected Savings',     m4Val: '↓ 218K',  m4Sub: '(15%)',
    aiRec:      'Best Offers',
    aiSavings:  '15% savings',
    suppName:   'Advanced Building Co.',
    suppPrice:  'SAR 1,245,000',
    suppDelivery: 'Delivery: 14 days',
    suppPayment:  'Payment: 30 days',
    acceptBtn:  'View Details & Compare',
    compareBtn: 'Compare 46 offers',
    liveTitle:  'Live Activity',
    footer:     'Updated 5 minutes ago',
  };

  return (
    <div className="bn-ledger" dir="ltr" aria-hidden>

      {/* ── Title bar ─────────────────────────────── */}
      <div className="bn-ledger-bar">
        <span className="bn-dot" /><span className="bn-dot" /><span className="bn-dot" />
        <span className="bn-ledger-name">{L.file}</span>
        <span className="bn-live-pill">{L.live}</span>
      </div>

      {/* ── Project header ────────────────────────── */}
      <div className="bn-proj-hdr">
        <span className="bn-proj-icon" aria-hidden="true">🏗</span>
        <div className="bn-proj-info">
          <span className="bn-proj-name">{L.project}</span>
          <span className="bn-proj-id">{L.projectId}</span>
        </div>
      </div>

      {/* ── Process stepper ───────────────────────── */}
      <div className="bn-stepper">
        {steps.map((s, i) => (
          <div key={i} className={`bn-sstep${i < 4 ? ' is-done' : ' is-active'}`}>
            <span className="bn-sstep-num">{i < 4 ? '✓' : ''}</span>
            <span className="bn-sstep-txt">{s}</span>
            {i < steps.length - 1 && <span className="bn-sstep-arr" aria-hidden="true">→</span>}
          </div>
        ))}
      </div>

      {/* ── Metrics row ───────────────────────────── */}
      <div className="bn-metrics">
        <div className="bn-metric">
          <span className="bn-metric-t">{L.m1Lbl}</span>
          <span className="bn-metric-n">{L.m1Val}</span>
          <span className="bn-metric-l">{L.m1Sub}</span>
        </div>
        <div className="bn-metric">
          <span className="bn-metric-t">{L.m2Lbl}</span>
          <span className="bn-metric-n">{L.m2Val}</span>
          <span className="bn-metric-l">{L.m2Sub}</span>
        </div>
        <div className="bn-metric">
          <span className="bn-metric-t">{L.m3Lbl}</span>
          <span className="bn-metric-n">{L.m3Val}</span>
          <span className="bn-metric-l">{L.m3Sub}</span>
        </div>
        <div className="bn-metric bn-metric--savings">
          <span className="bn-metric-t">{L.m4Lbl}</span>
          <span className="bn-metric-n">{L.m4Val}</span>
          <span className="bn-metric-l">{L.m4Sub}</span>
        </div>
      </div>

      {/* ── AI Recommendation ─────────────────────── */}
      <div className="bn-ai-rec">
        <div className="bn-ai-rec-top">
          <span className="bn-ai-label">{L.aiRec}</span>
          <span className="bn-ai-savings-badge">{L.aiSavings}</span>
        </div>
        <div className="bn-ai-supp">{L.suppName}</div>
        <div className="bn-ai-detail-row">
          <span className="bn-ai-detail-price">{L.suppPrice}</span>
          <span className="bn-ai-detail-sep">·</span>
          <span>{L.suppDelivery}</span>
          <span className="bn-ai-detail-sep">·</span>
          <span>{L.suppPayment}</span>
        </div>
        <div className="bn-ai-btns">
          <button className="bn-accept-btn">{L.acceptBtn}</button>
          <button className="bn-compare-btn">{L.compareBtn}</button>
        </div>
      </div>

      {/* ── Live activity feed ────────────────────── */}
      <div className="bn-live-feed">
        <span className="bn-live-feed-hdr">{L.liveTitle}</span>
        {activity.map((a, i) => (
          <div
            key={i}
            className={`bn-act-item${i < visAct ? ' is-vis' : ''}${a.type === 'blue' ? ' is-blue' : a.type === 'green' ? ' is-green' : ''}`}
          >
            <span className="bn-act-dot" />
            <span className="bn-act-txt">{a.txt}</span>
            <span className="bn-act-time">{a.time}</span>
          </div>
        ))}
      </div>

      {/* ── Card footer ───────────────────────────── */}
      <div className="bn-card-ftr">
        <span className="bn-card-ftr-dot" />
        <span>{L.footer}</span>
      </div>

    </div>
  );
}

/* ---- Waitlist form ------------------------------------------------- */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormStatus = 'idle' | 'loading' | 'ok' | 'err';

function WaitlistForm({ lang, role }: { lang: Lang; role: Role }) {
  const c = COPY[lang].form;
  const [email, setEmail]   = useState('');
  const [wa, setWa]         = useState('');
  const [status, setStatus] = useState<FormStatus>('idle');
  const [msg, setMsg]       = useState('');

  const submit = async () => {
    if (!EMAIL_RE.test(email)) {
      setStatus('err');
      setMsg(c.errBad);
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, whatsapp: wa, role, lang }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? c.errFail);
      }
      setStatus('ok');
      setMsg(c.success);
      setEmail('');
      setWa('');
    } catch (error) {
      setStatus('err');
      setMsg(error instanceof Error ? error.message : c.errFail);
    }
  };

  if (status === 'ok') {
    return <p className="bn-form-ok">✓ {msg}</p>;
  }

  return (
    <div className="bn-form">
      {role && <span className="bn-role-tag">{c.asTag} {ROLE_LABEL[lang][role]}</span>}
      <div className="bn-form-fields">
        <input
          className="bn-input"
          type="email"
          inputMode="email"
          placeholder={c.email}
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          disabled={status === 'loading'}
        />
        <input
          className="bn-input"
          type="tel"
          inputMode="tel"
          placeholder={c.whatsapp}
          value={wa}
          onChange={e => setWa(e.target.value)}
          dir="ltr"
          disabled={status === 'loading'}
        />
        <button className="bn-btn" onClick={submit} disabled={status === 'loading'}>
          {status === 'loading' ? c.sending : c.cta}
        </button>
      </div>
      {status === 'err' && <p className="bn-form-err" role="alert">{msg}</p>}
    </div>
  );
}
