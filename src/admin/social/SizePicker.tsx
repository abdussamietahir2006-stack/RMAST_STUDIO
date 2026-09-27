// Size picker shared by the Social posts and Social videos pages.
import React, { useEffect, useState } from 'react';
import { Ruler } from 'lucide-react';
import type { PostSize } from '../../types';
import { Button } from '../ui';
import { MAX_POST_SIDE, MIN_POST_SIDE, POST_SIZE_PRESETS, presetFor } from './shared';

const selectClass =
  'px-2 py-1.5 text-sm bg-[#0B0C10] border border-[#2E3040] rounded-md text-[#ECEAE5] outline-none focus:border-[#C9A96E] disabled:opacity-50';

// Picks the exact size of a post or video: a common preset or any width x height in pixels.
// "live" applies custom numbers as they are typed (the idea form); otherwise an Apply button saves them.
export const SizePicker: React.FC<{ value: PostSize; onChange: (size: PostSize) => void; disabled?: boolean; live?: boolean }> = ({
  value,
  onChange,
  disabled,
  live
}) => {
  const [custom, setCustom] = useState(presetFor(value) === 'custom');
  const [w, setW] = useState(String(value.width));
  const [h, setH] = useState(String(value.height));
  useEffect(() => {
    setW(String(value.width));
    setH(String(value.height));
  }, [value.width, value.height]);

  const valid = (n: string) => /^\d+$/.test(n) && Number(n) >= MIN_POST_SIDE && Number(n) <= MAX_POST_SIDE;
  const ok = valid(w) && valid(h);
  const changed = Number(w) !== value.width || Number(h) !== value.height;
  const type = (nextW: string, nextH: string) => {
    setW(nextW);
    setH(nextH);
    if (live && valid(nextW) && valid(nextH)) onChange({ width: Number(nextW), height: Number(nextH) });
  };
  const inputClass =
    'w-20 px-2 py-1.5 text-sm bg-[#0B0C10] border rounded-md text-[#ECEAE5] outline-none focus:border-[#C9A96E] disabled:opacity-50';

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-[#A6A8B3]">
      <label className="flex items-center gap-2">
        <Ruler className="w-3.5 h-3.5" />
        <select
          value={custom ? 'custom' : presetFor(value)}
          disabled={disabled}
          aria-label="Size"
          className={selectClass}
          onChange={(e) => {
            if (e.target.value === 'custom') return setCustom(true);
            setCustom(false);
            const p = POST_SIZE_PRESETS.find((x) => x.id === e.target.value);
            if (p) onChange({ width: p.width, height: p.height });
          }}
        >
          {POST_SIZE_PRESETS.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label} · {p.width}×{p.height}
            </option>
          ))}
          <option value="custom">Custom size…</option>
        </select>
      </label>
      {custom && (
        <span className="flex items-center gap-1.5">
          <input
            inputMode="numeric"
            value={w}
            disabled={disabled}
            onChange={(e) => type(e.target.value.trim(), h)}
            aria-label="Width in pixels"
            className={`${inputClass} ${valid(w) ? 'border-[#2E3040]' : 'border-[#F87171]'}`}
          />
          ×
          <input
            inputMode="numeric"
            value={h}
            disabled={disabled}
            onChange={(e) => type(w, e.target.value.trim())}
            aria-label="Height in pixels"
            className={`${inputClass} ${valid(h) ? 'border-[#2E3040]' : 'border-[#F87171]'}`}
          />
          px
          {!live && (
            <Button variant="ghost" disabled={disabled || !ok || !changed} onClick={() => onChange({ width: Number(w), height: Number(h) })}>
              Apply
            </Button>
          )}
          {!ok && <span className="text-[#F87171]">{MIN_POST_SIDE}–{MAX_POST_SIDE} px</span>}
        </span>
      )}
    </div>
  );
};
