'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ChangeEvent, useTransition } from 'react';

export default function LanguageSwitcher() {
  const t = useTranslations('Settings');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const localActive = useLocale();

  const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const nextLocale = e.target.value;
    startTransition(() => {
      router.replace(`/${nextLocale}`);
    });
  };

  return (
    <select
      defaultValue={localActive}
      disabled={isPending}
      onChange={onSelectChange}
    >
      <option value="en">{t('english')}</option>
      <option value="zh-TW">{t('traditional_chinese')}</option>
    </select>
  );
}