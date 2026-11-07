// Inert browser module. A trusted executor supplies host observations; JSON is not authority.
import {FEATURE_REVIEW_ADMITTED_CONTRACT as C, admittedCanonical as canonical, publicAdmittedPacketErrors, admittedIdentityErrors} from './feature-review-admitted-contract.mjs';

export const ACTION_GUARDS = Object.freeze({
    open: {open:1,'verify-private-segment-ack':1}, setup: {setup:1,'bootstrap-macro':1,'verify-private-macro-absence':1},
    grants:{grants:7}, 'parent-none':{'parent-none':1}, 'parent-observer':{'parent-observer':1},
    'pack-none':{'pack-none':1}, 'pack-observer':{'pack-observer':1}, begin:{begin:2}, finish:{finish:2},
    fresh:{fresh:1}, 'abort-review':{'abort-review':1}, cleanup:{cleanup:4},
    checkpoint:{checkpoint:1,export:1}, export:{export:1}, 'delete-macro':{'delete-macro':1},
    refresh:{'verify-private-segment-ack':1}, 'capture-dom':{'capture-dom':1}, close:{close:1}
});
for(const limits of Object.values(ACTION_GUARDS))Object.freeze(limits);
const gmActions = new Set(['setup','grants','parent-none','parent-observer','pack-none','pack-observer','fresh','cleanup','delete-macro']);
const hex = v => typeof v==='string' && /^[a-f0-9]{64}$/.test(v);
const emptyGlobalPrefixSha256='4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945';
const equal = (a,b) => canonical(a)===canonical(b);
const only = (v,fields) => v && typeof v==='object' && !Array.isArray(v) && equal(Object.keys(v).sort(),fields.sort());

/** Explicit nonsecret projection only. Never serialize a User document or its source. */
export function readNativeBrowserFacts() {
    const g=globalThis.game;
    if(g?.world?.id!==C.pin.world || g.world.title!==C.target.title || g.version!==C.pin.core || g.system?.id!=='ptu' || g.system.version!==C.pin.system)throw Error('STOP: browser target mismatch');
    if(!g.user || !g.socket?.connected || typeof g.socket.id!=='string' || !Number.isFinite(globalThis.performance?.timeOrigin))throw Error('STOP: browser session unavailable');
    const permissions=g.user.permissions, modules=g.settings.get('core','moduleConfiguration');
    if(!permissions || typeof permissions!=='object' || !modules || typeof modules!=='object')throw Error('STOP: browser permission/module facts unavailable');
    return {sessionId:`${performance.timeOrigin}:${g.socket.id}`,identity:{world:g.world.id,title:g.world.title,core:g.version,system:g.system.id,systemVersion:g.system.version,user:g.user.id,accounts:g.users.map(u=>({id:u.id,name:u.name,role:u.role})).sort((a,b)=>a.id.localeCompare(b.id))},
        schema:g.settings.get('ptu','worldSchemaVersion'),worldSystemVersion:g.settings.get('ptu','worldSystemVersion'),
        permissions:structuredClone(permissions),modules:structuredClone(modules)};
}

