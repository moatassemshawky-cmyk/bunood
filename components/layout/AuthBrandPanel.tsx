import Link from 'next/link';

interface AuthBrandPanelProps {
  title: string;
  sub: string;
  benefits: string[];
  tags: string[];
  classPrefix: string;
}

/** Shared left-hand brand panel (logo, pitch copy, benefits, tags) for registration wizards. */
export function AuthBrandPanel({ title, sub, benefits, tags, classPrefix }: AuthBrandPanelProps) {
  return (
    <aside className={`${classPrefix}-brand`}>
      <div className={`${classPrefix}-brand-in`}>
        <Link href="/" className={`${classPrefix}-logo`}>
          <svg width="28" height="22" viewBox="0 0 28 22" fill="none">
            <rect x="0" y="0" width="28" height="5" rx="2.5" fill="#2f6fe0" />
            <rect x="0" y="8.5" width="20" height="5" rx="2.5" fill="#fff" opacity=".9" />
            <rect x="0" y="17" width="28" height="5" rx="2.5" fill="#fff" opacity=".55" />
          </svg>
          <span className={`${classPrefix}-wordmark`}>
            bun<span className="oo">oo</span>d
          </span>
        </Link>
        <div className={`${classPrefix}-brand-copy`}>
          <h1 className={`${classPrefix}-brand-title`}>{title}</h1>
          <p className={`${classPrefix}-brand-sub`}>{sub}</p>
        </div>
        <ul className={`${classPrefix}-benefits`}>
          {benefits.map((b, i) => (
            <li key={i} className={`${classPrefix}-benefit`}>
              <span className={`${classPrefix}-benefit-dot`} />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <div className={`${classPrefix}-brand-footer`}>
          {tags.map((tag, i) => (
            <span key={i} className={`${classPrefix}-tag`}>{tag}</span>
          ))}
        </div>
      </div>
    </aside>
  );
}
