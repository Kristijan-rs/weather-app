// tests/wetterwarnungen.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { WetterWarnungen } from "../src/wetterwarnungen.js";

describe("WetterWarnungen", () => {
  let ww;

  beforeEach(() => {
    ww = new WetterWarnungen();
  });

  it("legt ein neues Abo an", () => {
    ww.abonnieren("user@example.com", ["Berlin", "Münster"]);
    expect(ww.size()).toBe(1);
    const a = ww.findByEmail("user@example.com");
    expect(a).not.toBeNull();
    expect(a.regionen.sort()).toEqual(["berlin", "münster"].sort());
  });

  it("merged Regionen idempotent", () => {
    ww.abonnieren("u@e.com", ["Berlin"]);
    ww.abonnieren("u@e.com", ["berlin", "Hamburg"]);
    const a = ww.findByEmail("u@e.com");
    expect(a.regionen.sort()).toEqual(["berlin", "hamburg"].sort());
  });

  it("wirft bei ungültiger E-Mail", () => {
    expect(() => ww.abonnieren("keine-mail", ["Berlin"])).toThrow();
  });

  it("wirft bei leeren Regionen", () => {
    expect(() => ww.abonnieren("a@b.de", [])).toThrow();
    expect(() => ww.abonnieren("a@b.de", ["   "])).toThrow();
  });

  it("aktualisiert Regionen strikt", () => {
    ww.abonnieren("x@y.de", ["berlin"]);
    ww.updateRegionen("x@y.de", ["hamburg"]);
    const a = ww.findByEmail("x@y.de");
    expect(a.regionen).toEqual(["hamburg"]);
  });

  it("löscht ein Abo", () => {
    ww.abonnieren("del@me.de", ["berlin"]);
    ww.abmelden("del@me.de");
    expect(ww.findByEmail("del@me.de")).toBeNull();
    expect(ww.size()).toBe(0);
  });
});
