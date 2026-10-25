// Sheets share one dismissal order; visual depth is scoped to their AppShell.
type Sheet = {
  id: number;
  historyAdded: boolean;
  root: HTMLElement;
  close: () => void;
  update: (state: { index: number; depth: number }) => void;
};
const sheets: Sheet[] = [];
const historyKey = "__m1kSheet";
const entries = new Map<number, string>();
let nextId = 0;
let goingBack = false;

function update() {
  for (const sheet of sheets) {
    const siblings = sheets.filter((item) => item.root === sheet.root);
    const index = siblings.indexOf(sheet);
    sheet.update({ index, depth: siblings.length - index - 1 });
  }
}

function unwindHistory() {
  const id = window.history.state?.[historyKey];
  if (!goingBack && entries.get(id) === window.location.href && !sheets.some((sheet) => sheet.id === id)) {
    goingBack = true;
    window.history.back();
    return true;
  }
  return goingBack;
}

function releaseHistoryListener() {
  if (sheets.length || goingBack) return;
  entries.clear();
  window.removeEventListener("popstate", onPopState);
}

function onPopState() {
  goingBack = false;
  if (unwindHistory()) return;
  const pending = sheets.filter((sheet) => !sheet.historyAdded);
  if (pending.length) {
    for (const sheet of pending) addHistory(sheet);
    return;
  }
  const top = sheets[sheets.length - 1];
  if (top && window.history.state?.[historyKey] !== top.id) top.close();
  releaseHistoryListener();
}

function onKeyDown(event: KeyboardEvent) {
  if (event.key !== "Escape" || event.defaultPrevented || !sheets.length) return;
  const focusedDialog = document.activeElement?.closest('[role="dialog"]');
  if (focusedDialog && !focusedDialog.hasAttribute("data-in-app-sheet")) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  sheets[sheets.length - 1]!.close();
}

function addHistory(sheet: Sheet) {
  window.history.pushState({ ...window.history.state, [historyKey]: sheet.id }, "");
  sheet.historyAdded = true;
}

export function registerSheet(sheet: Omit<Sheet, "id" | "historyAdded">) {
  const entry = { ...sheet, id: ++nextId, historyAdded: false };
  if (!sheets.length) window.addEventListener("keydown", onKeyDown, true);
  if (!entries.size) window.addEventListener("popstate", onPopState);
  sheets.push(entry);
  entries.set(entry.id, window.location.href);
  // A quick reopen must wait for the previous sheet's asynchronous history.back().
  if (!goingBack) addHistory(entry);
  update();
  return () => {
    const index = sheets.indexOf(entry);
    if (index < 0) return;
    sheets.splice(index, 1);
    update();
    if (!sheets.length) window.removeEventListener("keydown", onKeyDown, true);
    unwindHistory();
    releaseHistoryListener();
  };
}
