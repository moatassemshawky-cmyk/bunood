'use client';

import { useState, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/* bunood — home page (Arabic-first, RTL)                              */
/* Procurement · Connect suppliers & contractors · AI estimation       */
/* Drop into: app/page.tsx                                             */
/* ------------------------------------------------------------------ */

type Lang = 'ar' | 'en';
type Role = 'engineer' | 'contractor' | 'supplier' | null;

const ROLE_LABEL: Record<Lang, Record<Exclude<Role, null>, string>> = {
  ar: { engineer: 'مهندس', contractor: 'مقاول', supplier: 'مورّد' },
  en: { engineer: 'Engineer', contractor: 'Contractor', supplier: 'Supplier' },
};

/* ---- copy ---------------------------------------------------------- */
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
      title: ['ربط الموردين بالمقاولين — ', 'احصل على أفضل العروض', '.'],
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
        { id: 'engineer' as const, t: 'مهندس / استشاري', d: 'سعّر المقايسات، راجع كل بند بدقة، وصدّر تقرير جاهز.' },
        { id: 'contractor' as const, t: 'مقاول', d: 'من المقايسة للتوريد — سعّر، قارن، وقدّم عروضك أسرع.' },
        { id: 'supplier' as const, t: 'مورّد', d: 'استقبل طلبات التوريد وابعت عروض أسعارك للمقاولين.' },
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
        { t: 'Auto-classified', d: 'Each line matches Bunood's library; AI fills the gaps and you confirm.' },
        { t: 'Priced live', d: 'Real Egyptian rates down to the neighbourhood, refreshed continuously.' },
        { t: 'Instant RFQ', d: 'Turn lines into procurement requests and send to suppliers on WhatsApp or email.' },
      ],
    },
    roles: {
      label: 'Choose your role',
      title: 'Bunood works the way you do.',
      sub: 'Each role has its own flow. Pick the one that fits and continue.',
      items: [
        { id: 'engineer' as const, t: 'Engineer / Consultant', d: 'Price BOQs, review every line precisely, export a ready report.' },
        { id: 'contractor' as const, t: 'Contractor', d: 'From BOQ to procurement — price, compare, and bid faster.' },
        { id: 'supplier' as const, t: 'Supplier', d: 'Receive RFQs and send your quotes back to contractors.' },
      ],
      cta: 'Start as',
    },
    feat: {
      label: 'Why bunood',
      items: [
        { t: 'The library is the moat', d: 'Every BOQ you run sharpens the next. The catalogue compounds — it doesn't reset.' },
        { t: 'One engine, many recipes', d: 'The cost maths never change; only materials and coefficients do. Consistent, auditable.' },
        { t: 'Pricing that knows Cairo', d: 'Rates shift street to street, not just by governorate. Bunood tracks that granularity.' },
        { t: 'Procurement without the headache', d: 'RFQs go out by WhatsApp and email; quotes come back sorted and ready to compare.' },
      ],
    },
    cta: {
      title: 'Be first to connect, price, and procure with Bunood.',
      sub: 'Join the early-access list. We'll reach out on WhatsApp when your seat is ready.',
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

/* ---- demo ledger data --------------------------------------------- */
type Row = { code: string; ar: string; en: string; unit: string; qty: number; rate: number };
const ROWS: Row[] = [
  { code: 'B07', ar: 'خرسانة مسلّحة — أعمدة', en: 'Reinforced concrete, columns', unit: 'm³', qty: 64, rate: 4850 },
  { code: 'B12', ar: 'مباني طوب، 20 سم', en: 'Brick blockwork, 20 cm', unit: 'm²', qty: 320, rate: 285 },
  { code: 'B19', ar: 'بياض محارة داخلي', en: 'Internal cement plaster', unit: 'm²', qty: 540, rate: 110 },
  { code: 'B23', ar: 'بلاط سيراميك أرضيات', en: 'Ceramic floor tiles', unit: 'm²', qty: 410, rate: 240 },
  { code: 'B41', ar: 'أسلاك نحاس، 3×2.5 مم²', en: 'Cu wiring, 3×2.5 mm²', unit: 'm.l', qty: 1200, rate: 64 },
];
const fmt = (n: number) => n.toLocaleString('en-US');

/* ================================================================== */

export default function Home() {
  const [lang, setLang] = useState<Lang>('ar');
  const [role, setRole] = useState<Role>(null);
  const t = COPY[lang];

  const pickRole = (r: Exclude<Role, null>) => {
    setRole(r);
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    document.getElementById('waitlist')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className="bn-root" dir={t.dir} lang={lang}>
      <GlobalStyle />

      {/* header */}
      <header className="bn-header">
        <div className="bn-wrap bn-header-in">
          <Logo />
          <nav className="bn-nav">
            <a href="#how" className="bn-navlink">{t.nav.whatWeDo}</a>
            <button className="bn-lang" onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')} aria-label="Switch language">
              {lang === 'ar' ? 'EN' : 'العربية'}
            </button>
            <a href="#waitlist" className="bn-btn bn-btn-ghost bn-btn-sm">{t.nav.signup}</a>
            <a href="#waitlist" className="bn-btn bn-btn-sm">{t.nav.login}</a>
          </nav>
        </div>
      </header>

      {/* hero */}
      <section className="bn-hero">
        <div className="bn-wrap bn-hero-grid">
          <div className="bn-hero-copy">
            <span className="bn-eyebrow">{t.hero.eyebrow}</span>
            <h1 className="bn-h1">
              {t.hero.title[0]}<span className="bn-accent">{t.hero.title[1]}</span>{t.hero.title[2]}
            </h1>
            <p className="bn-lede">{t.hero.sub}</p>
            <div className="bn-hero-cta">
              <a href="#waitlist" className="bn-btn">{t.hero.ctaPrimary}</a>
              <a href="#roles" className="bn-btn bn-btn-ghost">{t.hero.ctaSecondary}</a>
            </div>
          </div>
          <Ledger lang={lang} />
        </div>
      </section>

      {/* selling strip */}
      <div className="bn-strip">
        <div className="bn-wrap bn-strip-in">
          {t.strip.map((s, i) => (
            <span className="bn-strip-item" key={i}>{s}</span>
          ))}
        </div>
      </div>

      {/* how it works */}
      <section className="bn-section" id="how">
        <div className="bn-wrap">
          <span className="bn-label">{t.how.label}</span>
          <div className="bn-steps">
            {t.how.steps.map((s, i) => (
              <div className="bn-step" key={i}>
                <span className="bn-step-num">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="bn-step-t">{s.t}</h3>
                <p className="bn-step-d">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* roles */}
      <section className="bn-section bn-section-alt" id="roles">
        <div className="bn-wrap">
          <span className="bn-label">{t.roles.label}</span>
          <h2 className="bn-h2">{t.roles.title}</h2>
          <p className="bn-lede bn-roles-sub">{t.roles.sub}</p>
          <div className="bn-roles">
            {t.roles.items.map((r) => (
              <button
                key={r.id}
                className={`bn-role ${role === r.id ? 'is-on' : ''}`}
                onClick={() => pickRole(r.id)}
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

      {/* features */}
      <section className="bn-section">
        <div className="bn-wrap">
          <span className="bn-label">{t.feat.label}</span>
          <div className="bn-feats">
            {t.feat.items.map((f, i) => (
              <div className="bn-feat" key={i}>
                <h3 className="bn-feat-t">{f.t}</h3>
                <p className="bn-feat-d">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* waitlist */}
      <section className="bn-section bn-cta" id="waitlist">
        <div className="bn-wrap bn-cta-in">
          <h2 className="bn-h2">{t.cta.title}</h2>
          <p className="bn-lede bn-cta-sub">{t.cta.sub}</p>
          <WaitlistForm lang={lang} role={role} />
        </div>
      </section>

      {/* footer */}
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

/* ---- logo — matches brand sheet exactly ---------------------------- */
function Logo({ small }: { small?: boolean }) {
  const s = small ? 24 : 32;
  return (
    <span className="bn-logo" dir="ltr">
      <svg width={s} height={s} viewBox="0 0 96 96" fill="none" aria-hidden>
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

/* ---- role icons ---------------------------------------------------- */
function RoleIcon({ id }: { id: Exclude<Role, null> }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" className="bn-role-ic" aria-hidden>
      {id === 'engineer' && (<><path {...p} d="M5 19 L19 19 L5 5 Z" /><path {...p} d="M5 12 L12 12" /></>)}
      {id === 'contractor' && (<><path {...p} d="M3 18 H21" /><path {...p} d="M5 18 a7 7 0 0 1 14 0" /><path {...p} d="M11 5 h2 v3" /></>)}
      {id === 'supplier' && (<><path {...p} d="M4 8 L12 4 L20 8 V16 L12 20 L4 16 Z" /><path {...p} d="M4 8 L12 12 L20 8" /><path {...p} d="M12 12 V20" /></>)}
    </svg>
  );
}

/* ---- animated ledger ---------------------------------------------- */
function Ledger({ lang }: { lang: Lang }) {
  const N = ROWS.length;
  const [step, setStep] = useState(0);
  const head = lang === 'ar'
    ? { code: 'كود', item: 'البند', qty: 'كمية', rate: 'سعر', amount: 'إجمالي', total: 'إجمالي التقدير', file: 'مقايسة-المشروع.xlsx' }
    : { code: 'Code', item: 'Item', qty: 'Qty', rate: 'Rate', amount: 'Amount', total: 'Total estimate', file: 'project-boq.xlsx' };

  useEffect(() => {
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { setStep(2 * N); return; }
    const id = setInterval(() => setStep((s) => (s >= 2 * N + 6 ? 0 : s + 1)), 560);
    return () => clearInterval(id);
  }, [N]);

  const classified = Math.min(step, N);
  const priced = Math.min(Math.max(step - N, 0), N);
  const total = ROWS.slice(0, priced).reduce((a, r) => a + r.qty * r.rate, 0);

  return (
    <div className="bn-ledger" dir="ltr" aria-hidden>
      <div className="bn-ledger-bar">
        <span className="bn-dot" /><span className="bn-dot" /><span className="bn-dot" />
        <span className="bn-ledger-name">{head.file}</span>
      </div>
      <div className="bn-ledger-head">
        <span>{head.code}</span><span className="bn-l-desc">{head.item}</span>
        <span className="bn-l-num">{head.qty}</span><span className="bn-l-num">{head.rate}</span><span className="bn-l-num">{head.amount}</span>
      </div>
      {ROWS.map((r, i) => {
        const isC = i < classified, isP = i < priced;
        return (
          <div className={`bn-row ${isC ? 'is-c' : ''} ${isP ? 'is-p' : ''}`} key={r.code}>
            <span className="bn-code">{isC ? r.code : <span className="bn-pending">—</span>}</span>
            <span className="bn-l-desc">{lang === 'ar' ? r.ar : r.en}</span>
            <span className="bn-l-num">{r.qty} {r.unit}</span>
            <span className="bn-l-num">{isP ? fmt(r.rate) : <span className="bn-pending">—</span>}</span>
            <span className="bn-l-num bn-amt">{isP ? fmt(r.qty * r.rate) : <span className="bn-pending">—</span>}</span>
          </div>
        );
      })}
      <div className="bn-ledger-total">
        <span>{head.total}</span>
        <span className="bn-total-val">EGP {fmt(total)}</span>
      </div>
    </div>
  );
}

/* ---- waitlist form ------------------------------------------------- */
function WaitlistForm({ lang, role }: { lang: Lang; role: Role }) {
  const c = COPY[lang].form;
  const [email, setEmail] = useState('');
  const [wa, setWa] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (!/^[^\s@]+@[^^\s@]+\.[^\s@]+$/.test(email)) { setStatus('err'); setMsg(c.errBad); return; }
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, whatsapp: wa, role, lang }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || c.errFail);
      }
      setStatus('ok'); setMsg(c.success); setEmail(''); setWa('');
    } catch (error) {
      setStatus('err');
      setMsg(error instanceof Error ? error.message : c.errFail);
    }
  };

  if (status === 'ok') return <p className="bn-form-ok">✓ {msg}</p>;

  return (
    <div className="bn-form">
      {role && <span className="bn-role-tag">{c.asTag} {ROLE_LABEL[lang][role]}</span>}
      <div className="bn-form-fields">
        <input className="bn-input" type="email" inputMode="email" placeholder={c.email}
          value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        <input className="bn-input" type="tel" inputMode="tel" placeholder={c.whatsapp}
          value={wa} onChange={(e) => setWa(e.target.value)} dir="ltr" />
        <button className="bn-btn" onClick={submit} disabled={status === 'loading'}>
          {status === 'loading' ? c.sending : c.cta}
        </button>
      </div>
      {status === 'err' && <p className="bn-form-err">{msg}</p>}
    </div>
  );
}

/* ---- styles -------------------------------------------------------- */
function GlobalStyle() {
  return (
    <style dangerouslySetInnerHTML={{ __html: `
@import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.bn-root{
  --blue:#2F6FE0;--graphite:#2C313A;--grey:#9AA3AE;--mist:#F3F5F7;
  --line:#E4E8ED;--blue-soft:rgba(47,111,224,.07);
  --display:'Readex Pro',system-ui,sans-serif;
  --body:'IBM Plex Sans Arabic','Readex Pro',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,monospace;
  color:var(--graphite);background:#fff;font-family:var(--body);line-height:1.65;-webkit-font-smoothing:antialiased;
}
.bn-root *{box-sizing:border-box;}
.bn-wrap{max-width:1120px;margin:0 auto;padding:0 24px;}
.bn-accent{color:var(--blue);}

.bn-header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.86);
  backdrop-filter:saturate(160%) blur(10px);border-bottom:1px solid var(--line);}
.bn-header-in{display:flex;align-items:center;justify-content:space-between;height:66px;}
.bn-logo{display:inline-flex;align-items:center;gap:10px;}
.bn-word{font-family:var(--display);font-weight:600;font-size:22px;letter-spacing:-.01em;color:var(--graphite);}
.bn-nav{display:flex;align-items:center;gap:12px;}
.bn-navlink{font-family:var(--display);font-weight:500;font-size:14.5px;color:var(--graphite);text-decoration:none;}
.bn-navlink:hover{color:var(--blue);}
.bn-lang{background:none;border:none;cursor:pointer;font-family:var(--display);font-weight:500;font-size:14px;color:var(--graphite);padding:6px;}
.bn-lang:hover{color:var(--blue);}

.bn-btn{font-family:var(--display);font-weight:600;font-size:15px;color:#fff;background:var(--blue);
  border:none;border-radius:10px;padding:13px 24px;cursor:pointer;text-decoration:none;display:inline-block;
  transition:transform .12s ease,background .15s ease;white-space:nowrap;}
.bn-btn:hover{background:#2660cf;transform:translateY(-1px);}
.bn-btn:active{transform:translateY(0);}
.bn-btn:disabled{opacity:.6;cursor:default;transform:none;}
.bn-btn-sm{padding:9px 17px;font-size:14px;border-radius:9px;}
.bn-btn-ghost{background:transparent;color:var(--blue);border:1.5px solid var(--line);}
.bn-btn-ghost:hover{background:var(--blue-soft);border-color:var(--blue);}

.bn-hero{position:relative;padding:84px 0 72px;background:#2C313A;overflow:hidden;}
.bn-hero::before{content:'';position:absolute;inset:0;z-index:0;
  background-image:linear-gradient(125deg,rgba(20,23,28,.92),rgba(20,23,28,.56)),url('/hero-bg.jpg');
  background-size:cover;background-position:center;}
.bn-hero .bn-wrap{position:relative;z-index:1;max-width:1320px;}
.bn-hero-grid{display:grid;grid-template-columns:0.88fr 1.08fr;gap:40px;align-items:center;}
.bn-hero-copy{animation:bn-rise .7s cubic-bezier(.2,.7,.2,1) both;}
.bn-eyebrow{display:inline-block;font-family:var(--mono);font-size:12.5px;letter-spacing:.04em;
  color:var(--blue);background:var(--blue-soft);padding:6px 12px;border-radius:6px;margin-bottom:22px;}
.bn-h1{font-family:var(--display);font-weight:700;font-size:clamp(32px,4.5vw,52px);line-height:1.18;
  letter-spacing:-.01em;margin:0 0 20px;color:#fff;}
.bn-lede{font-size:18px;color:#4a525e;max-width:33em;margin:0 0 28px;}
.bn-hero .bn-lede{color:#d6dbe1;}
.bn-hero .bn-eyebrow{background:rgba(47,111,224,.22);color:#bcd2f7;}
.bn-hero-cta{display:flex;gap:12px;flex-wrap:wrap;}
.bn-hero .bn-btn-ghost{border-color:rgba(255,255,255,.32);color:#fff;background:transparent;}
.bn-hero .bn-btn-ghost:hover{background:rgba(255,255,255,.09);border-color:rgba(255,255,255,.6);}

.bn-strip{background:var(--graphite);}
.bn-strip-in{display:flex;flex-wrap:wrap;gap:14px 40px;justify-content:center;padding:18px 24px;}
.bn-strip-item{font-family:var(--display);font-weight:500;font-size:15px;color:#e7eaee;position:relative;}
.bn-strip-item::before{content:'';display:inline-block;width:7px;height:7px;border-radius:2px;
  background:var(--blue);margin-inline-end:10px;vertical-align:middle;}

.bn-section{padding:84px 0;}
.bn-section-alt{background:var(--mist);}
.bn-label{display:block;font-family:var(--mono);font-size:12.5px;letter-spacing:.05em;
  color:var(--grey);margin-bottom:18px;}
.bn-h2{font-family:var(--display);font-weight:700;font-size:clamp(26px,3.3vw,38px);letter-spacing:-.01em;margin:0 0 14px;}

.bn-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:30px;margin-top:18px;}
.bn-step-num{font-family:var(--mono);font-size:14px;color:var(--blue);font-weight:600;display:block;
  width:38px;border-top:2px solid var(--blue);padding-top:14px;margin-bottom:12px;}
.bn-step-t{font-family:var(--display);font-weight:600;font-size:18.5px;margin:0 0 8px;}
.bn-step-d{font-size:15px;color:#5a626e;margin:0;}

.bn-roles-sub{margin-bottom:30px;}
.bn-roles{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;}
.bn-role{text-align:inherit;background:#fff;border:1.5px solid var(--line);border-radius:16px;padding:28px;
  cursor:pointer;font-family:var(--body);color:var(--graphite);
  transition:transform .15s ease,border-color .15s ease,box-shadow .15s ease;}
.bn-role:hover{transform:translateY(-3px);border-color:var(--blue);box-shadow:0 16px 40px -22px rgba(47,111,224,.5);}
.bn-role.is-on{border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-soft);}
.bn-role-ic{color:var(--blue);margin-bottom:14px;display:block;}
.bn-role-t{font-family:var(--display);font-weight:600;font-size:20px;margin:0 0 8px;}
.bn-role-d{font-size:15px;color:#5a626e;margin:0 0 16px;}
.bn-role-cta{font-family:var(--display);font-weight:600;font-size:14.5px;color:var(--blue);}

.bn-feats{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:18px;}
.bn-feat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px;
  transition:transform .15s ease,box-shadow .15s ease;}
.bn-feat:hover{transform:translateY(-2px);box-shadow:0 14px 36px -22px rgba(44,49,58,.4);}
.bn-feat-t{font-family:var(--display);font-weight:600;font-size:19px;margin:0 0 9px;}
.bn-feat-t::before{content:'';display:inline-block;width:8px;height:8px;border-radius:2px;
  background:var(--blue);margin-inline-end:9px;vertical-align:middle;}
.bn-feat-d{font-size:15px;color:#5a626e;margin:0;}

.bn-ledger{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;
  box-shadow:0 18px 50px -24px rgba(44,49,58,.35);font-family:var(--mono);
  animation:bn-rise .8s cubic-bezier(.2,.7,.2,1) .08s both;}
.bn-ledger-bar{display:flex;align-items:center;gap:7px;padding:11px 16px;background:var(--mist);border-bottom:1px solid var(--line);}
.bn-dot{width:9px;height:9px;border-radius:50%;background:#d4d9df;}
.bn-ledger-name{margin-left:8px;font-size:12px;color:var(--grey);}
.bn-ledger-head,.bn-row,.bn-ledger-total{display:grid;grid-template-columns:46px 1fr 60px 70px 92px;gap:10px;align-items:center;padding:0 18px;}
.bn-ledger-head{height:42px;font-size:11px;letter-spacing:.02em;font-weight:500;color:#6b7480;background:#fafbfc;border-bottom:1px solid var(--line);}
.bn-ledger-head span{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.bn-row{height:46px;font-size:12.5px;border-bottom:1px solid #f0f2f5;transition:background .3s ease;}
.bn-row.is-c{background:var(--blue-soft);}
.bn-row.is-p{background:#fff;}
.bn-l-desc{font-family:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--graphite);}
.bn-l-num{text-align:right;color:#5a626e;font-variant-numeric:tabular-nums;white-space:nowrap;}
.bn-pending{color:#c4ccd4;}
.bn-code{font-weight:600;color:var(--grey);font-size:12px;}
.bn-row.is-c .bn-code{color:#fff;background:var(--blue);border-radius:5px;padding:3px 6px;justify-self:start;font-size:11px;animation:bn-pop .35s ease both;}
.bn-amt{color:var(--graphite);font-weight:500;}
.bn-row.is-p .bn-amt{color:var(--blue);}
.bn-ledger-total{height:54px;background:var(--graphite);color:#fff;font-family:var(--display);}
.bn-ledger-total>span:first-child{grid-column:1 / 4;font-size:13px;color:#c7ccd3;}
.bn-total-val{grid-column:4 / 6;text-align:right;font-family:var(--mono);font-weight:600;font-size:16px;color:#fff;font-variant-numeric:tabular-nums;}

.bn-cta{background:var(--graphite);color:#fff;text-align:center;}
.bn-cta-in{max-width:640px;}
.bn-cta .bn-h2{color:#fff;}
.bn-cta-sub{color:#c7ccd3;margin-inline:auto;}
.bn-form{margin-top:28px;}
.bn-role-tag{display:inline-block;font-family:var(--mono);font-size:12.5px;color:var(--blue);
  background:rgba(47,111,224,.16);padding:6px 12px;border-radius:6px;margin-bottom:14px;}
.bn-form-fields{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:580px;margin-inline:auto;}
.bn-input{flex:1 1 200px;min-width:0;font-family:var(--body);font-size:15px;padding:13px 15px;border:1px solid #454c57;
  border-radius:10px;background:#373d47;color:#fff;transition:border-color .15s ease,box-shadow .15s ease;}
.bn-input::placeholder{color:#8b93a0;}
.bn-input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px rgba(47,111,224,.25);}
.bn-form-err{color:#ff9b8a;font-size:14px;margin:10px 2px 0;}
.bn-form-ok{font-family:var(--display);font-weight:500;font-size:16px;color:#fff;
  background:rgba(47,111,224,.2);padding:14px 18px;border-radius:10px;display:inline-block;margin-top:28px;}

.bn-footer{border-top:1px solid var(--line);padding:30px 0;}
.bn-footer-in{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
.bn-foot-tag{font-size:14px;color:#5a626e;}
.bn-foot-rights{font-family:var(--mono);font-size:12px;color:var(--grey);margin-inline-start:auto;}

@keyframes bn-rise{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
@keyframes bn-pop{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
@media (prefers-reduced-motion:reduce){
  .bn-hero-copy,.bn-ledger{animation:none;}
  .bn-btn,.bn-feat,.bn-role{transition:none;}
}
@media (max-width:900px){
  .bn-hero-grid{grid-template-columns:1fr;gap:40px;}
  .bn-steps{grid-template-columns:repeat(2,1fr);gap:26px;}
  .bn-roles{grid-template-columns:1fr;}
  .bn-feats{grid-template-columns:1fr;}
  .bn-hero{padding:48px 0 52px;}
  .bn-section{padding:60px 0;}
}
@media (max-width:520px){
  .bn-steps{grid-template-columns:1fr;}
  .bn-nav{gap:8px;}
  .bn-navlink{display:none;}
}
`}} />
  );
}
