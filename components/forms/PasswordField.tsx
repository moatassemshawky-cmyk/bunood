'use client';

import { useState } from 'react';
import { FormField } from './FormField';

type StrScore = 0 | 1 | 2 | 3 | 4;

function calcStrength(pw: string): { score: StrScore; color: string } {
  if (!pw) return { score: 0, color: '' };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.min(4, s) as StrScore;
  return { score, color: ['', '#ef4444', '#f97316', '#eab308', '#22c55e'][score] };
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  /** Show the strength meter (used for the primary password field, not confirm-password). */
  showStrength?: boolean;
  /** Index 0 is unused (score 0 = empty); indices 1-4 label weak..strong. */
  strengthLabels?: string[];
  classPrefix: string;
}

/** Password input with show/hide toggle and an optional strength meter. */
export function PasswordField({
  label, value, onChange, onBlur, placeholder, error,
  showStrength, strengthLabels, classPrefix,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);
  const strength = calcStrength(value);

  return (
    <FormField label={label} error={error} classPrefix={classPrefix}>
      <div className={`${classPrefix}-pw-wrap`}>
        <input
          className={`${classPrefix}-input ${error ? 'has-error' : ''}`}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
        />
        <button type="button" className={`${classPrefix}-pw-toggle`} onClick={() => setShow(v => !v)}>
          {show ? '🙈' : '👁'}
        </button>
      </div>
      {showStrength && value && (
        <div className={`${classPrefix}-pw-strength`}>
          <div className={`${classPrefix}-pw-bars`}>
            {[1, 2, 3, 4].map(n => (
              <div
                key={n}
                className={`${classPrefix}-pw-bar`}
                style={{ background: strength.score >= n ? strength.color : undefined }}
              />
            ))}
          </div>
          <span style={{ color: strength.color }}>{strengthLabels?.[strength.score] ?? ''}</span>
        </div>
      )}
    </FormField>
  );
}
