'use client';

import { useState, useEffect } from 'react';

/* ------------------------------------------------------------------ */
/*  Bunood — home page                                                 */
/*  Drop into: app/page.tsx                                            */
/* ------------------------------------------------------------------ */

type Lang = 'en' | 'ar';

/* ---- copy ---------------------------------------------------------- */
const COPY = {
  en: {
    dir: 'ltr' as const,
    nav: { waitlist: 'Join the waitlist' },
    hero: {
      eyebrow: 'BOQ estimating for Egyptian contractors',
      title: ['Price a Bill of Quantities in ', 'minutes', ', not weeks.'],
      sub: 'Bunood reads your BOQ, classifies every line, and prices it from live Egyptian market rates — neighbourhood by neighbourhood.',
    },
    form: {
      email: 'you@company.com',
      whatsapp: 'WhatsApp number (optional)',
      cta: 'Request early access',
      sending: 'Sending…',
      success: "You're on the list. We'll reach out soon.",
      errBad: 'Enter a valid email address.',
      errFail: 'Something went wrong. Try again.',
    },
    how: {
      label: 'How it works',
      steps: [
        { t: 'Upload your BOQ', d: 'PDF, Excel, or a phone scan of a printed sheet. Bunood reads all three.' },
        { t: 'Every line gets classified', d: 'Each item is matched to Bunood’s library. AI fills the gaps, you confirm — and your confirmation teaches the library.' },
        { t: 'Priced from the market', d: 'Real Egyptian rates down to the neighbourhood, refreshed continuously — including volatile copper-linked wiring.' },
      ],
    },
    feat: {
      label: 'Why it holds up',
      items: [
        { t: 'The library is the moat', d: 'Every BOQ you run sharpens classification for the next one. The catalogue compounds — it doesn’t reset.' },
        { t: 'One engine, many recipes', d: 'The cost maths never change. Only the materials and coefficients differ per item, so results stay consistent and auditable.' },
        { t: 'Pricing that knows Cairo', d: 'Rates shift street to street, not just by governorate. Bunood tracks that granularity instead of averaging it away.' },
        { t: 'AI that asks before it answers', d: 'Rules match first, AI suggests for the uncertain, a human confirms. Nothing is auto-published behind your back.' },
      ],
    },
    cta: {
      title: 'Be first to price with Bunood.',
      sub: 'Join the early-access list. We’ll reach out on WhatsApp when your seat is ready.',
    },
    footer: { tag: 'Built for Egyptian contractors.', rights: 'All rights reserved.' },
  },
  ar: {
    dir: 'rtl' as const,
    nav: { waitlist: 'انضم لقائمة الانتظار' },
    hero: {
      eyebrow: 'تسعير المقايسات لمقاولي مصر',
      title: ['سعّر مقايسة الكميات في ', 'دقائق', '، مش أسابيع.'],
      sub: 'بنود بيقرأ المقايسة، يصنّف كل بند، ويسعّره من أسعار السوق المصري لحظة بلحظة — حيّ ورا حيّ.',
    },
    form: {
      email: 'بريدك الإلكتروني',
      whatsapp: 'رقم واتساب (اختياري)',
      cta: 'اطلب وصولًا مبكرًا',
      sending: 'جاري الإرسال…',
      success: 'تمام، اسمك في القائمة. هنتواصل معاك قريب.',
      errBad: 'اكتب بريد إلكتروني صحيح.',
      errFail: 'حصل خطأ. جرّب تاني.',
    },
    how: {
      label: 'إزاي بيشتغل',
      steps: [
        { t: 'ارفع المقايسة', d: 'PDF أو Excel أو صورة من ورقة مطبوعة. بنود بيقرأ الاتنين والتلاتة.' },
        { t: 'كل بند بيتصنّف', d: 'كل بند بيتطابق مع مكتبة بنود. الذكاء الاصطناعي يكمّل الناقص، وانت بتأكّد — وتأكيدك بيعلّم المكتبة.' },
        { t: 'تسعير من السوق', d: 'أسعار مصرية على مستوى الحي، بتتحدّث باستمرار — حتى أسعار الأسلاك المرتبطة بالنحاس المتقلّبة.' },
      ],
    },
    feat: {
      label: 'ليه بيكمّل',
      items: [
        { t: 'المكتبة هي الحصن', d: 'كل مقايسة بتشغّلها بتخلّي التصنيف أدقّ للي بعدها. الكتالوج بيتراكم — مبيرجعش من الأول.' },
        { t: 'محرّك واحد، وصفات كتير', d: 'معادلات التكلفة ثابتة. بيتغيّر بس الخامات والمعاملات لكل بند، فالنتائج ثابتة وقابلة للمراجعة.' },
        { t: 'تسعير عارف القاهرة', d: 'الأسعار بتفرق من شارع لشارع، مش بس من محافظة لمحافظة. بنود بيتابع التفصيلة دي بدل ما يحسب متوسط.' },
        { t: 'ذكاء بيسأل قبل ما يجاوب', d: 'القواعد بتطابق الأول، الذكاء بيقترح للمبهم، والإنسان بيأكّد. مفيش حاجة بتتنشر من ورا ظهرك.' },
      ],
    },
    cta: {
      title: 'كن أول من يسعّر مع بنود.',
      sub: 'انضم لقائمة الوصول المبكر. هنتواصل معاك على واتساب أول ما مكانك يجهز.',
    },
    footer: { tag: 'مصمّم لمقاولي مصر.', rights: 'كل الحقوق محفوظة.' },
  },
} as const;