/** The executor must disarm in finally after ONE awaited logical action. No automatic renewal. */
export function createExecutionVerifier({mode='native',packet,packetSha256,readFacts,now=Date.now,monotonic}={}) {
    if(!['native','synthetic'].includes(mode) || publicAdmittedPacketErrors(packet).length || packet.mode!==mode || !hex(packetSha256))throw Error('STOP: verifier packet/mode invalid');
    if(mode==='native' && (readFacts!==undefined||now!==Date.now||monotonic!==undefined))throw Error('STOP: synthetic browser/clock provider cannot attest native facts');
    const monoClock=monotonic??(()=>performance.now());
    const observe=mode==='native'?readNativeBrowserFacts:readFacts;
    packet=structuredClone(packet);
    if(typeof observe!=='function')throw Error('STOP: browser observer required');
    let armed=null,lastWall=null,lastMono=null,firstFailure=null,failures=0;
    const seen=new Set();
    const globalPrefixes=new Map();
    const clock=()=>{
        const wall=now(),mono=monoClock();
        if(!Number.isSafeInteger(wall)||!Number.isFinite(mono)||lastWall!==null&&(wall<lastWall||mono<lastMono||Math.abs((wall-lastWall)-(mono-lastMono))>2000))throw Error('STOP: clock anomaly');
        lastWall=wall;lastMono=mono;return {wall,mono};
    };
    const fail=error=>{firstFailure??=`verifier-failure-${++failures}`;armed=null;throw error;};
    function armAction(witness) {
        try {
            if(armed)throw Error('STOP: overlapping action');
            const fields=['kind','mode','id','observedMs','expiresMs','boundaryMs','sessionId','principal','batch','packet','packetSha256','anchor','action','browserFacts','operatorRecordSha256','acknowledgement','macroAbsence','failureRef'];
            if(!only(witness,fields)||witness.kind!=='p05-operator-action-v1'||witness.mode!==mode||typeof witness.id!=='string'||!witness.id||seen.has(witness.id)||!Object.hasOwn(ACTION_GUARDS,witness.action)||!hex(witness.operatorRecordSha256))throw Error('STOP: invalid/replayed operator witness');
            const t=clock();
            if(![witness.observedMs,witness.expiresMs,witness.boundaryMs].every(Number.isSafeInteger)||witness.observedMs>t.wall||t.wall-witness.observedMs>60000||witness.expiresMs<=t.wall||witness.expiresMs>witness.observedMs+60000||witness.expiresMs>witness.boundaryMs)throw Error('STOP: expired/future operator observation');
            const live=observe();
            if(live?.then||!only(live,['sessionId','identity','schema','worldSystemVersion','permissions','modules'])||!live.permissions||typeof live.permissions!=='object'||Array.isArray(live.permissions)||!live.modules||typeof live.modules!=='object'||Array.isArray(live.modules)||!equal(live,witness.browserFacts)||live.sessionId!==witness.sessionId||admittedIdentityErrors(live.identity,{gm:gmActions.has(witness.action)}).length||live.identity.user!==packet.audience.userId||witness.principal!==live.identity.user||live.schema!==0.115||live.worldSystemVersion!=='4.4.3'||Object.values(live.modules).some(Boolean))throw Error('STOP: live browser facts changed/unavailable');
            const next=witness.packet;
            if(publicAdmittedPacketErrors(next).length||next.mode!==mode||next.batch!==packet.batch||next.audience.userId!==packet.audience.userId||witness.batch!==next.batch||!hex(witness.packetSha256)||!equal(witness.anchor,next.anchor))throw Error('STOP: action packet binding mismatch');
            const refresh=witness.action==='refresh';
            if(refresh?next.anchor.revision<=packet.anchor.revision||next.anchor.segmentId===packet.anchor.segmentId:!equal(next,packet)||witness.packetSha256!==packetSha256)throw Error('STOP: stale/forked action packet');
            const ack=witness.acknowledgement;
            const pair=(id,sha)=>id===null&&sha===null||typeof id==='string'&&id.length>0&&hex(sha);
            if(!only(ack,['packetSha256','checkpointSha256','revision','principal','precedingSegmentId','precedingSegmentSha256','globalPrefixSha256'])||ack.principal!==next.audience.userId||ack.packetSha256!==witness.packetSha256||ack.checkpointSha256!==next.anchor.checkpointSha256||ack.revision!==next.anchor.revision||!pair(ack.precedingSegmentId,ack.precedingSegmentSha256)||!hex(ack.globalPrefixSha256)||next.anchor.revision===0&&(ack.precedingSegmentId!==null||ack.globalPrefixSha256!==emptyGlobalPrefixSha256)||next.anchor.revision>0&&ack.globalPrefixSha256===emptyGlobalPrefixSha256||globalPrefixes.has(witness.packetSha256)&&globalPrefixes.get(witness.packetSha256)!==ack.globalPrefixSha256)throw Error('STOP: private acknowledgement missing or mismatched principal/prefix');
            if(witness.action==='setup') {
                const m=witness.macroAbsence;
                if(!only(m,['macroUuid','baselineSha256','observedMs','receiptSha256'])||m.macroUuid!==packet.baselineChecks.bootstrapMacroUuid||!hex(m.baselineSha256)||!hex(m.receiptSha256)||m.observedMs!==witness.observedMs)throw Error('STOP: exact private macro-absence receipt required');
            } else if(witness.macroAbsence!==null)throw Error('STOP: unexpected macro receipt');
            if(witness.failureRef!==firstFailure||firstFailure&&!['abort-review','cleanup','checkpoint','export','delete-macro','refresh','close'].includes(witness.action))throw Error('STOP: retained verifier failure requires explicit safe-action acknowledgement');
            seen.add(witness.id);globalPrefixes.set(witness.packetSha256,ack.globalPrefixSha256);armed={w:structuredClone(witness),startMono:t.mono,calls:{}};
        } catch(error) {return fail(error);}
    }
    function verifyExecution(context) {
        try {
            if(!armed)throw Error('STOP: action is not armed');
            const t=clock(),w=armed.w;
            if(t.wall>=w.expiresMs||t.wall>=w.boundaryMs||t.mono-armed.startMono>=w.expiresMs-w.observedMs)throw Error('STOP: action lease expired');
            const live=observe();
            if(!equal(live,w.browserFacts))throw Error('STOP: browser session/identity/permissions/runtime changed');
            if(!context||!equal(context.policy,C.policy)||!equal(context.gates,C.externalGates)||!equal(context.identity,live.identity)||context.batch!==w.batch||!equal(context.anchor,w.anchor)||!equal(context.baselineChecks,w.packet.baselineChecks))throw Error('STOP: controller context changed');
            const op=context.operation,limit=ACTION_GUARDS[w.action][op];
            if(!limit||(armed.calls[op]??0)>=limit)throw Error('STOP: unexpected/replayed nested guard');
            if(w.action==='setup'){const expected=['setup','bootstrap-macro','verify-private-macro-absence'][Object.values(armed.calls).reduce((a,b)=>a+b,0)];if(op!==expected)throw Error('STOP: reordered bootstrap guard');}
            if(w.action==='checkpoint'&&op==='export'&&!armed.calls.checkpoint)throw Error('STOP: checkpoint must precede export');
            if(w.action==='open'&&op==='verify-private-segment-ack'&&(!armed.calls.open||w.packet.anchor.revision===0))throw Error('STOP: reload acknowledgement is out of order');
            if(context.packetSha256!==w.packetSha256 && !(context.packetSha256===null&&['bootstrap-macro','verify-private-macro-absence'].includes(op)))throw Error('STOP: controller packet digest changed');
            if(op==='verify-private-macro-absence'&&(context.macroUuid!==w.macroAbsence?.macroUuid||context.macroId!==context.macroUuid?.split('.')[1]))throw Error('STOP: macro identity changed');
            if(op==='verify-private-segment-ack'&&(context.precedingSegmentId!==w.acknowledgement.precedingSegmentId||context.precedingSegmentSha256!==w.acknowledgement.precedingSegmentSha256))throw Error('STOP: segment acknowledgement mismatch');
            armed.calls[op]=(armed.calls[op]??0)+1;
            if(op==='verify-private-segment-ack'){packet=structuredClone(w.packet);packetSha256=w.packetSha256;}
            return undefined;
        } catch(error) {return fail(error);}
    }
    function disarm(){
        if(armed)try{
            const t=clock(),w=armed.w;
            if(t.wall>=w.expiresMs||t.wall>=w.boundaryMs||t.mono-armed.startMono>=w.expiresMs-w.observedMs)throw Error('STOP: action completion exceeded lease');
            const required={setup:3,grants:7,begin:2,finish:2,checkpoint:2,cleanup:2}[w.action]??1;
            if(Object.values(armed.calls).reduce((a,b)=>a+b,0)<required)throw Error('STOP: bounded action has incomplete guard observations');
        }catch(error){return fail(error);}
        const receipt={actionId:armed?.w.id??null,calls:structuredClone(armed?.calls??{}),failureRef:firstFailure};armed=null;return receipt;
    }
    return {verifyExecution,armAction,disarm};
}
