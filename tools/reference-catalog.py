"""Inventory local references without copying their contents into Git."""
from pathlib import Path
from pypdf import PdfReader
import hashlib
import json

root = Path(__file__).resolve().parents[1]
sources = root / 'Core System'
entries = []
checksums = {}
for path in sorted(sources.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in ['.pdf', '.txt']:
        continue
    relative = path.relative_to(sources).as_posix()
    checksum = hashlib.sha256(path.read_bytes()).hexdigest()
    entry = {'path': relative, 'sha256': checksum, 'role': 'reference', 'authority': 'pending-review'}
    if path.suffix.lower() == '.pdf':
        entry['pdfPages'] = len(PdfReader(path).pages)
    if checksum in checksums:
        entry['duplicateOf'] = checksums[checksum]
    else:
        checksums[checksum] = relative
    if relative == 'Pokemon Tabletop United 1.05 Core.pdf':
        entry.update(role='standard-baseline', authority='owner-selected', verifiedSections=[{'topic':'skills','printedPages':[33,38,41,42,43,44,45,48,50], 'pdfPages':[33,38,41,42,43,44,45,48,50]}])
    elif relative.startswith('1.05 Errata/'):
        entry.update(role='optional-revisions', authority='owner-selected')
    entries.append(entry)
dest = root / 'docs/data/references.json'
dest.parent.mkdir(parents=True, exist_ok=True)
dest.write_text(json.dumps({'root':'Core System','policy':'Standard core is default. Optional revisions do not silently override it. Resolve overlapping Pokédex editions before verification.','documents':entries},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(f'Cataloged {len(entries)} documents; original files unchanged.')
