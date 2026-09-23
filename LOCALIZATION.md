# Text and language policy

English is the default browser language. All rendered text is routed through a presentation translation layer; Japanese text baked into original images is intentionally preserved. A language selector appears in the sidebar and in Save & settings (including mobile layouts). The preference is saved separately from game progress. Japanese is currently a partial draft translation, not a recovered original-language UI.

## Translation files

- `dist/locales/en.js`: generated English source catalog.
- `dist/locales/ja.js`: editable Japanese translations. Missing entries fall back to their source text.
- `text-catalog.json`: extracted text and source locations for translators. Includes UI, content names/descriptions, errors, battle messages and dynamic text templates. Extraction is conservative and can include internal labels; runtime coverage should be checked as new screens are added.
- `dist/i18n.js`: translation lookup, placeholder substitution, plain-text DOM rendering, fallback and language preference.

Catalog keys use the source phrase. Translate the value only. Preserve every `{p0}`, `{p1}`, etc. placeholder, but reorder them when the target language requires it. Do not insert HTML. Labels and accessibility attributes are translated through text APIs. Links, element IDs, action names, input values, numeric stats and simulation state are not translated. Text split by markup has separate entries; change the source markup when a translation requires a whole sentence rather than separately translated fragments.

For example:

```js
'Train · {p0} Mana': '強化・{p0}マナ'
```

`translateText` supports existing source-format battle messages without changing their stored English strings. That preserves older save/replay hashes. New structured content should keep stable IDs and source evidence separately from translated display text.

## Recovered Japanese story and skill text

Use records like the following, then call `resolveText(record)` at the display boundary:

```json
{
  "id": "story.example.line01",
  "source": {
    "locale": "ja",
    "text": "Original recovered text goes here",
    "evidence": "artifact and record identifier"
  },
  "translations": {
    "en": {
      "text": "English translation goes here",
      "status": "draft",
      "notes": "Record uncertain wording here"
    }
  }
}
```

An absent translation falls back to the exact source text. Retain source text and historical variants; do not overwrite them with English. Translation status is separate from whether the underlying gameplay data is historically verified. Artwork and audio remain original; subtitles and surrounding labels can use these same records.

## Development

Run `node work/extract_game_text.mjs` from the workspace root after adding text. It uses Acorn and LinkeDOM installed under `work/localization-tools` for development only; the browser game has no new external runtime dependency. It regenerates the English catalog and source index, leaving hand-edited Japanese translations untouched. Review catalog changes when wording changes because source phrases are keys.

Add additional languages by creating another locale module, registering it in `i18n.js`, adding it to the selectors and service-worker asset list. Update the service-worker cache version when shipping new catalogs. Never change the simulation rules version merely to translate text.

`untranslatedText()` exposes English fallbacks encountered during non-English rendering for coverage review. It is a development API, not telemetry. It stores nothing remotely.

Validation covers placeholder consistency, fallback, persistence, original-source records, unchanged saves/battle hashes, all seven main pages, protected user text, accessibility labels and HTML injection resistance. The DOM checks are automated functional checks; they are not a visual review of every Japanese screen or a completed translation review.
