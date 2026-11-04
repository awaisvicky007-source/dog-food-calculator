// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';
import { renderPage } from '../src/server/render';

const set = (id: string, v: string) => {
  (document.getElementById(id) as HTMLInputElement).value = v;
};
const submit = () =>
  document.getElementById('calcForm')!.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));

describe('calculator UI (runs the real client code against the real page)', () => {
  beforeAll(async () => {
    const html = renderPage({ jsUrl: '/x.js' });
    document.body.innerHTML = html.slice(html.indexOf('<body>') + 6, html.indexOf('</body>')).replace(/<script[\s\S]*?<\/script>/g, '');
    Element.prototype.scrollIntoView = () => {};
    await import('../src/client/main');
  });

  it('shows validation errors instead of a result for bad input', () => {
    set('weight', 'abc');
    set('age', '3');
    submit();
    expect(document.getElementById('formErrors')!.hidden).toBe(false);
    expect(document.getElementById('results')!.hidden).toBe(true);
  });

  it('AC-01/02: 30 lb, 3 y, neutered, 350 kcal/cup -> ~794 kcal and ~2.27 cups', () => {
    set('name', 'Biscuit');
    set('weight', '30');
    set('weightUnit', 'lb');
    set('age', '3');
    set('ageUnit', 'years');
    set('kcalCup', '350');
    submit();
    const res = document.getElementById('results')!;
    expect(res.hidden).toBe(false);
    expect(res.textContent).toContain('Biscuit');
    expect(res.textContent).toMatch(/79[3-5]/);
    expect(res.textContent).toContain('2.27');
    expect(res.textContent).toContain('Questions for my vet');
  });

  it('escapes HTML in the dog name (no injection)', () => {
    set('name', '<img src=x onerror=alert(1)>');
    submit();
    expect(document.getElementById('results')!.querySelector('img')).toBeNull();
  });

  it('saves a pet to the device only, and Clear all data wipes it (AC-16)', () => {
    set('name', 'Biscuit');
    submit();
    (document.querySelector('[data-action="save"]') as HTMLElement).click();
    expect(localStorage.getItem('pv.pets.v1')).toContain('Biscuit');
    window.confirm = () => true;
    document.getElementById('clearBtn')!.click();
    expect(localStorage.getItem('pv.pets.v1')).toBeNull();
    expect(document.getElementById('results')!.hidden).toBe(true);
  });

  it('makes no network requests during a calculation (AC-18)', () => {
    let calls = 0;
    (globalThis as any).fetch = () => {
      calls++;
      return Promise.reject(new Error('network'));
    };
    set('name', 'Biscuit');
    set('weight', '30');
    set('age', '3');
    submit();
    expect(calls).toBe(0);
  });
});