/* ---- demo ledger data --------------------------------------------- */
type Row = { code: string; en: string; ar: string; unit: string; qty: number; rate: number };
const ROWS: Row[] = [
  { code: 'B07', en: 'Reinforced concrete, columns', ar: 'خرسانة مسلّحة — أعمدة', unit: 'm³', qty: 64, rate: 4850 },
  { code: 'B12', en: 'Brick blockwork, 20 cm', ar: 'مباني طوب، 20 سم', unit: 'm²', qty: 320, rate: 285 },
  { code: 'B19', en: 'Internal cement plaster', ar: 'بياض محارة داخلي', unit: 'm²', qty: 540, rate: 110 },
  { code: 'B23', en: 'Ceramic floor tiles', ar: 'بلاط سيراميك أرضيات', unit: 'm²', qty: 410, rate: 240 },
  { code: 'B41', en: 'Cu wiring, 3×2.5 mm²', ar: 'أسلاك نحاس، 3×2.5 مم²', unit: 'm.l', qty: 1200, rate: 64 },
];

const fmt = (n: number) => n.toLocaleString('en-US');

/* ================================================================== */

export default function Home() {
  const [lang, setLang] = useState<Lang>('en');
  const t = COPY[lang];

  return (
    <div className="bn-root" dir={t.dir} lang={lang}>
      <GlobalStyle />

      {/* ---- header ---- */}
      <header className="bn-header">
        <div className="bn-wrap bn-header-in">
          <Logo />
          <nav className="bn-nav">
            <button
              className="bn-lang"
              onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
              aria-label="Switch language"
            >
              {lang === 'en' ? 'العربية' : 'EN'}
            </button>
            <a href="#waitlist" className="bn-btn bn-btn-sm">{t.nav.waitlist}</a>
          </nav>
        </div>
      </header>

      {/* ---- hero ---- */}
      <section className="bn-hero">
        <div className="bn-wrap bn-hero-grid">
          <div className="bn-hero-copy">
            <span className="bn-eyebrow">{t.hero.eyebrow}</span>
            <h1 className="bn-h1">
              {t.hero.title[0]}
              <span className="bn-accent">{t.hero.title[1]}</span>
              {t.hero.title[2]}
            </h1>
            <p className="bn-lede">{t.hero.sub}</p>
            <WaitlistForm lang={lang} compact />
          </div>
          <Ledger lang={lang} />
        </div>
      </section>

      {/* ---- how it works ---- */}
      <section className="bn-section">
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

      {/* ---- features ---- */}
      <section className="bn-section bn-section-alt">
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

      {/* ---- waitlist CTA ---- */}
      <section className="bn-section bn-cta" id="waitlist">
        <div className="bn-wrap bn-cta-in">
          <h2 className="bn-h2">{t.cta.title}</h2>
          <p className="bn-lede bn-cta-sub">{t.cta.sub}</p>
          <WaitlistForm lang={lang} whatsapp />
        </div>
      </section>

      {/* ---- footer ---- */}
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

/* ---- logo ---------------------------------------------------------- */
function Logo({ small }: { small?: boolean }) {
  return (
    <span className="bn-logo" dir="ltr">
      <svg className="bn-mark" viewBox="0 0 32 32" width={small ? 22 : 26} height={small ? 22 : 26} aria-hidden>
        {/* corner brackets */}
        <path d="M3 9 V3 H9" />
        <path d="M23 3 H29 V9" />
        <path d="M29 23 V29 H23" />
        <path d="M9 29 H3 V23" />
        {/* three rows, middle highlighted */}
        <line x1="10" y1="11.5" x2="22" y2="11.5" className="bn-mark-row" />
        <line x1="10" y1="16" x2="22" y2="16" className="bn-mark-row bn-mark-row-on" />
        <line x1="10" y1="20.5" x2="22" y2="20.5" className="bn-mark-row" />
      </svg>
      <span className="bn-word">b<span className="bn-accent">oo</span>nood</span>
    </span>
  );
}

/* ---- animated ledger ---------------------------------------------- */
function Ledger({ lang }: { lang: Lang }) {
  const N = ROWS.length;
  const [step, setStep] = useState(0);

  useEffect(() => {
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setStep(2 * N); // jump to fully priced
      return;
    }
    const id = setInterval(() => {
      setStep((s) => (s >= 2 * N + 6 ? 0 : s + 1));
    }, 560);
    return () => clearInterval(id);
  }, [N]);

  const classified = Math.min(step, N);
  const priced = Math.min(Math.max(step - N, 0), N);
  const total = ROWS.slice(0, priced).reduce((a, r) => a + r.qty * r.rate, 0);

  return (
    <div className="bn-ledger" dir="ltr" aria-hidden>
      <div className="bn-ledger-bar">
        <span className="bn-dot" /><span className="bn-dot" /><span className="bn-dot" />
        <span className="bn-ledger-name">project-boq.xlsx</span>
      </div>
      <div className="bn-ledger-head">
        <span>Code</span><span className="bn-l-desc">Item</span>
        <span className="bn-l-num">Qty</span><span className="bn-l-num">Rate</span>
        <span className="bn-l-num">Amount</span>
      </div>
      {ROWS.map((r, i) => {
        const isC = i < classified;
        const isP = i < priced;
        return (
          <div className={`bn-row ${isC ? 'is-c' : ''} ${isP ? 'is-p' : ''}`} key={r.code}>
            <span className="bn-code">{isC ? r.code : <i className="bn-sk bn-sk-code" />}</span>
            <span className="bn-l-desc">{lang === 'ar' ? r.ar : r.en}</span>
            <span className="bn-l-num">{r.qty} {r.unit}</span>
            <span className="bn-l-num">{isP ? fmt(r.rate) : <i className="bn-sk" />}</span>
            <span className="bn-l-num bn-amt">{isP ? fmt(r.qty * r.rate) : <i className="bn-sk" />}</span>
          </div>
        );
      })}
      <div className="bn-ledger-total">
        <span>Total estimate</span>
        <span className="bn-total-val">EGP {fmt(total)}</span>
      </div>
    </div>
  );
}

/* ---- waitlist form ------------------------------------------------- */
function WaitlistForm({
  lang,
  compact,
  whatsapp,
}: {
  lang: Lang;
  compact?: boolean;
  whatsapp?: boolean;
}) {
  const c = COPY[lang].form;
  const [email, setEmail] = useState('');
  const [wa, setWa] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');
  const [msg, setMsg] = useState('');

  const submit = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('err');
      setMsg(c.errBad);
      return;
    }
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, whatsapp: wa, lang }),
      });
      if (!res.ok) throw new Error();
      setStatus('ok');
      setMsg(c.success);
      setEmail('');
      setWa('');
    } catch {
      setStatus('err');
      setMsg(c.errFail);
    }
  };

  if (status === 'ok') {
    return <p className="bn-form-ok">✓ {msg}</p>;
  }

  return (
    <div className={`bn-form ${compact ? 'is-compact' : ''}`}>
      <div className="bn-form-fields">
        <input
          className="bn-input"
          type="email"
          inputMode="email"
          placeholder={c.email}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
        {whatsapp && (
          <input
            className="bn-input"
            type="tel"
            inputMode="tel"
            placeholder={c.whatsapp}
            value={wa}
            onChange={(e) => setWa(e.target.value)}
            dir="ltr"
          />
        )}
        <button className="bn-btn" onClick={submit} disabled={status === 'loading'}>
          {status === 'loading' ? c.sending : c.cta}
        </button>
      </div>
      {status === 'err' && <p className="bn-form-err">{msg}</p>}
    </div>
  );
}

