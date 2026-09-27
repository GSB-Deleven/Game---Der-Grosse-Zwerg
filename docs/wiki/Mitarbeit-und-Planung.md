# 🤝 Mitarbeit und Planung

| Werkzeug | Wofür |
|---|---|
| 💬 **Discussions** | lose Ideen, Wünsche der Kinder, neue Level, Fragen (Kategorie «Level-Ideen») |
| ✅ **Issues** | konkrete Aufgaben und Fehler, mit Vorlagen (🐞 Fehler, 💡 Idee, 🗺️ Neues Level) |
| 🤖 **@claude** | setzt ein Issue selbständig um und schlägt einen Pull Request vor |
| 🏁 **Milestones** | Etappen, z. B. «Version 1.0: Das ganze Abenteuer», «Stimmen und Klang», «Neue Abenteuer» |
| 🗂️ **Project-Board** | Überblick: Ideen → To do → In Arbeit → Prüfen → Erledigt |
| 🔀 **Pull Requests** | jede Änderung wird als PR vorgeschlagen und nach dem Mergen automatisch online gestellt |

---

## 💡 Von der Idee ins Spiel

1. **Idee festhalten:** in **Discussions → Level-Ideen** posten und besprechen (z. B. was sich Liv wünscht).
2. **Issue daraus machen:** in der Discussion auf **«Create issue from discussion»** oder direkt ein neues Issue mit einer Vorlage anlegen.
3. **Claude beauftragen:** im Issue-Text oder in einem Kommentar **`@claude`** schreiben, oder das Label **`claude`** setzen.
   Beispiel:
   > Im Dorf soll eine Katze herumlaufen, die man streicheln kann. Beim Streicheln gibt es ein Herz. @claude
4. **Claude arbeitet:** Nach wenigen Sekunden erscheint im Issue ein Kommentar «Claude Code is working…» mit einer Aufgabenliste.
   Claude liest den Code, setzt die Änderung auf einem eigenen Branch `claude/issue-<nr>-…` um und schreibt am Ende eine Zusammenfassung.
5. **Pull Request erstellen:** Im Kommentar steht ein Link **«Create a PR»**. Anklicken, dann **Create pull request**.
6. **Anschauen und mergen:** Im Pull Request unter **Files changed** die Änderung ansehen. Passt es: **Merge pull request**.
   Etwas ändern? Im Pull Request kommentieren, z. B. «@claude die Katze soll grau sein statt orange».
7. **Online:** 1–2 Minuten nach dem Mergen ist die neue Version unter
   [gsb-deleven.github.io/Game-Der_Grosse_Zwerg](https://gsb-deleven.github.io/Game-Der_Grosse_Zwerg/) spielbar.
   Die App auf dem Home-Bildschirm lädt sie beim nächsten Öffnen von selbst. Welche Version läuft, steht im Menü unten.
   Schreib im Pull Request «Closes #<nr>», dann schliesst sich das Issue beim Mergen automatisch.

### Tipps für gute Aufträge
- **Konkret beschreiben:** was, wo (Kapitel/Ort), wer (Figur), wie soll es aussehen oder klingen.
- **Ein Wunsch pro Issue**, grosse Ideen in mehrere Issues aufteilen.
- Kinderfreundlich bleibt Pflicht: kein Kampf, kein «Game Over», Wünsche als Bild. Claude hält sich daran.
- Ist etwas unklar, fragt Claude im Issue nach. Einfach mit `@claude …` antworten.
- Bilder helfen: Skizzen oder Fotos einfach ins Issue ziehen.

---

## ⚙️ Einrichtung (einmalig, erledigt)

| Schritt | Status |
|---|---|
| `main` als Standard-Branch | ✅ |
| GitHub Pages über GitHub Actions (Workflow `deploy.yml`) | ✅ |
| Wiki mit erster Seite, Abgleich aus `docs/wiki/` (Workflow `wiki.yml`) | ✅ |
| Claude GitHub App installiert, Secret `CLAUDE_CODE_OAUTH_TOKEN`, Workflow `claude.yml` | ✅ |
| Discussion-Kategorie «Level-Ideen» | ✅ |
| Milestones umbenennen/ergänzen, «Auto-add to project» im Board | optional, siehe unten |

### So wurde @claude eingerichtet (falls es neu gemacht werden muss)
1. Claude Code auf dem Mac installieren: `brew install --cask claude-code` (oder `curl -fsSL https://claude.ai/install.sh | bash`), neues Terminal öffnen.
2. Schlüssel holen: `claude setup-token`, im Browser mit dem Claude-Abo bestätigen, den Schlüssel `sk-ant-oat01-…` kopieren.
3. Auf GitHub: **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `CLAUDE_CODE_OAUTH_TOKEN`
   - Wert: der Schlüssel
   - Der Schlüssel geht im Terminal über zwei Zeilen. Ein mitkopierter Zeilenumbruch schadet nicht, der Workflow entfernt ihn.
4. Die Claude GitHub App für das Repository erlauben: https://github.com/apps/claude → Configure → Repository auswählen.
5. Test: in einem Issue `@claude Bitte antworte nur «Hallo»` schreiben.

**Wenn es nicht klappt:** Unter **Actions → Claude** den Lauf öffnen.
- «CLAUDE_CODE_OAUTH_TOKEN … is required»: Das Secret fehlt oder ist falsch benannt.
- «Invalid auth token»: Der Schlüssel ist abgelaufen oder unvollständig. Mit `claude setup-token` neu holen und das Secret aktualisieren (Stift-Symbol).
- Zur Fehlersuche kann in `.github/workflows/claude.yml` vorübergehend `show_full_output: true` ergänzt werden.

### Optional: Milestones und Project-Board
- **Issues → Milestones:** «Version 1.0: Das ganze Abenteuer» (alle bisherigen Issues), «Stimmen und Klang» (#11), «Neue Abenteuer».
- **Projects → Board → ⋯ → Workflows → Auto-add to project:** Filter `is:issue,pr is:open`. Dann landet jedes neue Issue von selbst auf dem Board.
