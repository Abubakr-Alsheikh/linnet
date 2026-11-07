import { describe, expect, it } from "vitest";
import { sendTimeline } from "@/lib/motion";
import {
  MAX_LINES,
  SCHEDULE,
  createDemoState,
  demoReducer,
  evaluate,
  sendBlocker,
  type DemoAction,
  type DemoDefaults,
  type DemoState,
} from "./demo-machine";

const defaults: DemoDefaults = {
  clientId: "moss-lane",
  currency: "EUR",
  termsDays: 14,
  taxRate: "20",
  lines: [
    { description: "Discovery workshop", quantity: "6", rate: "95.00" },
    { description: "Interface design, checkout flow", quantity: "18.5", rate: "95.00" },
  ],
};

const run = (state: DemoState, ...actions: DemoAction[]) => actions.reduce(demoReducer, state);
const draft = () => createDemoState(defaults);
const toStatus = (target: DemoState["status"]) => {
  let state = run(draft(), { type: "send" });
  let at = 1000;
  while (state.status !== target) state = demoReducer(state, { type: "advance", at: (at += 100) });
  return state;
};

describe("createDemoState", () => {
  it("starts a draft with the default lines and numbered ids", () => {
    const state = draft();
    expect(state.status).toBe("draft");
    expect(state.lines.map((line) => line.id)).toEqual(["line-1", "line-2"]);
    expect(state.nextLineId).toBe(3);
    expect(state.activity).toEqual([]);
  });

  it("totals the defaults to 2,793.00", () => {
    expect(evaluate(draft())).toEqual({ totals: { lines: [57000, 175750], subtotal: 232750, tax: 46550, total: 279300 }, valid: true });
  });
});

describe("editing a draft", () => {
  it("edits one field of one line", () => {
    const state = run(draft(), { type: "editLine", id: "line-2", field: "quantity", value: "24" });
    expect(state.lines[1].quantity).toBe("24");
    expect(state.lines[0]).toEqual(draft().lines[0]);
    expect(evaluate(state).totals.total).toBe(342000);
  });

  it("adds lines up to six, then stops", () => {
    let state = draft();
    for (let i = 0; i < 10; i++) state = demoReducer(state, { type: "addLine" });
    expect(state.lines).toHaveLength(MAX_LINES);
    expect(state.lines.at(-1)).toEqual({ id: "line-6", description: "", quantity: "", rate: "" });
  });

  it("removes lines down to one, then stops", () => {
    let state = run(draft(), { type: "removeLine", id: "line-1" });
    expect(state.lines.map((line) => line.id)).toEqual(["line-2"]);
    state = demoReducer(state, { type: "removeLine", id: "line-2" });
    expect(state.lines).toHaveLength(1);
  });

  it("never reuses an id after a removal", () => {
    const state = run(draft(), { type: "removeLine", id: "line-2" }, { type: "addLine" });
    expect(state.lines.map((line) => line.id)).toEqual(["line-1", "line-3"]);
  });

  it("ignores removing a line that does not exist", () => {
    const state = draft();
    expect(demoReducer(state, { type: "removeLine", id: "line-9" })).toBe(state);
  });

  it("switches currency with the client, and lets the currency change after", () => {
    let state = run(draft(), { type: "setClient", clientId: "kettlebridge", currency: "GBP" });
    expect([state.clientId, state.currency]).toEqual(["kettlebridge", "GBP"]);
    state = demoReducer(state, { type: "setCurrency", currency: "USD" });
    expect([state.clientId, state.currency]).toEqual(["kettlebridge", "USD"]);
  });

  it("sets terms and the tax rate", () => {
    const state = run(draft(), { type: "setTerms", days: 30 }, { type: "setTaxRate", value: "0" });
    expect(state.termsDays).toBe(30);
    expect(evaluate(state).totals.total).toBe(232750);
  });
});

describe("sendBlocker", () => {
  it("lets a valid invoice with a total go", () => {
    expect(sendBlocker(draft())).toBeNull();
  });

  it("blocks an invalid field", () => {
    expect(sendBlocker(run(draft(), { type: "editLine", id: "line-1", field: "quantity", value: "lots" }))).toBe("invalid");
    expect(sendBlocker(run(draft(), { type: "editLine", id: "line-1", field: "description", value: " " }))).toBe("invalid");
    expect(sendBlocker(run(draft(), { type: "setTaxRate", value: "45" }))).toBe("invalid");
  });

  it("blocks a zero total", () => {
    const zero = run(
      draft(),
      { type: "editLine", id: "line-1", field: "quantity", value: "0" },
      { type: "editLine", id: "line-2", field: "rate", value: "0" },
    );
    expect(sendBlocker(zero)).toBe("zero");
  });
});

describe("the send sequence", () => {
  it("goes draft, sending, sent, viewed, paid and logs each step with its time", () => {
    let state = run(draft(), { type: "send" });
    expect(state.status).toBe("sending");
    state = run(state, { type: "advance", at: 1 }, { type: "advance", at: 2 }, { type: "advance", at: 3 });
    expect(state.status).toBe("paid");
    expect(state.activity).toEqual([
      { kind: "sent", at: 1 },
      { kind: "viewed", at: 2 },
      { kind: "paid", at: 3 },
    ]);
  });

  it("takes its delays from sendTimeline and ends under 3 s", () => {
    const delays = [SCHEDULE.sending?.after, SCHEDULE.sent?.after, SCHEDULE.viewed?.after];
    expect(delays).toEqual([600, 900, 900]);
    expect(delays.reduce((sum = 0, delay = 0) => sum + delay, 0)).toBe(sendTimeline.paid);
    expect(sendTimeline.paid).toBeLessThan(3000);
  });

  it("refuses to send a blocked invoice", () => {
    const invalid = run(draft(), { type: "setTaxRate", value: "x" });
    expect(demoReducer(invalid, { type: "send" })).toBe(invalid);
  });

  it("locks every edit once sent", () => {
    for (const status of ["sending", "sent", "viewed", "paid"] as const) {
      const state = toStatus(status);
      const edits: DemoAction[] = [
        { type: "editLine", id: "line-1", field: "rate", value: "1" },
        { type: "addLine" },
        { type: "removeLine", id: "line-1" },
        { type: "setClient", clientId: "ferngrove", currency: "USD" },
        { type: "setCurrency", currency: "GBP" },
        { type: "setTerms", days: 0 },
        { type: "setTaxRate", value: "0" },
        { type: "send" },
      ];
      for (const edit of edits) expect(demoReducer(state, edit)).toBe(state);
    }
  });

  it("does not advance a draft or a paid invoice", () => {
    const state = draft();
    expect(demoReducer(state, { type: "advance", at: 1 })).toBe(state);
    const paid = toStatus("paid");
    expect(demoReducer(paid, { type: "advance", at: 1 })).toBe(paid);
  });

  it("resets only from paid, back to the defaults", () => {
    for (const status of ["draft", "sending", "sent", "viewed"] as const) {
      const state = status === "draft" ? draft() : toStatus(status);
      expect(demoReducer(state, { type: "reset", defaults })).toBe(state);
    }
    const edited = run(draft(), { type: "setTaxRate", value: "0" }, { type: "send" });
    const paid = run(edited, { type: "advance", at: 1 }, { type: "advance", at: 2 }, { type: "advance", at: 3 });
    expect(demoReducer(paid, { type: "reset", defaults })).toEqual(draft());
  });
});
