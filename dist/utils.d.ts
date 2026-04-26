import { ClassValue } from 'clsx';

declare function relativeTime(date: Date | string | number): string;
declare function formatNumber(n: number): string;
declare function formatPrice(amount: number, currency?: string, locale?: string): string;

declare function cn(...inputs: ClassValue[]): string;

export { cn, formatNumber, formatPrice, relativeTime };
