import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import {
  NAME_MAX,
  NOTE_MAX,
  TEAMS,
  WAITLIST_CURRENCIES,
  encodeWaitlist,
  submitWaitlist,
  validateWaitlist,
  type WaitlistValues,
} from "./waitlist";

const messages = {
  emailMissing: "Enter your email so there is somewhere to reply.",
  emailInvalid: "That email does not look right.",
  nameLong: "Keep the name under 80 characters.",
  noteLong: "Keep it under 500 characters.",
};

const valid: WaitlistValues = {
  name: "Noor",
  email: "noor@studio.example",
  team: "studio",
  currency: "EUR",
  note: "Chasing late payers.",
  "bot-field": "",
};

describe("validateWaitlist", () => {
  it("accepts a complete entry and trims it", () => {
    const result = validateWaitlist({ ...valid, email: "  noor@studio.example ", name: " Noor " }, messages);
    expect(result).toEqual({ ok: true, data: { ...valid } });
  });

  it("accepts an empty name and note", () => {
    expect(validateWaitlist({ ...valid, name: "", note: "" }, messages).ok).toBe(true);
  });

  it("tells a missing email from a wrong one", () => {
    expect(validateWaitlist({ ...valid, email: "  " }, messages)).toEqual({ ok: false, errors: { email: messages.emailMissing } });
    expect(validateWaitlist({ ...valid, email: "noor@" }, messages)).toEqual({ ok: false, errors: { email: messages.emailInvalid } });
  });

  it("bounds the name at 80 and the note at 500 characters", () => {
    expect(validateWaitlist({ ...valid, name: "x".repeat(NAME_MAX) }, messages).ok).toBe(true);
    expect(validateWaitlist({ ...valid, name: "x".repeat(NAME_MAX + 1) }, messages)).toEqual({ ok: false, errors: { name: messages.nameLong } });
    expect(validateWaitlist({ ...valid, note: "x".repeat(NOTE_MAX) }, messages).ok).toBe(true);
    expect(validateWaitlist({ ...valid, note: "x".repeat(NOTE_MAX + 1) }, messages)).toEqual({ ok: false, errors: { note: messages.noteLong } });
  });

  it("reports every invalid field at once", () => {
    const result = validateWaitlist({ ...valid, email: "", name: "x".repeat(81), note: "x".repeat(501) }, messages);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(Object.keys(result.errors).sort()).toEqual(["email", "name", "note"]);
  });

  it("rejects a team or currency outside the lists", () => {
    expect(validateWaitlist({ ...valid, team: "enterprise" as never }, messages).ok).toBe(false);
    expect(validateWaitlist({ ...valid, currency: "JPY" as never }, messages).ok).toBe(false);
  });
});

describe("encodeWaitlist", () => {
  it("sends form-name=waitlist and every field, urlencoded", () => {
    const body = new URLSearchParams(encodeWaitlist({ ...valid, note: "Late & lost: 50%" }));
    expect(Object.fromEntries(body)).toEqual({
      "form-name": "waitlist",
      "bot-field": "",
      name: "Noor",
      email: "noor@studio.example",
      team: "studio",
      currency: "EUR",
      note: "Late & lost: 50%",
    });
  });

  it("only sends names declared in public/__forms.html", () => {
    const html = readFileSync(new URL("../../public/__forms.html", import.meta.url), "utf8");
    const form = html.match(/<form name="waitlist"[\s\S]*?<\/form>/)?.[0] ?? "";
    const declared = new Set([...form.matchAll(/\bname="([^"]+)"/g)].map((match) => match[1]));
    for (const key of new URLSearchParams(encodeWaitlist(valid)).keys()) expect(declared).toContain(key);
    const options = (select: string) =>
      [...(form.match(new RegExp(`<select name="${select}">[\\s\\S]*?</select>`))?.[0] ?? "").matchAll(/value="([^"]+)"/g)].map(
        (match) => match[1],
      );
    expect(options("team")).toEqual([...TEAMS]);
    expect(options("currency")).toEqual([...WAITLIST_CURRENCIES]);
  });
});

describe("submitWaitlist", () => {
  const respond = (status: number) => vi.fn(async () => new Response(null, { status }));

  it("posts the encoded form to /__forms.html and resolves on 2xx", async () => {
    const fetchStub = respond(200);
    await expect(submitWaitlist(valid, fetchStub)).resolves.toBeUndefined();
    expect(fetchStub).toHaveBeenCalledTimes(1);
    const [url, init] = fetchStub.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("/__forms.html");
    expect(init.method).toBe("POST");
    expect(init.headers).toEqual({ "Content-Type": "application/x-www-form-urlencoded" });
    expect(new URLSearchParams(init.body as string).get("form-name")).toBe("waitlist");
    expect(new URLSearchParams(init.body as string).get("email")).toBe(valid.email);
  });

  it.each([404, 500])("rejects on %i", async (status) => {
    await expect(submitWaitlist(valid, respond(status))).rejects.toThrow(String(status));
  });

  it("rejects on a network error", async () => {
    const offline = vi.fn(async () => {
      throw new TypeError("Failed to fetch");
    });
    await expect(submitWaitlist(valid, offline)).rejects.toThrow("Failed to fetch");
  });
});
