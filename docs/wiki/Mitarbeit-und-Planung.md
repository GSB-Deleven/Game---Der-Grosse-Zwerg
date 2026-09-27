# 🤝 Mitarbeit und Planung

| Werkzeug | Wofür |
|---|---|
| 💬 **Discussions** | lose Ideen, Wünsche der Kinder, neue Level, Fragen |
| ✅ **Issues** | konkrete Aufgaben und Fehler, mit Vorlagen (Fehler, Idee, Neues Level) |
| 🏁 **Milestones** | Etappen, z. B. «Version 1.0: ganzes Spiel», «Stimmen», «Neue Abenteuer» |
| 🗂️ **Project-Board** | Überblick: Ideen → To do → In Arbeit → Prüfen → Erledigt |
| 🔀 **Pull Requests** | jede Änderung wird als PR vorgeschlagen und nach dem Mergen automatisch online gestellt |

## Von der Idee zum Spiel

1. Idee in **Discussions → Level-Ideen** posten und besprechen
2. Wenn klar ist, was gemacht werden soll: **«Create issue from discussion»**
3. Im Issue **@claude** schreiben oder das Label **claude** setzen
4. Claude antwortet im Issue, setzt die Änderung um und bereitet einen **Pull Request** vor
5. Pull Request anschauen und **mergen**
6. Das Issue schliesst sich automatisch, die Änderung ist 1 bis 2 Minuten später online

Zusätzlich schaut ein **geplanter Claude-Lauf** viermal am Tag (6, 12, 18 und 22 Uhr) nach offenen Issues mit dem Label **claude** und arbeitet sie ab, falls die Aktion nicht schon reagiert hat.

## Einmalige Einrichtung

- **Pages:** Settings → Pages → Source: *GitHub Actions*
- **Wiki:** einmal von Hand eine erste Seite anlegen, danach überträgt der Workflow alle Seiten aus `docs/wiki/`
- **Claude-Aktion:** Secret `CLAUDE_CODE_OAUTH_TOKEN` anlegen (im Terminal `claude setup-token`, dann Settings → Secrets and variables → Actions)
- **Milestones und Project:** unter *Issues → Milestones* und *Projects* anlegen
