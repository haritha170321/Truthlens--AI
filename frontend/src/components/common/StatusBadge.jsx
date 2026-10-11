import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, ShieldCheck, Scale, AlertOctagon } from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const s = (status || 'Unable to verify').trim();

  // Mapping for the 5 official TruthLens AI outcome categories
  if (
    s.toLowerCase().includes('supporting') ||
    s.toLowerCase().includes('real') ||
    s.toLowerCase().includes('ஆதரிக்கும்')
  ) {
    const isTa = s.includes('ஆதரிக்கும்');
    return (
      <span className={`inline-flex items-center font-bold rounded-full border shadow-sm bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/30 ${
        size === 'lg' ? 'text-sm md:text-base px-4 py-1.5 gap-2' : size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs md:text-sm px-3 py-1 gap-1.5'
      }`}>
        <ShieldCheck className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        {isTa ? 'ஆதரிக்கும் சான்றுகள் கண்டறியப்பட்டன' : 'Supporting evidence found'}
      </span>
    );
  }

  if (
    s.toLowerCase().includes('conflicting') ||
    s.toLowerCase().includes('fake') ||
    s.toLowerCase().includes('முரண்பாடான')
  ) {
    const isTa = s.includes('முரண்பாடான');
    return (
      <span className={`inline-flex items-center font-bold rounded-full border shadow-sm bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/30 ${
        size === 'lg' ? 'text-sm md:text-base px-4 py-1.5 gap-2' : size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs md:text-sm px-3 py-1 gap-1.5'
      }`}>
        <XCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        {isTa ? 'முரண்பாடான சான்றுகள் கண்டறியப்பட்டன' : 'Conflicting evidence found'}
      </span>
    );
  }

  if (
    s.toLowerCase().includes('context') ||
    s.toLowerCase().includes('misleading') ||
    s.toLowerCase().includes('கூடுதல்')
  ) {
    const isTa = s.includes('கூடுதல்');
    return (
      <span className={`inline-flex items-center font-bold rounded-full border shadow-sm bg-amber-500/10 text-amber-500 dark:text-amber-400 border-amber-500/30 ${
        size === 'lg' ? 'text-sm md:text-base px-4 py-1.5 gap-2' : size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs md:text-sm px-3 py-1 gap-1.5'
      }`}>
        <AlertTriangle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        {isTa ? 'கூடுதல் சூழல் தேவைப்படுகிறது' : 'Context required'}
      </span>
    );
  }

  if (
    s.toLowerCase().includes('insufficient') ||
    s.toLowerCase().includes('போதுமான')
  ) {
    const isTa = s.includes('போதுமான');
    return (
      <span className={`inline-flex items-center font-bold rounded-full border shadow-sm bg-slate-500/10 text-slate-400 border-slate-500/30 ${
        size === 'lg' ? 'text-sm md:text-base px-4 py-1.5 gap-2' : size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs md:text-sm px-3 py-1 gap-1.5'
      }`}>
        <Scale className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
        {isTa ? 'போதுமான சான்றுகள் இல்லை' : 'Insufficient evidence'}
      </span>
    );
  }

  // Default / Unable to verify
  const isTa = s.includes('சரிபார்க்க');
  return (
    <span className={`inline-flex items-center font-bold rounded-full border shadow-sm bg-purple-500/10 text-purple-400 border-purple-500/30 ${
      size === 'lg' ? 'text-sm md:text-base px-4 py-1.5 gap-2' : size === 'sm' ? 'text-xs px-2.5 py-0.5 gap-1' : 'text-xs md:text-sm px-3 py-1 gap-1.5'
    }`}>
      <HelpCircle className={size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'} />
      {isTa ? 'சரிபார்க்க இயலவில்லை' : 'Unable to verify'}
    </span>
  );
};

export default StatusBadge;
