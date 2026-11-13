import {readFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {isExcludedContent,EXCLUDED_CONTENT} from '../src/util/content-scope.js';
export const hash = data => createHash('sha256').update(JSON.stringify(data)).digest('hex');
export async function readPackSources(manifest) {
    const rows=[];
    for(const pack of manifest.packs) for(const file of (await readdir(`packs/${pack.name}/_source`)).filter(x=>x.endsWith('.json')).sort()) {
        const path=`packs/${pack.name}/_source/${file}`,data=JSON.parse(await readFile(path,'utf8'));
        const identity=`${pack.name}.${data._id}`;
        rows.push({pack:pack.name,file,path,data,identity,contentHash:hash(data),included:!isExcludedContent(identity)});
    }
    return {rows,sourceFingerprint:hash(rows.map(({identity,contentHash})=>({identity,contentHash}))),policyFingerprint:hash(EXCLUDED_CONTENT)};
}
