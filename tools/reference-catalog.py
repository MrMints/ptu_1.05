"""Inventory local references without copying their contents into Git."""
from pathlib import Path
from pypdf import PdfReader
import argparse
import hashlib
import json

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--check', action='store_true', help='Check physical facts without overwriting review metadata')
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]
sources = root / 'Core System'
dest = root / 'docs/data/references.json'
previous = json.loads(dest.read_text(encoding='utf-8')) if dest.exists() else {}
reviewed = {entry['path']: entry for entry in previous.get('documents', [])}
entries, checksums = [], {}
for path in sorted(sources.rglob('*')):
    if not path.is_file() or path.suffix.lower() not in ['.pdf', '.txt']:
        continue
    relative = path.relative_to(sources).as_posix()
    checksum = hashlib.sha256(path.read_bytes()).hexdigest()
    entry = dict(reviewed.get(relative, {'role': 'reference', 'authority': 'pending-review'}))
    if entry.get('sha256') and entry['sha256'] != checksum:
        raise ValueError(f'{relative}: source changed; review authority/evidence before refreshing inventory')
    entry.update(path=relative, sha256=checksum)
    entry.pop('duplicateOf', None)
    if path.suffix.lower() == '.pdf':
        entry['pdfPages'] = len(PdfReader(path).pages)
    if checksum in checksums:
        entry['duplicateOf'] = checksums[checksum]
    else:
        checksums[checksum] = relative
    if relative not in reviewed:
        if relative == 'Pokemon Tabletop United 1.05 Core.pdf':
            entry.update(role='standard-baseline', authority='owner-selected')
        elif relative.startswith('1.05 Errata/'):
            entry.update(role='optional-revisions', authority='owner-selected')
    entries.append(entry)
catalog = {**previous, 'root': 'Core System', 'documents': entries}
catalog.setdefault('policy', 'Standard core is default. Optional revisions do not silently override it. Resolve overlapping Pokédex editions before verification.')
if args.check:
    if catalog != previous:
        raise ValueError('Physical inventory differs; review changes before updating references.json')
    print(f'Checked {len(entries)} documents; hashes, pages, duplicate relationships and review metadata preserved.')
else:
    missing = set(reviewed) - {entry['path'] for entry in entries}
    if missing:
        raise ValueError(f'Reviewed sources missing; refusing to discard metadata: {sorted(missing)}')
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(catalog, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    print(f'Cataloged {len(entries)} documents; original files and existing review metadata unchanged.')
