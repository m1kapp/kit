import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { PoweredByKit } from './powered-by';

describe('PoweredByKit tracking and display', () => {
  it('shows real supplied counts and controls without a visitor beacon', () => {
    const html = renderToStaticMarkup(<PoweredByKit slug="preview" track={false} counts={{ today: 0, total: 7 }} claimed />);
    expect(html).toContain('TODAY');
    expect(html).toContain('TOTAL');
    expect(html).toContain('aria-label="이전"');
    expect(html).toContain('aria-label="다음"');
    expect(html).not.toContain('/badge/');
  });

  it('keeps the beacon for tracked visits', () => {
    const html = renderToStaticMarkup(<PoweredByKit slug="production" counts={{ today: 1, total: 7 }} claimed />);
    expect(html).toContain('/badge/production.svg');
  });

  it('keeps the plain credit when no slug is provided', () => {
    const html = renderToStaticMarkup(<PoweredByKit track={false} />);
    expect(html).toContain('powered by');
    expect(html).not.toContain('aria-label="이전"');
    expect(html).not.toContain('/badge/');
  });
});
