import { Pipe, PipeTransform, Inject, LOCALE_ID } from '@angular/core';
import { formatNumber } from '@angular/common';

@Pipe({
  name: 'humanNumber'
})
export class HumanNumberPipe implements PipeTransform {

  constructor(@Inject(LOCALE_ID) private locale: string) {}

  transform(
    value: number,
    options?: {
      precision?: number;
      approxSymbol?: boolean;
      suffix?: string;
      minifyFrom?: number;
      space?: boolean;
      declensionMap?: Record<string, string>;
    }
  ): string {
    if (value == null || isNaN(value)) return '';

    const {
      precision = 1,
      approxSymbol = false,
      suffix = '',
      minifyFrom = 1000,
      space = true,
      declensionMap
    } = options || {};

    const abs: number = Math.abs(value);
    const sign: '-' | '' = value < 0 ? '-' : '';
    let num: number = value;
    let unit: string = '';

    if (abs >= 1_000_000_000) {
      num = value / 1_000_000_000;
      unit = 'B';
    } else if (abs >= 1_000_000) {
      num = value / 1_000_000;
      unit = 'M';
    } else if (abs >= minifyFrom) {
      num = value / 1_000;
      unit = 'K';
    } else {
      const fullNumber: string = formatNumber(value, this.locale, `1.0-0`);
      return this.withSuffix(fullNumber, suffix, space, declensionMap, value);
    }

    let formatted: string = formatNumber(num, this.locale, `1.${precision}-${precision}`);
    formatted = formatted.replace(new RegExp(`[${this.getDecimalSeparator()}]0+$`), '');

    const approx: '' | '≈' = approxSymbol ? '≈' : '';
    const result = `${sign}${approx}${formatted}${unit}`;

    return this.withSuffix(result, suffix, space, declensionMap, value);
  }

  private getDecimalSeparator(): string {
    const test: string = formatNumber(1.1, this.locale);
    return test.replace(/\d/g, '')[0] || '.';
  }

  private withSuffix(
    valueStr: string,
    suffix: string,
    space: boolean,
    declensionMap: Record<string, string> | undefined,
    num: number
  ): string {
    if (!suffix && !declensionMap) return valueStr;

    const separator: ' ' | '' = space ? ' ' : '';
    let finalSuffix: string = suffix;

    if (declensionMap) {
      const plural: "one" | "few" | "many" = this.getPluralForm(Math.abs(Math.round(num)));
      finalSuffix = declensionMap[plural] || '';
    }

    return `${valueStr}${separator}${finalSuffix}`.trim();
  }

  private getPluralForm(n: number): 'one' | 'few' | 'many' {
    if (this.locale.startsWith('uk') || this.locale.startsWith('ru')) {
      const mod10: number = n % 10;
      const mod100: number = n % 100;
      if (mod10 === 1 && mod100 !== 11) return 'one';
      if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return 'few';
      return 'many';
    }
    return n === 1 ? 'one' : 'many';
  }
}