/* ---- styles (self-contained; move fonts to next/font for prod) ----- */
function GlobalStyle() {
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
@import url('https://fonts.googleapis.com/css2?family=Readex+Pro:wght@300;400;500;600;700&family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.bn-root{
  --blue:#2F6FE0; --graphite:#2C313A; --grey:#9AA3AE; --mist:#F3F5F7;
  --line:#E4E8ED; --white:#fff; --blue-soft:rgba(47,111,224,.07);
  --display:'Readex Pro',system-ui,sans-serif;
  --body:'IBM Plex Sans Arabic','Readex Pro',system-ui,sans-serif;
  --mono:'IBM Plex Mono',ui-monospace,monospace;
  color:var(--graphite); background:var(--white);
  font-family:var(--body); line-height:1.6; -webkit-font-smoothing:antialiased;
}
.bn-root *{box-sizing:border-box;}
.bn-root [dir="rtl"]{font-family:'IBM Plex Sans Arabic',sans-serif;}
.bn-wrap{max-width:1120px;margin:0 auto;padding:0 24px;}
.bn-accent{color:var(--blue);}

/* header */
.bn-header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.86);
  backdrop-filter:saturate(160%) blur(10px);border-bottom:1px solid var(--line);}
.bn-header-in{display:flex;align-items:center;justify-content:space-between;height:64px;}
.bn-logo{display:inline-flex;align-items:center;gap:9px;}
.bn-mark{flex:none;}
.bn-mark path{fill:none;stroke:var(--graphite);stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;}
.bn-mark-row{stroke:var(--grey);stroke-width:2.4;stroke-linecap:round;}
.bn-mark-row-on{stroke:var(--blue);}
.bn-word{font-family:var(--display);font-weight:600;font-size:21px;letter-spacing:-.01em;}
.bn-nav{display:flex;align-items:center;gap:14px;}
.bn-lang{background:none;border:none;cursor:pointer;font-family:var(--display);
  font-weight:500;font-size:14px;color:var(--graphite);padding:6px;}
