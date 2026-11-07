import { readFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { checkEvidenceContract } from './evidence-contract.mjs';

export function documentationErrors(body, changedFiles) {
    const errors = [];
    if (!changedFiles.includes('CHANGELOG.md')) errors.push('Update CHANGELOG.md in this PR.');
    for (const title of ['Changes', 'Validation', 'Compatibility', 'Limitations', 'References']) {
        const section = body?.match(new RegExp(`^## ${title}\\s*\\n([\\s\\S]*?)(?=^## |$(?![\\s\\S]))`, 'm'))?.[1]?.trim();
        if (!section || section.length < 15 || /^(Describe |List batch |Document remaining |Link issues )/.test(section)) {
            errors.push(`Complete the ${title} section with actual evidence.`);
        }
    }
    return errors;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const event = JSON.parse(await readFile(process.env.GITHUB_EVENT_PATH, 'utf8'));
    if (!event.pull_request) throw new Error('Documentation check requires a pull_request event.');
    const { base, head, body } = event.pull_request;
    const files = execFileSync('git', ['diff', '--name-only', `${base.sha}...${head.sha}`], { encoding: 'utf8' }).trim().split(/\r?\n/);
    const errors = documentationErrors(body, files);
    errors.push(...await checkEvidenceContract());
    const changelog = await readFile('CHANGELOG.md', 'utf8');
    if (!/^## Unreleased\s*$/m.test(changelog)) errors.push('Keep an Unreleased changelog section.');
    if (errors.length) throw new Error(errors.join('\n'));
    console.log('Documentation structure and changelog update passed; accuracy still requires review.');
}
