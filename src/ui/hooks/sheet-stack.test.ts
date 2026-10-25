import { afterEach, beforeEach, expect, it, vi } from "vitest";

let listeners: Map<string, Set<(event: any) => void>>;
let states: Record<string, unknown>[];
let position: number;
let registerSheet: typeof import("./sheet-stack").registerSheet;
const root = {} as HTMLElement;
const flush = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

beforeEach(async () => {
  vi.resetModules();
  listeners = new Map();
  states = [{ router: "preserved" }];
  position = 0;
  vi.stubGlobal("document", { activeElement: null });
  vi.stubGlobal("window", {
    location: { href: "https://kit.test/demo" },
    addEventListener: (type: string, fn: (event: any) => void) => {
      if (!listeners.has(type)) listeners.set(type, new Set());
      listeners.get(type)!.add(fn);
    },
    removeEventListener: (type: string, fn: (event: any) => void) => listeners.get(type)?.delete(fn),
    history: {
      get state() { return states[position]; },
      pushState: (state: Record<string, unknown>) => { states.splice(position + 1); states.push(state); position++; },
      back: () => queueMicrotask(() => {
        if (position === 0) return;
        position--;
        for (const fn of listeners.get("popstate") ?? []) fn({});
      }),
    },
  });
  ({ registerSheet } = await import("./sheet-stack"));
});
afterEach(() => vi.unstubAllGlobals());

it("covers only sheets in the same AppShell and Escape dismisses the last opened", () => {
  const first = { root, close: vi.fn(), update: vi.fn() };
  const second = { root, close: vi.fn(), update: vi.fn() };
  const other = { root: {} as HTMLElement, close: vi.fn(), update: vi.fn() };
  registerSheet(first); registerSheet(second); registerSheet(other);
  expect(first.update).toHaveBeenLastCalledWith({ index: 0, depth: 1 });
  expect(second.update).toHaveBeenLastCalledWith({ index: 1, depth: 0 });
  expect(other.update).toHaveBeenLastCalledWith({ index: 0, depth: 0 });
  const event = { key: "Escape", defaultPrevented: false, preventDefault: vi.fn(), stopImmediatePropagation: vi.fn() };
  for (const fn of listeners.get("keydown") ?? []) fn(event);
  expect(other.close).toHaveBeenCalledOnce();
  expect(second.close).not.toHaveBeenCalled();
  expect(event.stopImmediatePropagation).toHaveBeenCalledOnce();
});

it("browser Back closes only the upper sheet and preserves the router state", async () => {
  const lowerClose = vi.fn();
  registerSheet({ root, close: lowerClose, update: vi.fn() });
  const close = vi.fn(() => remove());
  const remove = registerSheet({ root, close, update: vi.fn() });
  expect(window.history.state.router).toBe("preserved");
  window.history.back(); await flush();
  expect(close).toHaveBeenCalledOnce();
  expect(lowerClose).not.toHaveBeenCalled();
  expect(position).toBe(1);
});

it("programmatic close unwinds all removed sheets without closing a remaining parent", async () => {
  const close = vi.fn();
  const lower = registerSheet({ root, close, update: vi.fn() });
  const upper = registerSheet({ root, close: vi.fn(), update: vi.fn() });
  upper(); await flush();
  expect(position).toBe(1);
  expect(close).not.toHaveBeenCalled();
  lower(); await flush();
  expect(position).toBe(0);
  expect(listeners.get("keydown")?.size).toBe(0);
});

it("closing a parent and child together leaves no phantom Back steps", async () => {
  const lower = registerSheet({ root, close: vi.fn(), update: vi.fn() });
  const upper = registerSheet({ root, close: vi.fn(), update: vi.fn() });
  lower(); upper(); await flush();
  expect(position).toBe(0);
});


it("reopening during history cleanup does not dismiss the new sheet", async () => {
  registerSheet({ root, close: vi.fn(), update: vi.fn() });
  const remove = registerSheet({ root, close: vi.fn(), update: vi.fn() });
  remove();
  const close = vi.fn();
  registerSheet({ root, close, update: vi.fn() });
  await flush();
  expect(close).not.toHaveBeenCalled();
  expect(position).toBe(2);
});


it("leaves Escape to a focused Dialog above the sheet", () => {
  const close = vi.fn();
  registerSheet({ root, close, update: vi.fn() });
  vi.stubGlobal("document", { activeElement: { closest: () => ({ hasAttribute: () => false }) } });
  const event = { key: "Escape", defaultPrevented: false, preventDefault: vi.fn(), stopImmediatePropagation: vi.fn() };
  for (const fn of listeners.get("keydown") ?? []) fn(event);
  expect(close).not.toHaveBeenCalled();
  expect(event.stopImmediatePropagation).not.toHaveBeenCalled();
});
