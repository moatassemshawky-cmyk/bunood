'use client';

import { useState, useEffect } from 'react';
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
      eyebrow: 'منصة مشتريات لقطاع المقاولات',
      title: ['وفّر في الوقت والتكلفة — ', 'عروض أسعار فورية من أفضل الموردين', '.'],
      sub: 'بنود منصة مشتريات تربط الموردين بالمقاولين. استقبل عروضًا تنافسية، قارن الأسعار، واختر الأفضل. التسعير الفوري بالذكاء الاصطناعي — قريبًا.',
      ctaPrimary: 'اطلب وصول مبكر',
      ctaSecondary: 'اختر دورك',
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
      eyebrow: 'Procurement platform for construction',
      title: ['Connect suppliers & contractors — ', 'get the best bids', '.'],
      sub: 'Bunood is a procurement system that connects suppliers and contractors. Get competitive bids, compare offers, and choose the best prices. Instant cost estimation with AI — coming soon.',
      ctaPrimary: 'Request early access',
      ctaSecondary: 'Choose your role',
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

/* ---- Demo bid data ---------------------------------------------- */
type BidRow = { id: string; arName: string; enName: string; price: number; days: number };

const BID_ROWS: BidRow[] = [
  { id: 'S1', arName: 'شركة عصام للحديد',  enName: 'Essam Steel Co.',   price: 4720, days: 3 },
  { id: 'S2', arName: 'دلتا للمواد',        enName: 'Delta Materials',   price: 4650, days: 2 },
  { id: 'S3', arName: 'القاهرة للمقاولات', enName: 'Cairo Contractors', price: 4890, days: 5 },
  { id: 'S4', arName: 'مصر للبناء',        enName: 'Misr Building Co.', price: 4780, days: 4 },
];
const BEST_BID_IDX = 1; // Delta Materials — lowest price

const formatNumber = (n: number) => n.toLocaleString('en-US');

/* ================================================================== */

export default function Home() {
  const [lang, setLang] = useState<Lang>('ar');
  const [role, setRole] = useState<Role>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const t = COPY[lang];

  /** Select a role and smoothly scroll to the waitlist form. */
  const pickRole = (r: RoleId) => {
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
              <a href="#waitlist" className="bn-btn">{t.hero.ctaPrimary}</a>
              <a href="#roles" className="bn-btn bn-btn-ghost">{t.hero.ctaSecondary}</a>
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

/* ---- Animated bid dashboard --------------------------------------- */
function Ledger({ lang }: { lang: Lang }) {
  const N = BID_ROWS.length;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { setStep(N + 3); return; }
    const id = setInterval(() => setStep(s => (s >= N + 9 ? 0 : s + 1)), 680);
    return () => clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const visibleBids = Math.min(step, N);
  const showBest    = step >= N + 1;
  const showSavings = step >= N + 2;

  const bestPrice  = BID_ROWS[BEST_BID_IDX].price;
  const worstPrice = Math.max(...BID_ROWS.map(r => r.price));
  const savings    = (worstPrice - bestPrice) * 24; // 24 tonnes

  const L = lang === 'ar'
    ? {
        file:       'لوحة-العروض.bunood',
        item:       'حديد تسليح B500S',
        spec:       '24 طن · تسليم 3 يوليو',
        supplier:   'المورد',
        priceUnit:  'سعر/طن',
        delivery:   'التسليم',
        days:       'ي',
        bestBadge:  'أفضل سعر',
        requesting: '...جاري طلب العروض',
        received:   (n: number) => `تم استلام ${n} عروض`,
        savingsLbl: 'توفير',
        currency:   'ج.م',
      }
    : {
        file:       'bid-dashboard.bunood',
        item:       'Steel Reinforcement B500S',
        spec:       '24 t · Due Jul 3',
        supplier:   'Supplier',
        priceUnit:  'Price/t',
        delivery:   'Del.',
        days:       'd',
        bestBadge:  'Best Price',
        requesting: 'Requesting bids…',
        received:   (n: number) => `${n} bids received`,
        savingsLbl: 'You save',
        currency:   'EGP',
      };

  return (
    <div className="bn-ledger" dir="ltr" aria-hidden>
      {/* Title bar */}
      <div className="bn-ledger-bar">
        <span className="bn-dot" /><span className="bn-dot" /><span className="bn-dot" />
        <span className="bn-ledger-name">{L.file}</span>
      </div>

      {/* Item header */}
      <div className="bn-bid-item">
        <div className="bn-bid-item-name">{L.item}</div>
        <div className="bn-bid-item-spec">{L.spec}</div>
        <div className={`bn-bid-status${visibleBids > 0 ? ' is-received' : ''}`}>
          {visibleBids === 0 ? L.requesting : L.received(visibleBids)}
        </div>
      </div>

      {/* Column headers */}
      <div className="bn-bid-head">
        <span className="bn-l-bsup">{L.supplier}</span>
        <span className="bn-l-bprice">{L.priceUnit}</span>
        <span className="bn-l-bdel">{L.delivery}</span>
      </div>

      {/* Bid rows */}
      {BID_ROWS.map((r, i) => {
        const isBest    = i === BEST_BID_IDX;
        const isVisible = i < visibleBids;
        const highlight = isBest && showBest;
        return (
          <div
            key={r.id}
            className={`bn-bid-row${isVisible ? ' is-visible' : ''}${highlight ? ' is-best' : ''}`}
          >
            <span className="bn-l-bsup">
              <span className="bn-sup-name">{lang === 'ar' ? r.arName : r.enName}</span>
              {highlight && <span className="bn-best-badge">{L.bestBadge}</span>}
            </span>
            <span className="bn-l-bprice bn-bamt">{isVisible ? formatNumber(r.price) : '—'}</span>
            <span className="bn-l-bdel">{isVisible ? `${r.days}${L.days}` : '—'}</span>
          </div>
        );
      })}

      {/* Savings footer */}
      <div className={`bn-bid-savings${showSavings ? ' is-visible' : ''}`}>
        <span>{L.savingsLbl}</span>
        <span className="bn-savings-val">{L.currency} {formatNumber(savings)}</span>
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
