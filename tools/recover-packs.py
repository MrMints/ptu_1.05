"""Recover complete historical databases into a disposable cache, never live packs."""
import io
import json
from pathlib import Path
import subprocess
import tarfile

root = Path(__file__).resolve().parents[1]
ref = subprocess.check_output(['git', 'rev-parse', '7f2fec3^'], cwd=root, text=True).strip()
dest = root / '.cache' / 'recovery'
dest.mkdir(parents=True, exist_ok=True)
archive = subprocess.check_output(['git', 'archive', ref, 'packs'], cwd=root)
with tarfile.open(fileobj=io.BytesIO(archive)) as tar:
    tar.extractall(dest, filter='data')
edges_ref = subprocess.check_output(['git', 'rev-parse', 'cac202ab^'], cwd=root, text=True).strip()
edges_archive = subprocess.check_output(['git', 'archive', edges_ref, 'packs/poke-edges'], cwd=root)
with tarfile.open(fileobj=io.BytesIO(edges_archive)) as tar:
    tar.extractall(dest, filter='data')
report = {'repository': 'MrMints/ptu_1.05', 'commit': ref, 'overrides': {'poke-edges': edges_ref}, 'packs': []}
for pack in sorted((dest / 'packs').iterdir()):
    if not pack.is_dir():
        continue
    current = pack / 'CURRENT'
    valid = current.exists() and (pack / current.read_text().strip()).exists()
    report['packs'].append({'name': pack.name, 'manifestPresent': valid, 'tables': len(list(pack.glob('*.ldb')))})
(root / 'docs' / 'data').mkdir(parents=True, exist_ok=True)
(root / 'docs' / 'data' / 'recovery.json').write_text(json.dumps(report, indent=2) + '\n', encoding='utf-8')
print(json.dumps(report, indent=2))
