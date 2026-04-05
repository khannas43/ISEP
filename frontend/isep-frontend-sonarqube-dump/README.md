# SonarQube dump for isep-frontend

This folder contains the exported SonarQube project dump and a **machine-readable issues list** for fixing.

## Files

| File | Description |
|------|-------------|
| **issues-export.json** | Full issues from SonarQube API (`/api/issues/search`). Use for tooling or detailed lookup. |
| **issues-summary.txt** | Same issues in plain text: `severity \| rule \| file \| line \| message`. Use for scanning and fixing. |
| ***.pb** | Binary project dump from SonarQube (backup format). Not needed for fixing issues. |

## Issue counts by rule (from last export)

- **S6759** (110): Mark component props as read-only → use `Readonly<Props>` or `React.ComponentProps`
- **S6853** (63): Form label must be associated with control → use `htmlFor` + `id` on inputs
- **S7781** (24): Prefer `String#replaceAll()` over `String#replace()`
- **S3358** (17): Extract nested ternary into a variable or function
- **S7773** (16): Prefer `Number.parseInt()` over `parseInt()`
- **S3776** (8): Cognitive complexity too high → split function
- **S6479** (6): Do not use array index in React `key`
- Others: S7764, S7735, S4325, S1854, S3863, S1135 (TODO), S6822, S7721

## Refreshing the issues list

With SonarQube running at http://localhost:9010 and a valid token:

```bash
cd "/Users/sameerkhanna/Documents/Projects/DG Shipping/frontend"
curl -s -u "YOUR_TOKEN:" "http://localhost:9010/api/issues/search?projectKeys=isep-frontend&ps=500" -o isep-frontend-sonarqube-dump/issues-export.json
```

Then regenerate the summary (Python 3):

```bash
cd isep-frontend-sonarqube-dump
python3 -c "
import json
from collections import Counter
with open('issues-export.json') as f:
    issues = json.load(f).get('issues', [])
rules = Counter(i.get('rule') for i in issues)
with open('issues-summary.txt', 'w') as out:
    out.write('Total: %d\n\n' % len(issues))
    for r, c in rules.most_common():
        out.write('%s: %d\n' % (r, c))
    out.write('\n---\n\n')
    for i in issues:
        comp = (i.get('component') or '').split(':')[-1]
        out.write('%s|%s|%s|%s|%s\n' % (i.get('severity'), i.get('rule'), comp, i.get('line'), (i.get('message') or '').replace(chr(10), ' ')))
"
```

## Paths in this folder

All issue `file` paths are relative to the **frontend** root, e.g.:

- `src/app/dashboard/page.tsx`
- `src/lib/api.ts`

So the actual file on your Mac is:

`/Users/sameerkhanna/Documents/Projects/DG Shipping/frontend/src/app/dashboard/page.tsx`
