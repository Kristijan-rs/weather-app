// src/wetterwarnungen.js

/**
 * Klasse zur Verwaltung von Wetterwarnungs-Abonnements (in-memory).
 * Später kann Persistenz (DB/API) ergänzt werden.
 */
export class WetterWarnungen {
  constructor() {
    /** @type {{ email: string, regionen: string[] }[]} */
    this.abonnements = [];
  }

  /** Primitive E-Mail-Validierung */
  static #isValidEmail(email) {
    if (typeof email !== "string") return false;
    const trimmed = email.trim();
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
    return re.test(trimmed);
  }

  /** Regionen normalisieren (trim, lowercase, unique) */
  static #normalizeRegionen(regionen) {
    if (!Array.isArray(regionen)) {
      throw new TypeError("regionen muss ein Array von Strings sein.");
    }
    const cleaned = regionen
      .map((r) => (typeof r === "string" ? r.trim() : ""))
      .filter((r) => r.length > 0)
      .map((r) => r.toLowerCase());
    return [...new Set(cleaned)];
  }

  /** Neues Abo hinzufügen oder erweitern */
  abonnieren(email, regionen) {
    if (!WetterWarnungen.#isValidEmail(email)) {
      throw new Error("Ungültige E-Mail-Adresse.");
    }
    const norm = WetterWarnungen.#normalizeRegionen(regionen);
    if (norm.length === 0) {
      throw new Error("Mindestens eine gültige Region angeben.");
    }

    const idx = this.abonnements.findIndex(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );

    if (idx === -1) {
      this.abonnements.push({ email: email.trim(), regionen: norm });
    } else {
      const merged = [...new Set([...this.abonnements[idx].regionen, ...norm])];
      this.abonnements[idx].regionen = merged;
    }
  }

  /** Alle Abos zurückgeben */
  getAbonnements() {
    return this.abonnements.map((a) => ({
      email: a.email,
      regionen: [...a.regionen],
    }));
  }

  /** Abo nach E-Mail finden */
  findByEmail(email) {
    if (!WetterWarnungen.#isValidEmail(email)) return null;
    const found = this.abonnements.find(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );
    return found ? { email: found.email, regionen: [...found.regionen] } : null;
  }

  /** Regionen eines Abos ersetzen */
  updateRegionen(email, regionen) {
    if (!WetterWarnungen.#isValidEmail(email)) {
      throw new Error("Ungültige E-Mail-Adresse.");
    }
    const idx = this.abonnements.findIndex(
      (a) => a.email.toLowerCase() === email.toLowerCase()
    );
    if (idx === -1) throw new Error("Abo nicht gefunden.");
    this.abonnements[idx].regionen = WetterWarnungen.#normalizeRegionen(regionen);
  }

  /** Abo abmelden (löschen) */
  abmelden(email) {
    if (!WetterWarnungen.#isValidEmail(email)) {
      throw new Error("Ungültige E-Mail-Adresse.");
    }
    this.abonnements = this.abonnements.filter(
      (a) => a.email.toLowerCase() !== email.toLowerCase()
    );
  }

  /** Anzahl der Abos */
  size() {
    return this.abonnements.length;
  }

  /** Alle Abos löschen (z. B. für Tests) */
  clear() {
    this.abonnements = [];
  }
}

export default WetterWarnungen;
