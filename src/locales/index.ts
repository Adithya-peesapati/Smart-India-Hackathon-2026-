import { en } from './en';
import { hi } from './hi';
import { te } from './te';
import { ta } from './ta';
import { kn } from './kn';
import { ml } from './ml';
import { mr } from './mr';
import { bn } from './bn';
import { gu } from './gu';
import { pa } from './pa';
import { ur } from './ur';
import { or } from './or';
import { as as asLocale } from './as';
import { bho } from './bho';
import { ma } from './ma';
import { sa } from './sa';
import { LanguageCode } from '../context/LanguageContext';

export const LOCALES: Record<LanguageCode, Record<string, string>> = {
  en,
  hi,
  te,
  ta,
  kn,
  ml,
  mr,
  bn,
  gu,
  pa,
  ur,
  or,
  as: asLocale,
  bho,
  ma,
  sa,
};