.bn-lang:hover{color:var(--blue);}

/* buttons */
.bn-btn{font-family:var(--display);font-weight:600;font-size:15px;color:#fff;
  background:var(--blue);border:none;border-radius:10px;padding:13px 22px;cursor:pointer;
  transition:transform .12s ease,background .15s ease;white-space:nowrap;}
.bn-btn:hover{background:#2660cf;transform:translateY(-1px);}
.bn-btn:active{transform:translateY(0);}
.bn-btn:disabled{opacity:.6;cursor:default;transform:none;}
.bn-btn-sm{padding:9px 16px;font-size:14px;border-radius:9px;}

/* hero */
.bn-hero{padding:72px 0 84px;}
.bn-hero-grid{display:grid;grid-template-columns:1fr 1.02fr;gap:56px;align-items:center;}
.bn-hero-copy{animation:bn-rise .7s cubic-bezier(.2,.7,.2,1) both;}
.bn-eyebrow{display:inline-block;font-family:var(--mono);font-size:12.5px;letter-spacing:.06em;
  text-transform:uppercase;color:var(--blue);background:var(--blue-soft);
  padding:6px 11px;border-radius:6px;margin-bottom:22px;}
.bn-h1{font-family:var(--display);font-weight:700;font-size:clamp(34px,4.6vw,54px);
  line-height:1.08;letter-spacing:-.02em;margin:0 0 20px;}
.bn-lede{font-size:18px;color:#4a525e;max-width:30em;margin:0 0 30px;}

/* form */
.bn-form-fields{display:flex;flex-wrap:wrap;gap:10px;}
.bn-form.is-compact .bn-form-fields{max-width:480px;}
.bn-input{flex:1 1 200px;min-width:0;font-family:var(--body);font-size:15px;
  padding:13px 15px;border:1px solid var(--line);border-radius:10px;background:#fff;
  color:var(--graphite);transition:border-color .15s ease,box-shadow .15s ease;}
.bn-input:focus{outline:none;border-color:var(--blue);box-shadow:0 0 0 3px var(--blue-soft);}
.bn-input::placeholder{color:var(--grey);}
.bn-form-err{color:#c0392b;font-size:14px;margin:10px 2px 0;}
.bn-form-ok{font-family:var(--display);font-weight:500;font-size:16px;color:var(--blue);
  background:var(--blue-soft);padding:14px 18px;border-radius:10px;display:inline-block;}

/* ledger */
.bn-ledger{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden;
  box-shadow:0 18px 50px -24px rgba(44,49,58,.35);font-family:var(--mono);
  animation:bn-rise .8s cubic-bezier(.2,.7,.2,1) .08s both;}
.bn-ledger-bar{display:flex;align-items:center;gap:7px;padding:11px 16px;
  background:var(--mist);border-bottom:1px solid var(--line);}
.bn-dot{width:9px;height:9px;border-radius:50%;background:#d4d9df;}
.bn-ledger-name{margin-left:8px;font-size:12px;color:var(--grey);}
.bn-ledger-head,.bn-row,.bn-ledger-total{display:grid;
  grid-template-columns:52px 1fr 64px 60px 78px;gap:8px;align-items:center;
  padding:0 16px;}
.bn-ledger-head{height:38px;font-size:11px;letter-spacing:.04em;text-transform:uppercase;
  color:var(--grey);border-bottom:1px solid var(--line);}
.bn-row{height:46px;font-size:12.5px;border-bottom:1px solid #f0f2f5;
  transition:background .3s ease;}
.bn-row.is-c{background:var(--blue-soft);}
.bn-row.is-p{background:#fff;}
.bn-l-desc{font-family:var(--body);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  color:var(--graphite);}
.bn-l-num{text-align:right;color:#5a626e;font-variant-numeric:tabular-nums;}
.bn-code{font-weight:600;color:var(--grey);font-size:12px;}
.bn-row.is-c .bn-code{color:#fff;background:var(--blue);border-radius:5px;
  padding:3px 6px;justify-self:start;font-size:11px;animation:bn-pop .35s ease both;}
.bn-amt{color:var(--graphite);font-weight:500;}
.bn-row.is-p .bn-amt{color:var(--blue);}
.bn-sk{display:inline-block;width:46px;height:9px;border-radius:4px;
  background:linear-gradient(90deg,#eef0f3,#e2e6ea,#eef0f3);background-size:200% 100%;
  animation:bn-shimmer 1.3s linear infinite;}
.bn-sk-code{width:30px;}
.bn-ledger-total{height:54px;background:var(--graphite);color:#fff;font-family:var(--display);}
.bn-ledger-total>span:first-child{grid-column:1 / 4;font-size:13px;color:#c7ccd3;}
.bn-total-val{grid-column:4 / 6;text-align:right;font-family:var(--mono);font-weight:600;
  font-size:16px;color:#fff;font-variant-numeric:tabular-nums;}

/* sections */
.bn-section{padding:84px 0;}
.bn-section-alt{background:var(--mist);}
.bn-label{display:block;font-family:var(--mono);font-size:12.5px;letter-spacing:.07em;
  text-transform:uppercase;color:var(--grey);margin-bottom:34px;}
.bn-h2{font-family:var(--display);font-weight:700;font-size:clamp(28px,3.4vw,40px);
  letter-spacing:-.02em;margin:0 0 16px;}

/* steps */
.bn-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:34px;}
.bn-step-num{font-family:var(--mono);font-size:14px;color:var(--blue);font-weight:600;
  display:block;padding-bottom:14px;border-top:2px solid var(--blue);
  width:36px;margin-bottom:12px;padding-top:14px;}
.bn-step-t{font-family:var(--display);font-weight:600;font-size:20px;margin:0 0 8px;}
.bn-step-d{font-size:15.5px;color:#5a626e;margin:0;}

/* features */
.bn-feats{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;}
.bn-feat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px;
  transition:transform .15s ease,box-shadow .15s ease;}
.bn-feat:hover{transform:translateY(-2px);box-shadow:0 14px 36px -22px rgba(44,49,58,.4);}
.bn-feat-t{font-family:var(--display);font-weight:600;font-size:19px;margin:0 0 9px;}
.bn-feat-t::before{content:'';display:inline-block;width:8px;height:8px;border-radius:2px;
  background:var(--blue);margin-inline-end:9px;vertical-align:middle;}
.bn-feat-d{font-size:15px;color:#5a626e;margin:0;}

/* cta */
.bn-cta{background:var(--graphite);color:#fff;text-align:center;}
.bn-cta-in{max-width:620px;}
.bn-cta .bn-h2{color:#fff;}
.bn-cta-sub{color:#c7ccd3;margin-inline:auto;}
.bn-cta .bn-form{margin-top:30px;}
.bn-cta .bn-form-fields{justify-content:center;max-width:560px;margin-inline:auto;}
.bn-cta .bn-input{background:#373d47;border-color:#454c57;color:#fff;}
.bn-cta .bn-input::placeholder{color:#8b93a0;}

/* footer */
.bn-footer{border-top:1px solid var(--line);padding:30px 0;}
.bn-footer-in{display:flex;align-items:center;gap:18px;flex-wrap:wrap;}
.bn-foot-tag{font-size:14px;color:#5a626e;}
.bn-foot-rights{font-family:var(--mono);font-size:12px;color:var(--grey);margin-inline-start:auto;}

/* motion */
@keyframes bn-rise{from{opacity:0;transform:translateY(16px);}to{opacity:1;transform:none;}}
@keyframes bn-pop{from{opacity:0;transform:scale(.8);}to{opacity:1;transform:scale(1);}}
@keyframes bn-shimmer{from{background-position:200% 0;}to{background-position:-200% 0;}}
@media (prefers-reduced-motion:reduce){
  .bn-hero-copy,.bn-ledger{animation:none;}
  .bn-sk{animation:none;}
  .bn-btn,.bn-feat{transition:none;}
}

/* responsive */
@media (max-width:860px){
  .bn-hero-grid{grid-template-columns:1fr;gap:40px;}
  .bn-steps{grid-template-columns:1fr;gap:26px;}
  .bn-feats{grid-template-columns:1fr;}
  .bn-hero{padding:48px 0 60px;}
  .bn-section{padding:60px 0;}
}
`,
      }}
    />
  );
}
