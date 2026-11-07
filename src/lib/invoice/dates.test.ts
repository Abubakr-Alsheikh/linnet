import { describe, expect, it } from "vitest";
import { addDays, dayKey, formatDate, formatTime, fromDayKey, invoiceDates } from "./dates";

const day = (year: number, month: number, date: number, hours = 0, minutes = 0) => new Date(year, month - 1, date, hours, minutes);

describe("formatDate", () => {
  it("writes day, three-letter month and year", () => {
    expect(formatDate(day(2026, 11, 6))).toBe("6 Nov 2026");
    expect(formatDate(day(2026, 9, 30))).toBe("30 Sep 2026");
    expect(formatDate(day(2027, 1, 1))).toBe("1 Jan 2027");
  });
});

describe("formatTime", () => {
  it("writes 24-hour time with leading zeros", () => {
    expect(formatTime(day(2026, 11, 6, 9, 5))).toBe("09:05");
    expect(formatTime(day(2026, 11, 6, 23, 59))).toBe("23:59");
  });
});

describe("invoiceDates", () => {
  it("issues today and adds the terms", () => {
    const { issued, due } = invoiceDates(day(2026, 11, 6, 15, 42), 14);
    expect(formatDate(issued)).toBe("6 Nov 2026");
    expect(formatDate(due)).toBe("20 Nov 2026");
  });

  it("makes an on-receipt invoice due the same day", () => {
    const { issued, due } = invoiceDates(day(2026, 11, 6, 23, 59), 0);
    expect(formatDate(due)).toBe(formatDate(issued));
  });

  it("rolls over month and year ends", () => {
    expect(formatDate(addDays(day(2026, 1, 31), 30))).toBe("2 Mar 2026");
    expect(formatDate(addDays(day(2026, 11, 30), 7))).toBe("7 Dec 2026");
    expect(formatDate(addDays(day(2026, 12, 25), 14))).toBe("8 Jan 2027");
  });

  it("counts the leap day", () => {
    expect(formatDate(addDays(day(2028, 2, 15), 14))).toBe("29 Feb 2028");
    expect(formatDate(addDays(day(2028, 2, 22), 7))).toBe("29 Feb 2028");
    expect(formatDate(addDays(day(2027, 2, 22), 7))).toBe("1 Mar 2027");
    expect(formatDate(addDays(day(2028, 1, 30), 30))).toBe("29 Feb 2028");
  });

  it("keeps whole days across a clock change", () => {
    // Europe moves clocks back on 25 Oct 2026; a local day stays a day.
    expect(formatDate(addDays(day(2026, 10, 20), 14))).toBe("3 Nov 2026");
    expect(formatDate(addDays(day(2026, 3, 25), 7))).toBe("1 Apr 2026");
  });
});

describe("dayKey", () => {
  it("round-trips a local day", () => {
    const key = dayKey(day(2026, 3, 9, 18, 30));
    expect(key).toBe("2026-03-09");
    expect(formatDate(fromDayKey(key))).toBe("9 Mar 2026");
  });
});
