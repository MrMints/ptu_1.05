import http from 'node:http';
import net from 'node:net';
import {Transform} from 'node:stream';
import {createHash, randomBytes} from 'node:crypto';


/**
 * Nonpersistent policy for an already-signed local Foundry baseline.
 * No backend-initiated networking, subprocess or Worker is admitted.
 * Existing accepted TCP sockets keep their write/end behavior; listening is
 * governed separately by createLoopbackListen. This is not an OS sandbox.
 * Injected module objects make inert zero-dispatch testing possible.
 */
export function installBackendNoOutbound({modules, globals, processObject, denied = () => {}, syncExports = () => {}}) {
    const restorations = [], coverage = [];
    const block = label => function () {
        denied({operation:label,decision:'denied-before-dispatch'});
        throw new Error('Sandbox backend operation prohibited: '+label);
    };
    const patch = (object,key,label,{required = true, accessor = false, replacement = null, status = 'blocked'} = {}) => {
        if (!object || !Object.hasOwn(object,key)) {
            if(required)throw new Error('Required backend policy surface missing: '+label);
            coverage.push({operation:label,status:'not-present'});return;
        }
        const descriptor=Object.getOwnPropertyDescriptor(object,key);
        const data=Object.hasOwn(descriptor,'value');
        if((data&&(typeof descriptor.value!=='function'||(!descriptor.writable&&!descriptor.configurable)))||(!data&&(!accessor||!descriptor.configurable)))throw new Error('Unsupported policy descriptor: '+label);
        Object.defineProperty(object,key,data?{...descriptor,value:replacement??block(label)}:{configurable:descriptor.configurable,enumerable:descriptor.enumerable,writable:true,value:replacement??block(label)});
        restorations.push(()=>Object.defineProperty(object,key,descriptor));
        coverage.push({operation:label,status});
    };
    try {
        patch(modules.net.Socket.prototype,'connect','net.Socket.connect');
        for(const key of ['connect','createConnection'])patch(modules.net,key,'net.'+key);
        patch(modules.tls,'connect','tls.connect');
        for(const name of ['http','https'])for(const key of ['request','get'])patch(modules[name],key,name+'.'+key);
        patch(modules.http2,'connect','http2.connect');
        patch(globals,'fetch','global.fetch');
        for(const key of ['WebSocket','EventSource'])patch(globals,key,'global.'+key,{required:false,accessor:true});
        // Node's explicit listen host path uses lookup even for an IPv4 literal.
        // Answer only that exact local-literal/all callback shape without DNS.
        patch(modules.dns,'lookup','dns.lookup',{status:'local-literal-only',replacement:function(host,options,callback){
            const descriptors=options&&typeof options==='object'&&(Object.getPrototypeOf(options)===Object.prototype||Object.getPrototypeOf(options)===null)?Object.getOwnPropertyDescriptors(options):null;
            if(host!=='127.0.0.1'||typeof callback!=='function'||!descriptors||Reflect.ownKeys(descriptors).length!==1||!Object.hasOwn(descriptors,'all')||!Object.hasOwn(descriptors.all,'value')||descriptors.all.value!==true)return block('dns.lookup').call(this);
            queueMicrotask(()=>callback(null,[{address:'127.0.0.1',family:4}]));
        }});
        patch(modules.dns.promises,'lookup','dns.promises.lookup',{required:false});
        for(const key of ['lookupService','reverse','resolve','resolve4','resolve6','resolveAny','resolveCaa','resolveCname','resolveMx','resolveNaptr','resolveNs','resolvePtr','resolveSoa','resolveSrv','resolveTxt','Resolver']) {
            patch(modules.dns,key,'dns.'+key,{required:false});
            patch(modules.dns.promises,key,'dns.promises.'+key,{required:false});
        }
        patch(modules.dgram,'createSocket','dgram.createSocket');
        for(const key of ['bind','connect','send'])patch(modules.dgram.Socket.prototype,key,'dgram.Socket.'+key);
        for(const key of ['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork'])patch(modules.childProcess,key,'child_process.'+key);
        patch(modules.childProcess.ChildProcess?.prototype,'spawn','child_process.ChildProcess.spawn');
        patch(modules.workerThreads,'Worker','worker_threads.Worker');
        patch(modules.cluster,'fork','cluster.fork');
        patch(modules.inspector,'open','inspector.open');
        const descriptor=Object.getOwnPropertyDescriptor(processObject,'binding');
        if(!descriptor?.writable||typeof descriptor.value!=='function')throw new Error('Unsupported process binding surface');
        const original=descriptor.value, deniedBindings=new Set(['tcp_wrap','udp_wrap','pipe_wrap','cares_wrap','tls_wrap','http2','process_wrap','spawn_sync']);
        Object.defineProperty(processObject,'binding',{...descriptor,value:function(name,...args){
            if(typeof name!=='string'||deniedBindings.has(name))return block('process.binding network/process launch').call(this);
            return Reflect.apply(original,this,[name,...args]);
        }});
        restorations.push(()=>Object.defineProperty(processObject,'binding',descriptor));
        coverage.push({operation:'process.binding network/process launch',status:'blocked'});
        syncExports();
        return {coverage, restoreForTests(){for(const restore of restorations.reverse())restore();syncExports();}};
    } catch(error) {
        // Partial installation is not permission to execute the application.
        for(const restore of restorations.reverse())restore();
        syncExports();throw error;
    }
}

import {once} from 'node:events';
import {isAbsolute, relative, sep, resolve} from 'node:path';
import {lstat, realpath} from 'node:fs/promises';

/** No DNS aliases, credentials, alternate spellings, or remote authorities. */
export function localSandboxURL(raw, port) {
    if (!Number.isInteger(port) || port < 1024 || port > 65535 || typeof raw !== 'string') return null;
    if (!raw.startsWith(`http://127.0.0.1:${port}/`) && !raw.startsWith(`ws://127.0.0.1:${port}/`)) return null;
    if (/[\\\u0000-\u0020\u007f]/.test(raw)) return null;
    try {
        const url = new URL(raw);
        if (url.hostname !== '127.0.0.1' || url.port !== String(port) || url.username || url.password || url.hash) return null;
        return url;
    } catch { return null; }
}

export async function requireOwnedPath(root, child, {mustExist = true} = {}) {
    root = resolve(root); child = resolve(child);
    const part = relative(root, child);
    if (!part || part === '..' || part.startsWith('..' + sep) || isAbsolute(part)) throw new Error('Path is not an owned child.');
    if (await realpath(root) !== root) throw new Error('Root is not canonical.');
    let current = root;
    for (const piece of part.split(sep)) {
        current = resolve(current, piece);
        try {
            const stat = await lstat(current);
            if (stat.isSymbolicLink()) throw new Error('Linked path is forbidden.');
        } catch (error) {
            if (error.code === 'ENOENT' && !mustExist) return child;
            throw error;
        }
    }
    return child;
}

export function browserLaunchOptions({executablePath, userDataDir, proxyPort}) {
    if (!isAbsolute(executablePath) || !isAbsolute(userDataDir)) throw new Error('Absolute owned paths required.');
    if (!Number.isInteger(proxyPort) || proxyPort < 1024 || proxyPort > 65535) throw new Error('Invalid proxy port.');
    return {
        executablePath, userDataDir, pipe: true, headless: true, timeout: 30000,
        handleSIGINT: false, handleSIGTERM: false, handleSIGHUP: false,
        args: [
            `--proxy-server=http://127.0.0.1:${proxyPort}`,
            '--proxy-bypass-list=<-loopback>',
            '--disable-quic', '--disable-background-networking', '--disable-component-update',
            '--disable-sync', '--no-first-run', '--disable-default-apps', '--disable-extensions',
            '--force-webrtc-ip-handling-policy=disable_non_proxied_udp'
        ]
    };
}

/** Validate the exact generated argument vector, without relaxing browser defaults. */
export function validateBrowserLaunchPlan({executablePath, args, expectedExecutable, profile, defaultProfile, proxyPort}) {
    if(executablePath!==expectedExecutable || !isAbsolute(profile) || !isAbsolute(defaultProfile) || resolve(profile).toLowerCase()===resolve(defaultProfile).toLowerCase())throw new Error('Browser executable/profile identity');
    if(!Array.isArray(args)||args.length>128||JSON.stringify(args).length>8192||args.some(x=>typeof x!=='string'||/[\r\n\0]/.test(x)))throw new Error('Browser argument shape');
    const exact=(prefix,value)=>{const matches=args.filter(x=>x.startsWith(prefix));if(matches.length!==1||matches[0]!==value)throw new Error('Ambiguous browser argument: '+prefix);};
    exact('--user-data-dir', '--user-data-dir='+profile);
    exact('--remote-debugging', '--remote-debugging-pipe');
    exact('--proxy-server', '--proxy-server=http://127.0.0.1:'+proxyPort);
    exact('--proxy-bypass-list','--proxy-bypass-list=<-loopback>');
    for(const flag of ['--disable-quic','--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--disable-default-apps','--disable-extensions','--force-webrtc-ip-handling-policy=disable_non_proxied_udp'])if(!args.includes(flag))throw new Error('Missing browser restriction: '+flag);
    if(args.some(x=>/^--(?:no-sandbox|disable-web-security|ignore-certificate|no-proxy-server|proxy-pac-url|profile-directory|remote-allow-origins)/.test(x)))throw new Error('Forbidden browser override');
    return {executablePath, args:[...args], profile, defaultProfile, pipe:true};
}

/** Attach at resource acquisition, before any asynchronous use. Never ignore errors. */
export function observeOwnedErrors(emitter, role, report, destroy = () => {}) {
    if(!emitter||typeof emitter.on!=='function'||typeof report!=='function')throw new Error('Invalid owned error observer');
    emitter.on('error', error => {
        report({role, code:String(error?.code??''), message:String(error?.message??error)});
        try{destroy();}catch(error){report({role:role+'-cleanup',code:String(error?.code??''),message:String(error?.message??error)});}
    });
    return emitter;
}

/** Await the public controller API before validating any launch argument. */
export async function prepareBrowserLaunchPlan({controller, options, expectedExecutable, profile, defaultProfile, proxyPort}) {
    if(typeof controller?.defaultArgs!=='function'||!Array.isArray(options?.args)||options.userDataDir!==profile)throw new Error('Browser public API/options');
    const launchOptions=Object.freeze({...options,args:Object.freeze([...options.args])});
    const generatedArgs=await controller.defaultArgs(launchOptions);
    const plan=validateBrowserLaunchPlan({executablePath:launchOptions.executablePath,expectedExecutable,args:generatedArgs,profile,defaultProfile,proxyPort});
    Object.freeze(plan.args);
    return {options:launchOptions,plan};
}

/** Keep the supported launch abort signal and settlement observable for cleanup. */
export function beginOwnedBrowserLaunch({launch, options}) {
    const controller=new AbortController();let settled=false,browser=null;
    const promise=Promise.resolve().then(()=>launch({...options,signal:controller.signal})).then(value=>{browser=value;settled=true;return value;},error=>{settled=true;throw error;});
    promise.catch(()=>{}); // Observed again by the owning work and cleanup paths.
    return {promise,get settled(){return settled;},get aborted(){return controller.signal.aborted;},get browser(){return browser;},abort(reason){controller.abort(reason);}};
}

/** One guarded Chrome spawn, instrumented before Puppeteer receives its streams. */
export function installBrowserSpawnGuard({childProcess, plan, onSpawn, onError}) {
    const original=childProcess.spawn, originalExecSync=childProcess.execSync;
    let child=null, launched=false, resolveClosed;const closed=new Promise(resolve=>{resolveClosed=resolve;});const lifecycle={spawned:false,processClosed:false,stdio:{}};
    const wrapped=function(executable,args,options){
        if(launched||executable!==plan.executablePath||JSON.stringify(args)!==JSON.stringify(plan.args)||options?.shell||options?.windowsVerbatimArguments)throw new Error('Browser spawn differs from validated plan');
        if(plan.environment&&Object.entries(plan.environment).some(([key,value])=>options?.env?.[key]!==value))throw new Error('Browser environment differs from validated plan');
        launched=true;
        child=Reflect.apply(original,this,[executable,args,options]);
        lifecycle.spawned=true;lifecycle.pid=child.pid;
        observeOwnedErrors(child,'chrome-process',onError,()=>child.kill());
        child.on('close',(code,signal)=>{lifecycle.processClosed=true;lifecycle.exitCode=code;lifecycle.signal=signal;resolveClosed({code,signal});});
        for(const [index,stream] of child.stdio.entries())if(stream){
            const state=lifecycle.stdio[index]={eof:false,closed:false,errorCount:0};
            observeOwnedErrors(stream,'chrome-stdio-'+index,row=>{state.errorCount++;onError(row);},()=>child.kill());
            stream.on('end',()=>{state.eof=true;});stream.on('close',()=>{state.closed=true;});
        }
        onSpawn({pid:child.pid,executablePath:executable,args:[...args]});
        return child;
    };
    childProcess.spawn=wrapped;
    const noShell=()=>{onError({role:'chrome-shell-cleanup-blocked',code:'SHELL_NOT_ADMITTED',message:'Use captured child termination and the owned Job watchdog'});throw new Error('Browser shell cleanup is not admitted');};
    childProcess.execSync=noShell;
    return {lifecycle,closed,get child(){return child;},restore({launchSettled=false}={}){if(!launchSettled||(child&&!lifecycle.processClosed))throw new Error('Browser launch/closure unresolved; keep guards installed');if(childProcess.spawn!==wrapped||childProcess.execSync!==noShell)throw new Error('Browser guards changed');childProcess.spawn=original;childProcess.execSync=originalExecSync;}};
}

/** Privacy-safe diagnostic classification only; never an eligibility decision. */
export function proxyDenialContext({handler,method,rawTarget,hostHeader,upgradeHeader,sandboxPort,reason}) {
    if(!['http','connect','upgrade'].includes(handler)||!['CONNECT_NOT_ADMITTED','TARGET_NOT_ELIGIBLE','HTTP_PROTOCOL_NOT_ADMITTED','UPGRADE_HEADER_NOT_WEBSOCKET'].includes(reason))throw new Error('Invalid denial diagnostic category');
    const raw=typeof rawTarget==='string'?rawTarget:'';
    const bounded=raw.slice(0,16384),owned='127.0.0.1:'+sandboxPort;
    let targetForm='other',authority='',url=null;
    if(raw==='*')targetForm='asterisk';
    else if(/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(bounded)){
        targetForm='absolute';authority=bounded.slice(bounded.indexOf('://')+3).split(/[/?#]/,1)[0];
        if(raw.length<=16384)try{url=new URL(raw);}catch{}
    }else if(/^\/(?!\/)/.test(bounded))targetForm='origin';
    else if(/^[^/?#\s]+:\d+$/.test(bounded)){
        targetForm='authority';authority=bounded;
        if(raw.length<=16384)try{url=new URL('http://'+raw);}catch{}
    }
    const exactOwnedAuthority=authority===owned;
    const scheme=url?(['http:','ws:','https:','wss:'].includes(url.protocol)?url.protocol:'other'):'unparsed';
    const host=url?(url.hostname==='127.0.0.1'?'127.0.0.1':'non-owned-redacted'):'unparsed';
    const port=url&&/^\d{1,5}$/.test(url.port)?url.port:url?'default':'unparsed';
    return Object.freeze({handler,method:typeof method==='string'&&/^[A-Z]{1,24}$/.test(method)?method:'other',
        targetForm,targetLength:raw.length,targetSHA256:createHash('sha256').update(bounded).digest('hex'),targetHashTruncated:bounded.length!==raw.length,
        scheme,host,port,exactOwnedAuthority,parsedOwnedEndpoint:!!url&&url.hostname==='127.0.0.1'&&url.port===String(sandboxPort),
        substringOnly:raw.includes(owned)&&!exactOwnedAuthority,credentialsPresent:!!url&&!!(url.username||url.password),
        hostHeaderClass:typeof hostHeader!=='string'?(hostHeader===undefined?'missing':'invalid'):hostHeader===owned?'exact-owned':'non-owned-redacted',
        upgradeClass:typeof upgradeHeader!=='string'?(upgradeHeader===undefined?'missing':'invalid'):upgradeHeader.toLowerCase()==='websocket'?'websocket':'other',
        reason,dnsDispatched:false,upstreamDispatched:false});
}

/** Per-client decisions are latched before replies or upstream dispatch. */
export function createProxyClientLedger({record, onFailure, recordDenial = () => {}}) {
    const states=new WeakMap(),pendingPromises=new Set();let serial=0,pending=0;
    const fatal=row=>{record({...row,fatal:true,classification:'fatal'});onFailure(row);};
    const observe=socket=>{
        let state=states.get(socket);if(state)return state;
        state={connectionId:++serial,requests:0,denied:false,everForwarded:false,intendedOwned:false,closed:false,closure:null};states.set(socket,state);
        socket.on('close',()=>{state.closed=true;if(state.closure){clearTimeout(state.closure.timer);state.closure.evidence.status='closed';state.closure.resolve();pendingPromises.delete(state.closure.promise);state.closure=null;pending--;}});
        return state;
    };
    const begin=socket=>{const state=observe(socket);state.requests++;state.denied=false;};
    const deny=(socket,{intendedOwned=false,context=null}={})=>{
        const state=observe(socket);state.denied=true;state.intendedOwned ||= intendedOwned;
        const denial=context?Object.freeze({...context,connectionId:state.connectionId,requestOrdinal:state.requests,priorForwarding:state.everForwarded}):null;
        if(denial)recordDenial(denial); // Retain before any failure callback or rejection response.
        if(intendedOwned)fatal({role:'proxy-owned-endpoint-denied',code:'OWNED_ENDPOINT_DENIED',message:'Policy denied an intended owned endpoint',connectionId:state.connectionId,...(denial?{denial}: {})});
    };
    const forward=socket=>{const state=observe(socket);state.everForwarded=true;state.denied=false;};
    const error=(socket,row)=>{
        const state=observe(socket);
        const detail={...row,connectionId:state.connectionId,requests:state.requests,denied:state.denied,everForwarded:state.everForwarded,intendedOwned:state.intendedOwned};
        if(!['proxy-client-socket','proxy-http-request','proxy-http-response','proxy-connect-request','proxy-upgrade-request','proxy-http-parser'].includes(row.role)||state.requests!==1||!state.denied||state.everForwarded||state.intendedOwned||!['ECONNRESET','EPIPE'].includes(row.code)){fatal(detail);return;}
        // Only this exact, explicitly denied, never-forwarded client can qualify.
        // Resource closure is an independently required, bounded part of that decision.
        const closure=state.closure?.evidence??{status:state.closed?'closed':'pending'};
        const event={...detail,fatal:false,classification:'denied-client-policy-closure',closure};record(event);
        if(!state.closed&&!state.closure){
            pending++;let resolve;const promise=new Promise(r=>{resolve=r;});pendingPromises.add(promise);
            const timer=setTimeout(()=>{
                state.closure=null;pending--;pendingPromises.delete(promise);resolve();closure.status='deadline';
                fatal({...detail,role:'proxy-denied-client-closure',code:'CLOSE_DEADLINE',message:'Denied client did not close within one second'});
                socket.destroy();
            },1000);timer.unref();state.closure={timer,evidence:closure,resolve,promise};
        }
        socket.destroy();
    };
    return {observe,begin,deny,forward,error,settleClosures:()=>Promise.all([...pendingPromises]),get pendingClosures(){return pending;}};
}


/** Exact authority validation occurs before ownership checks or socket creation. */
export function validateOwnedConnectRequest(req, port = 30091) {
    const authority = '127.0.0.1:' + port;
    if (port !== 30091 || req?.method !== 'CONNECT' || req.url !== authority ||
        req.httpVersion !== '1.1' || !Array.isArray(req.rawHeaders) ||
        req.rawHeaders.length > 128 || req.rawHeaders.length % 2) return false;
    let hosts = 0, bytes = 0;
    for (let i = 0; i < req.rawHeaders.length; i += 2) {
        const name = req.rawHeaders[i], value = req.rawHeaders[i + 1];
        if (typeof name !== 'string' || typeof value !== 'string' ||
            !/^[!#$%&'*+.^_\x60|~0-9A-Za-z-]+$/.test(name) || /[\r\n\0]/.test(value)) return false;
        bytes += Buffer.byteLength(name) + Buffer.byteLength(value);
        if (bytes > 16384) return false;
        const lower = name.toLowerCase();
        if (lower === 'host') { hosts++; if (value !== authority) return false; }
        if (['authorization', 'proxy-authorization', 'forwarded', 'x-forwarded-host',
            'content-length', 'transfer-encoding', 'upgrade'].includes(lower)) return false;
    }
    return hosts === 1 && req.headers?.host === authority;
}

export const OWNED_CONNECT_LIMITS = Object.freeze({
    connectMs: 3000, lifetimeMs: 1200000, closeMs: 1000,
    headBytes: 65536, chunkBytes: 65536, bufferedBytes: 262144,
    directionBytes: 33554432, aggregateBytes: 134217728,
    concurrent: 4, sessions: 32, records: 16
});

/** A fresh challenge over the captured child IPC, with no new network endpoint. */
export function createOwnedListenerVerifier({getChild, getInitialProof, owner,
    challengeFactory = () => randomBytes(16).toString('hex'),
    timers = {setTimeout, clearTimeout}}) {
    return () => new Promise((resolve, reject) => {
        const child = getChild(), initial = getInitialProof();
        const addressOK = a => a?.address === '127.0.0.1' && a.family === 'IPv4' && a.port === 30091;
        const live = () => getChild() === child && child?.connected === true && !child.killed &&
            child.exitCode === null && child.signalCode === null && child.pid === initial?.pid;
        if (!initial || initial.owner !== owner || !addressOK(initial.address) || !live() ||
            !Number.isSafeInteger(child.pid) || child.pid <= 0 || !/^[0-9a-f-]{32,64}$/.test(owner)) {
            reject(new Error('Owned listener is not live')); return;
        }
        const challenge = challengeFactory();
        if (typeof challenge !== 'string' || !/^[0-9a-f]{32}$/.test(challenge)) {
            reject(new Error('Invalid owned listener challenge')); return;
        }
        let settled = false, timer;
        const finish = (error, value) => {
            if (settled) return;
            settled = true; timers.clearTimeout(timer);
            for (const [event, listener] of [['message', message], ['exit', exited],
                ['error', errored], ['disconnect', disconnected]]) child.removeListener(event, listener);
            error ? reject(error) : resolve(value);
        };
        const exited = () => finish(new Error('Owned listener process exited'));
        const errored = () => finish(new Error('Owned listener IPC failed'));
        const disconnected = () => finish(new Error('Owned listener IPC disconnected'));
        const message = value => {
            if (value?.type !== 'ptu-listener-proof' || value.challenge !== challenge) return;
            if (value.owner !== owner || value.pid !== child.pid || !addressOK(value.address) || !live()) {
                finish(new Error('Current listener challenge mismatch')); return;
            }
            finish(null, {pid: value.pid, token: owner, address: '127.0.0.1', family: 'IPv4', port: 30091});
        };
        timer = timers.setTimeout(() => finish(new Error('Owned listener challenge deadline')), 1000);
        child.on('message', message); child.once('exit', exited); child.once('error', errored);
        child.once('disconnect', disconnected);
        try { child.send({type: 'ptu-listener-proof', challenge, owner}, error => { if (error) errored(); }); }
        catch { errored(); }
    });
}

/** Reply only from the adapter's captured, currently listening server. */
export function replyToOwnedListenerChallenge({message, owner, pid, listener, connected, send, onError}) {
    if (message?.type !== 'ptu-listener-proof' || message.owner !== owner ||
        typeof message.challenge !== 'string' || !/^[0-9a-f]{32}$/.test(message.challenge) ||
        !listener?.listening || connected !== true) return false;
    const address = listener.address();
    if (address?.address !== '127.0.0.1' || address.family !== 'IPv4' || address.port !== 30091) return false;
    try { send({type: 'ptu-listener-proof', challenge: message.challenge, owner, pid, address},
        error => { if (error) onError(error); }); }
    catch (error) { onError(error); }
    return true;
}

/** Independent owned resources are all attempted even when one closure rejects. */
export async function closeOwnedProxyResources({tunnels, upstreams, sockets, server, clients}) {
    const errors = [];
    const attempt = async action => { try { await action(); } catch (error) { errors.push(error); } };
    await attempt(() => tunnels.close());
    for (const request of upstreams) await attempt(() => request.destroy());
    for (const socket of sockets) await attempt(() => socket.destroy());
    await attempt(() => server.listening ? new Promise((resolve, reject) =>
        server.close(error => error ? reject(error) : resolve())) : undefined);
    await attempt(() => clients.settleClosures());
    if (clients.pendingClosures) errors.push(new Error('Denied client closure remains pending'));
    if (errors.length === 1) throw errors[0];
    if (errors.length) throw new AggregateError(errors, 'Owned proxy cleanup failed');
}

/**
 * Opt-in fixed-destination transport. The caller supplies fresh proof from its
 * captured owned listener, never a browser-supplied destination or proof.
 * This does not claim to inspect the tunneled protocol or create an OS firewall.
 */
export function createOwnedConnectManager({
    verifyOwnedListener, onFailure = () => {}, onForward = () => {},
    socketFactory = () => new net.Socket({allowHalfOpen: true}),
    limits: requested = OWNED_CONNECT_LIMITS
}) {
    const limits = {};
    for (const [key, maximum] of Object.entries(OWNED_CONNECT_LIMITS)) {
        const value = requested[key] ?? maximum;
        if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new Error('Invalid CONNECT bound: ' + key);
        limits[key] = value;
    }
    Object.freeze(limits);
    const active = new Set(), owned = new WeakSet(), records = [];
    const counts = {attempts: 0, connected: 0, closed: 0, active: 0, omittedRecords: 0,
        clientToUpstreamBytes: 0, upstreamToClientBytes: 0, dnsCalls: 0, unverifiedClosures: 0};
    let stopping = false;
    const validProof = proof => proof && Number.isSafeInteger(proof.pid) && proof.pid > 0 &&
        typeof proof.token === 'string' && /^[0-9a-f-]{32,64}$/.test(proof.token) &&
        proof.address === '127.0.0.1' && proof.family === 'IPv4' && proof.port === 30091;

    const handle = (req, client, head) => {
        if (!validateOwnedConnectRequest(req) || typeof verifyOwnedListener !== 'function') return false;
        if (stopping || active.size >= limits.concurrent || counts.attempts >= limits.sessions) {
            onFailure({role:'proxy-connect-tunnel',code:'CONNECT_ADMISSION_BOUND',message:'CONNECT session/concurrency bound'});
            client.destroy(); return true;
        }
        owned.add(client); client.pause();
        const row = {id: ++counts.attempts, phase: 'ownership', startedAt: new Date().toISOString(),
            connected: false, initialBytes: Buffer.isBuffer(head) ? head.length : 0, clientToUpstreamBytes: 0,
            upstreamToClientBytes: 0, dnsCalls: 0, ownerChecks: 0, reason: null};
        let peer = null, up = null, down = null, settled = false, failed = false;
        let clientClosed = client.closed === true, peerClosed = true, connectTimer, lifeTimer, closeTimer;
        let resolveDone, rejectDone;
        const done = new Promise((resolve,reject) => { resolveDone = resolve; rejectDone = reject; });
        done.catch(()=>{});
        const state = {done, stop: () => finishPair('owner-close')};
        active.add(state); counts.active = active.size;
        const finalize = () => {
            if (settled || !clientClosed || !peerClosed) return;
            settled = true; clearTimeout(connectTimer); clearTimeout(lifeTimer); clearTimeout(closeTimer);
            row.phase = 'closed'; row.finishedAt = new Date().toISOString();
            row.clientClosed = true; row.upstreamClosed = true;
            active.delete(state); counts.active = active.size; counts.closed++;
            if (records.length < limits.records) records.push(Object.freeze({...row}));
            else counts.omittedRecords++;
            resolveDone();
        };
        const armClosureDeadline = () => {
            if(settled||closeTimer)return;
            closeTimer=setTimeout(()=>{
                if(clientClosed&&peerClosed){finalize();return;}
                settled=true;clearTimeout(connectTimer);clearTimeout(lifeTimer);
                row.phase='closure-unverified';row.reason='CONNECT_CLOSE_DEADLINE';
                row.clientClosed=clientClosed;row.upstreamClosed=peerClosed;
                counts.unverifiedClosures++;stopping=true;
                if(records.length<limits.records)records.push(Object.freeze({...row}));else counts.omittedRecords++;
                onFailure({role:'proxy-connect-tunnel',code:'CONNECT_CLOSE_DEADLINE',message:'Owned CONNECT pair closure not established',tunnelId:row.id});
                rejectDone(new Error('Owned CONNECT pair closure not established'));
            },limits.closeMs);
        };
        const finishPair = reason => {
            row.reason ??= reason;
            armClosureDeadline();
            client.destroy(); peer?.destroy(); up?.destroy(); down?.destroy();
            if (client.destroyed && clientClosed) finalize();
        };
        const fail = (code, error) => {
            if (!failed && !settled) {
                failed = true; row.reason = code;
                onFailure({role: 'proxy-connect-tunnel', code, message: String(error?.message ?? code).slice(0, 512),
                    tunnelId: row.id});
            }
            finishPair(code);
        };
        const closing = side => {
            if (side === 'client') clientClosed = true; else peerClosed = true;
            const closedStream = side === 'client' ? client : peer;
            if (!row.reason && !failed && !stopping &&
                (!row.connected || !closedStream?.readableEnded)) {
                fail('CONNECT_PREMATURE_CLOSE'); return;
            }
            if (clientClosed && peerClosed) { finalize(); return; }
            // Flush already queued bytes before bounded counterpart termination.
            const other = side === 'client' ? peer : client;
            if(other&&!other.destroyed){
                if(!row.connected||row.reason||failed)other.destroy();
                else if(!(side==='client'?client:peer).readableEnded)fail('CONNECT_PREMATURE_CLOSE');
                // On ordinary EOF, the pipes drain their transforms before ending peers.
            }
            armClosureDeadline();
        };
        client.on('error', error => fail('CONNECT_CLIENT_ERROR', error));
        client.once('close', () => closing('client'));
        connectTimer = setTimeout(() => fail('CONNECT_NEGOTIATION_DEADLINE'), limits.connectMs);
        lifeTimer = setTimeout(() => fail('CONNECT_LIFETIME_DEADLINE'), limits.lifetimeMs);
        const count = (direction, chunk) => {
            if (!Buffer.isBuffer(chunk) || chunk.length > limits.chunkBytes) throw new Error('CONNECT chunk bound');
            const aggregate = counts.clientToUpstreamBytes + counts.upstreamToClientBytes + chunk.length;
            if (row[direction] + chunk.length > limits.directionBytes || aggregate > limits.aggregateBytes) throw new Error('CONNECT byte bound');
            for (const stream of [client, peer, up, down]) if (stream &&
                (stream.readableLength ?? 0) + (stream.writableLength ?? 0) > limits.bufferedBytes) throw new Error('CONNECT buffer bound');
            row[direction] += chunk.length; counts[direction] += chunk.length;
        };
        const counter = direction => {
            const stream = new Transform({
                readableHighWaterMark: limits.chunkBytes, writableHighWaterMark: limits.chunkBytes,
                transform(chunk, _encoding, callback) {
                    try { count(direction, chunk); callback(null, chunk); }
                    catch (error) { callback(error); }
                }
            });
            stream.on('error', error => fail('CONNECT_STREAM_ERROR', error));
            return stream;
        };
        const proof = async previous => {
            const value = await verifyOwnedListener();
            if (!validProof(value) || (previous && (value.pid !== previous.pid || value.token !== previous.token)))
                throw new Error('Current owned listener proof invalid');
            row.ownerChecks++; row.ownedPID = value.pid;
            return value;
        };
        const work = async () => {
            if (stopping || counts.attempts > limits.sessions || active.size > limits.concurrent ||
                !Buffer.isBuffer(head) || head.length > limits.headBytes || client.readableLength > limits.bufferedBytes)
                throw new Error('CONNECT admission bound');
            const owner = await proof();
            if (settled || failed || clientClosed || client.destroyed || stopping) return;
            peer = socketFactory(); peerClosed = false; peer.pause();
            peer.on('error', error => fail('CONNECT_UPSTREAM_ERROR', error));
            peer.once('close', () => closing('upstream'));
            peer.once('end', () => { if(!row.connected)fail('CONNECT_UPSTREAM_EOF_BEFORE_SUCCESS'); });
            peer.once('connect', () => {
                (async () => {
                    if (settled || failed || clientClosed || client.destroyed || stopping) return;
                    if (peer.remoteAddress !== '127.0.0.1' || peer.remotePort !== 30091) throw new Error('CONNECT peer identity');
                    await proof(owner);
                    if (settled || failed || clientClosed || client.destroyed || peerClosed || stopping) return;
                    if(peer.readableEnded)throw new Error('CONNECT upstream ended before success');
                    clearTimeout(connectTimer); row.phase = 'tunnel'; row.connected = true;
                    counts.connected++; onForward();
                    up = counter('clientToUpstreamBytes'); down = counter('upstreamToClientBytes');
                    // The 200 response is queued before any upstream data is admitted.
                    const responseReady = client.write('HTTP/1.1 200 Connection Established\r\n\r\n');
                    const startDown = () => { if (!failed && !settled) peer.pipe(down).pipe(client); };
                    if (responseReady) startDown(); else client.once('drain', startDown);
                    // Initial buffered bytes precede subsequently received client bytes.
                    if (head.length) count('clientToUpstreamBytes', head);
                    const headReady = !head.length || peer.write(head);
                    const startUp = () => { if (!failed && !settled) client.pipe(up).pipe(peer); };
                    if (headReady) startUp(); else peer.once('drain', startUp);
                })().catch(error => fail('CONNECT_NEGOTIATION_FAILED', error));
            });
            peer.connect({host: '127.0.0.1', port: 30091, family: 4, autoSelectFamily: false,
                lookup: (_host, _options, callback) => {
                    counts.dnsCalls++; row.dnsCalls++; const error = new Error('CONNECT DNS forbidden');
                    callback(error); fail('CONNECT_DNS_FORBIDDEN', error);
                }});
        };
        work().catch(error => fail('CONNECT_ADMISSION_FAILED', error));
        if (client.destroyed) fail('CONNECT_PREMATURE_CLOSE');
        return true;
    };
    return {handle, owns: socket => owned.has(socket), counts, records, limits,
        async close() {
            stopping = true;
            const pending = [...active];
            for (const state of pending) state.stop();
            await Promise.all(pending.map(state => state.done));
            if (active.size) throw new Error('CONNECT pair closure remains pending');
        }
    };
}

/**
 * A session-owned HTTP/WS proxy whose only possible upstream is the owned
 * loopback Foundry port. No DIRECT fallback; CONNECT requires fresh owned proof.
 * All browser HTTP(S)/WS(S) uses this proxy, including child targets/workers.
 * It is not an OS network sandbox or protection against a compromised browser.
 */
export async function startLocalOnlyProxy({sandboxPort, proxyPort, onFailure = () => {}, verifyOwnedListener = null}) {
    if (![sandboxPort, proxyPort].every(p => Number.isInteger(p) && p >= 1024 && p <= 65535) || sandboxPort === proxyPort) throw new Error('Distinct valid ports required.');
    const sockets=new Set(), upstreams=new Set(), observed=new WeakSet();
    const counts={httpAllowed:0,websocketAllowed:0,blocked:0,errorCount:0,fatalErrorCount:0,policyClosureCount:0,omittedErrors:0,denialCount:0,omittedDenials:0}, errors=[],denials=[];
    const record=row=>{
        counts.errorCount++;if(row.fatal)counts.fatalErrorCount++;else counts.policyClosureCount++;
        row.code=String(row.code).slice(0,80);row.message=String(row.message).slice(0,512);
        if(errors.length<16)errors.push(row);else counts.omittedErrors++;
    };
    const report=row=>{record({...row,fatal:true,classification:'fatal'});onFailure(row);};
    const clients=createProxyClientLedger({record,onFailure,recordDenial:row=>{counts.denialCount++;if(denials.length<16)denials.push(row);else counts.omittedDenials++;}});
    const tunnels=createOwnedConnectManager({verifyOwnedListener,onFailure:report,onForward:()=>{counts.connectAllowed=(counts.connectAllowed??0)+1;}});
    const clientError=(socket,row)=>{if(!tunnels.owns(socket))clients.error(socket,row);};
    const watch=(emitter,role,destroy,socket=null)=>observeOwnedErrors(emitter,role,socket?row=>clientError(socket,row):report,destroy);
    const trackSocket=(socket,role)=>{
        if(observed.has(socket))return;
        observed.add(socket);sockets.add(socket);
        if(role==='proxy-client-socket')clients.observe(socket);
        watch(socket,role,()=>socket.destroy(),role==='proxy-client-socket'?socket:null);
        socket.on('close',()=>sockets.delete(socket));
    };
    const intendedOwned=raw=>typeof raw==='string'&&raw.includes('127.0.0.1:'+sandboxPort);
    const denialContext=(req,handler,reason)=>proxyDenialContext({handler,reason,method:req.method,rawTarget:req.url,hostHeader:req.headers.host,upgradeHeader:req.headers.upgrade,sandboxPort});
    const headers=incoming=>{const result={...incoming,host:`127.0.0.1:${sandboxPort}`};delete result['proxy-authorization'];delete result['proxy-connection'];return result;};
    const server=http.createServer((req,res)=>{
        let upstream;clients.begin(req.socket);
        watch(req,'proxy-http-request',()=>{req.destroy();res.destroy();upstream?.destroy();},req.socket);
        watch(res,'proxy-http-response',()=>{req.destroy();res.destroy();upstream?.destroy();},req.socket);
        const url=localSandboxURL(req.url,sandboxPort);
        if(!url||url.protocol!=='http:'){clients.deny(req.socket,{intendedOwned:intendedOwned(req.url),context:denialContext(req,'http',!url?'TARGET_NOT_ELIGIBLE':'HTTP_PROTOCOL_NOT_ADMITTED')});counts.blocked++;res.writeHead(403,{'Connection':'close'});res.end('Local sandbox only');return;}
        clients.forward(req.socket);counts.httpAllowed++;
        upstream=http.request({host:'127.0.0.1',port:sandboxPort,method:req.method,path:url.pathname+url.search,headers:headers(req.headers)},reply=>{
            watch(reply,'proxy-upstream-response',()=>{reply.destroy();res.destroy();});
            res.writeHead(reply.statusCode,reply.headers);reply.pipe(res);
        });
        upstreams.add(upstream);upstream.on('close',()=>upstreams.delete(upstream));
        watch(upstream,'proxy-http-upstream',()=>{upstream.destroy();if(!res.destroyed){if(!res.headersSent)res.writeHead(502);res.end();}});
        upstream.on('socket',socket=>trackSocket(socket,'proxy-http-upstream-socket'));
        req.on('aborted',()=>upstream.destroy());res.on('close',()=>upstream.destroy());req.pipe(upstream);
    });
    watch(server,'proxy-server',()=>{for(const s of sockets)s.destroy();});
    server.on('connection',socket=>trackSocket(socket,'proxy-client-socket'));
    server.on('connect',(req,socket,head)=>{
        clients.begin(socket);
        if(sandboxPort===30091 && tunnels.handle(req,socket,head))return;
        watch(req,'proxy-connect-request',()=>socket.destroy(),socket);
        clients.deny(socket,{intendedOwned:intendedOwned(req.url),context:denialContext(req,'connect','CONNECT_NOT_ADMITTED')});counts.blocked++;socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
    });
    server.on('upgrade',(req,socket,head)=>{
        clients.begin(socket);watch(req,'proxy-upgrade-request',()=>socket.destroy(),socket);
        const url=localSandboxURL(req.url,sandboxPort);
        if(!url||!['http:','ws:'].includes(url.protocol)||req.headers.upgrade?.toLowerCase()!=='websocket'){
            clients.deny(socket,{intendedOwned:intendedOwned(req.url),context:denialContext(req,'upgrade',!url||!['http:','ws:'].includes(url.protocol)?'TARGET_NOT_ELIGIBLE':'UPGRADE_HEADER_NOT_WEBSOCKET')});counts.blocked++;socket.end('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');return;
        }
        clients.forward(socket);
        const upstream=http.request({host:'127.0.0.1',port:sandboxPort,method:'GET',path:url.pathname+url.search,headers:headers(req.headers)});
        upstreams.add(upstream);upstream.on('close',()=>upstreams.delete(upstream));
        watch(upstream,'proxy-upgrade-upstream',()=>{upstream.destroy();socket.destroy();});
        upstream.on('socket',peer=>trackSocket(peer,'proxy-upgrade-upstream-socket'));
        upstream.on('response',reply=>{watch(reply,'proxy-upgrade-rejected-response',()=>reply.destroy());reply.resume();socket.destroy();});
        upstream.on('upgrade',(reply,backend,backendHead)=>{
            trackSocket(backend,'proxy-websocket-backend');
            watch(reply,'proxy-upgrade-response',()=>{backend.destroy();socket.destroy();});
            // Pair-close handlers precede the first writes or piping.
            socket.on('close',()=>backend.destroy());backend.on('close',()=>socket.destroy());
            const responseHeaders=Object.entries(reply.headers).flatMap(([name,values])=>(Array.isArray(values)?values:[values]).map(value=>`${name}: ${value}`));
            if(reply.statusCode!==101||responseHeaders.some(line=>/[\r\n]/.test(line))){backend.destroy();socket.destroy();return;}
            counts.websocketAllowed++;
            socket.write('HTTP/1.1 101 Switching Protocols\r\n'+responseHeaders.join('\r\n')+'\r\n\r\n');
            if(head.length)backend.write(head);if(backendHead.length)socket.write(backendHead);
            socket.pipe(backend);backend.pipe(socket);
        });
        socket.on('close',()=>upstream.destroy());upstream.end();
    });
    server.on('clientError',(error,socket)=>{clientError(socket,{role:'proxy-http-parser',code:String(error.code??''),message:String(error.message)});socket.destroy();});
    server.listen(proxyPort,'127.0.0.1');await once(server,'listening');
    return {address:server.address(),counts,errors,denials,tunnelCounts:tunnels.counts,tunnelRecords:tunnels.records,
        async close(){
            await closeOwnedProxyResources({tunnels, upstreams, sockets, server, clients});
        }
    };
}

/** Run only after the approved bootstrap has verified the owned native page. */
export async function checkNativeFixture(page, {runId, origin, servedHugePowerSHA256}) {
    if (!/^p05-[a-z0-9-]{12,80}$/.test(runId) || !localSandboxURL(origin + '/', Number(new URL(origin).port))) throw new Error('Invalid native run identity.');
    const evaluate = async (phase, actorId = null) => page.evaluate(async ({phase, actorId, runId, origin, servedHugePowerSHA256}) => {
        const assert = (condition, message) => { if (!condition) throw new Error(message); };
        assert(location.origin === origin, 'Unexpected native origin');
        assert(game.ready && game.system.id === 'ptu' && game.version === '13.351' && game.user.isGM, 'Native runtime/GM prerequisites not ready');
        const hp = await import(origin + '/systems/ptu/src/util/huge-power.js');
        const tables = await import(origin + '/systems/ptu/src/util/huge-power-bindings.js');
        assert(hp.HUGE_POWER_ENABLED === false && ['HUGE_POWER_ADMISSIONS','HUGE_POWER_CONTRIBUTORS','HUGE_POWER_PREPARATIONS'].every(key => Array.isArray(tables[key]) && Object.isFrozen(tables[key]) && tables[key].length === 0), 'Production tables are not frozen/empty/inactive');
        const response = await fetch(origin + '/systems/ptu/src/util/huge-power.js', {cache:'no-store'});
        assert(response.ok && new URL(response.url).origin === origin, 'Served source unavailable');
        const bytes = await response.arrayBuffer();
        const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(v => v.toString(16).padStart(2,'0')).join('');
        assert(digest === servedHugePowerSHA256, 'Served source identity changed');
        const marker = 'p05SandboxRun';
        let actor;
        try {
            if (phase === 'create') {
                actor = await CONFIG.Actor.documentClass.create({
                    name: 'P05 sandbox synthetic Pokémon', type:'pokemon',
                    flags:{ptu:{[marker]:runId}},
                    items:[{name:'P05 sandbox synthetic species',type:'species',system:{
                        stats:{hp:10,atk:10,def:10,spatk:10,spdef:10,spd:10},types:['Untyped'],
                        abilities:{basic:[],advanced:[],high:[]},rules:[]
                    }}]
                });
                assert(actor, 'Actor creation returned no Document');
                actorId=actor.id;
                await actor.update({'system.nickname':'P05 save/reload fixture'});
            } else {
                actor=game.actors.get(actorId);
            }
            assert(actor && actor.getFlag('ptu',marker)===runId, 'Missing owned fixture');
            assert(actor instanceof CONFIG.Actor.documentClass && actor.type==='pokemon', 'Not a native configured Pokemon Document');
            actor.prepareData();
            assert(actor.validate({strict:true}) !== false, 'Actor validation failed');
            const items=actor.items.contents;
            assert(items.length===1 && items[0].type==='species', 'Unexpected embedded content');
            const species=items[0];
            assert(species instanceof CONFIG.Item.documentClass && species.validate({strict:true})!==false, 'Species native validation failed');
            assert(actor.effects.size===0 && species.effects.size===0 && species.system.rules.length===0, 'Unexpected effects/rules');
            assert(['basic','advanced','high'].every(key=>species.system.abilities[key].length===0), 'Unexpected abilities');
            assert(hp.inspectHugePower(actor)===null, 'Unexpected Huge Power context');
            const stats=Object.fromEntries(['hp','atk','def','spatk','spdef','spd'].map(key=>[key,actor.system.stats[key].total]));
            assert(Object.values(stats).every(Number.isFinite), 'Nonfinite ordinary stats');
            const cool=actor.system.contests.stats.cool;
            const contribution=Math.min(Math.floor(stats.atk/10),3);
            assert(cool.stats.value===contribution, 'Cool stat contribution differs');
            assert(cool.stats.total===Math.min(contribution+cool.stats.mod,3), 'Cool total differs');
            assert(cool.dice===cool.stats.total+cool.poffins.total+actor.system.contests.voltage.value, 'Cool dice differs');
            assert(cool.stats.mod===0 && cool.poffins.total===0 && actor.system.contests.voltage.value===0, 'Unexpected nonzero contest inputs');
            assert(actor.system.nickname==='P05 save/reload fixture', 'Persisted nickname differs');
            return {ok:true,actorId:actor.id,speciesId:species.id,runId,actorClass:actor.constructor.name,systemClass:actor.system.constructor.name,speciesClass:species.constructor.name,stats,cool:{contribution:cool.stats.value,total:cool.stats.total,dice:cool.dice},speciesStats:species.system.stats,nickname:actor.system.nickname,hugePowerEnabled:false,servedSourceSHA256:digest};
        } catch(error) {
            const raw=String(error.message),errorText=raw.slice(0,1000);
            return {ok:false,actorId:actorId??actor?.id??null,runId,error:errorText,errorAccounting:{observedChars:raw.length,omittedChars:raw.length-errorText.length}};
        }
    }, {phase,actorId,runId,origin,servedHugePowerSHA256});
    let actorId=null, before=null, after=null, cleanup=null, error=null, errorAccounting=null;
    try {
        before=await evaluate('create');actorId=before.actorId;
        if (!before.ok) throw new Error(before.error);
        await page.reload({waitUntil:'domcontentloaded',timeout:60000}); // The single planned reload.
        await page.waitForFunction(() => globalThis.game?.ready, {timeout:60000});
        after=await evaluate('reload',actorId);
        if (!after.ok) throw new Error(after.error);
        if (JSON.stringify(before)!==JSON.stringify(after)) throw new Error('Native fixture changed across reload.');
    } catch(e) {const raw=String(e.message);error=raw.slice(0,1000);errorAccounting={observedChars:raw.length,omittedChars:raw.length-error.length};}
    finally {
        if (actorId) {
            try {
                cleanup=await page.evaluate(async ({actorId,runId,origin})=>{
                    if(location.origin!==origin || !game.ready) throw new Error('Cleanup context unavailable');
                    const actor=game.actors.get(actorId);
                    if(!actor || actor.getFlag('ptu','p05SandboxRun')!==runId) throw new Error('Cleanup ownership mismatch');
                    await actor.delete();
                    return {deleted:!game.actors.has(actorId),actorId};
                },{actorId,runId,origin});
            } catch(e) {const raw=String(e.message),text=raw.slice(0,1000);cleanup={deleted:false,error:text,errorAccounting:{observedChars:raw.length,omittedChars:raw.length-text.length}};}
        }
    }
    return {ok:!error && cleanup?.deleted===true,before,after,cleanup,error,errorAccounting};
}

/** Protective adapter for the owned Foundry child, not an OS/network policy. */
export function createLoopbackListen(original, audit = () => {}) {
    if (typeof original !== 'function' || typeof audit !== 'function') throw new TypeError('Callable delegates required.');
    const reject = reason => { audit({accepted:false,reason}); throw new Error('Sandbox listener rejected: ' + reason); };
    const backlogOK = value => Number.isInteger(value) && value >= 0 && value <= 2147483647;
    return function (...input) {
        let args, signature;
        const callback = typeof input.at(-1) === 'function' ? input.pop() : null;
        if (input.length === 1 && input[0] && typeof input[0] === 'object') {
            const options=input[0], proto=Object.getPrototypeOf(options);
            if(proto!==Object.prototype && proto!==null) return reject('options prototype');
            const descriptors=Object.getOwnPropertyDescriptors(options);
            if(Reflect.ownKeys(descriptors).some(key=>typeof key!=='string'||!['port','host','backlog','exclusive','ipv6Only'].includes(key)||!Object.hasOwn(descriptors[key],'value'))) return reject('unsupported options');
            const values=Object.fromEntries(Object.entries(descriptors).map(([key,d])=>[key,d.value]));
            if(values.port!==30091 || (values.host!==undefined && typeof values.host!=='string') || (values.backlog!==undefined && !backlogOK(values.backlog)) || (values.exclusive!==undefined && typeof values.exclusive!=='boolean') || (values.ipv6Only!==undefined && values.ipv6Only!==false)) return reject('option value');
            args=[{...values,host:'127.0.0.1'}];signature='options';
        } else {
            if(input.shift()!==30091) return reject('port or non-TCP form');
            if(typeof input[0]==='string'||input[0]===undefined) input.shift();
            let backlog;
            if(input.length){backlog=input.shift();if(!backlogOK(backlog)) return reject('backlog');}
            if(input.length) return reject('unsupported positional form');
            args=[30091,'127.0.0.1'];if(backlog!==undefined)args.push(backlog);signature='positional';
        }
        if(callback)args.push(callback);
        audit({accepted:true,signature,port:30091,host:'127.0.0.1'});
        return Reflect.apply(original,this,args);
    };
}

// Frozen before native execution from matrix-v1-oracle-source.json (9c39c265).
// Stat order: hp, atk, def, spatk, spdef, spd. Contest order: cool, tough, beauty, smart, cute.
const freezeMatrix = value => { if (value && typeof value === 'object') { for (const child of Object.values(value)) freezeMatrix(child); Object.freeze(value); } return value; };
export const NATIVE_MATRIX_V1 = freezeMatrix([
    {case:'base',nature:'Hardy',hpPoints:0,atkPoints:0,rule:null,enabled:null,stats:[10,10,10,10,10,10],contests:[1,1,1,1,1]},
    {case:'nature-allocation',nature:'Adamant',hpPoints:3,atkPoints:5,rule:null,enabled:null,stats:[13,17,10,8,10,10],contests:[1,1,0,1,1]},
    {case:'additive-enabled',nature:'Hardy',hpPoints:0,atkPoints:0,rule:12,enabled:true,stats:[10,22,10,10,10,10],contests:[2,1,1,1,1]},
    {case:'additive-disabled',nature:'Hardy',hpPoints:0,atkPoints:0,rule:12,enabled:false,stats:[10,10,10,10,10,10],contests:[1,1,1,1,1]},
    {case:'item-update',nature:'Hardy',hpPoints:0,atkPoints:0,rule:4,enabled:true,stats:[10,14,10,10,10,10],contests:[1,1,1,1,1],finalStats:[10,22,10,10,10,10],finalContests:[2,1,1,1,1]},
    {case:'enable-transitions',nature:'Hardy',hpPoints:0,atkPoints:0,rule:12,enabled:true,stats:[10,22,10,10,10,10],contests:[2,1,1,1,1],disabledStats:[10,10,10,10,10,10],disabledContests:[1,1,1,1,1]},
    {case:'repeat-unrelated',nature:'Hardy',hpPoints:0,atkPoints:0,rule:12,enabled:true,stats:[10,22,10,10,10,10],contests:[2,1,1,1,1]},
    {case:'combined-persistence',nature:'Adamant',hpPoints:3,atkPoints:5,rule:12,enabled:true,stats:[13,29,10,8,10,10],contests:[2,1,0,1,1]}
].map((spec,i)=>({...spec,actorId:'P05M1A'+String(i+1).padStart(10,'0'),speciesId:'P05M1S'+String(i+1).padStart(10,'0'),ruleId:spec.rule===null?null:'P05M1R'+String(i+1).padStart(10,'0')})));

// Corrective validation preserves V1 numbers and its failed direct-call receipt.
export const NATIVE_MATRIX_V2 = freezeMatrix(NATIVE_MATRIX_V1.map((spec,i)=>({...spec,actorId:'P05M2A'+String(i+1).padStart(10,'0'),speciesId:'P05M2S'+String(i+1).padStart(10,'0'),ruleId:spec.ruleId===null?null:'P05M2R'+String(i+1).padStart(10,'0')})));
export const NATIVE_MATRIX_TRAINER_V2 = 'P05M2T0000000001';
export const NATIVE_REFRESH_SOURCE_PINS = freezeMatrix({
    'src/module/actor/pokemon/document.js':'672dcf6d55961e84f7b285d9ac7fa79b7f4c7a7d066270b011c0b21cde8708a9',
    'src/scripts/hooks/trainer-pokemon-sync.js':'76cd952b3b7799e3d6b29c1aed76eeb614017cdd1941a922a3a11b8b2d856fa0'
});

/** Self-contained actual browser phase; also permits direct negative-fixture regression. */
export async function evaluateNativeMatrixPhase({phase,specs,runId,origin,servedHugePowerSHA256,trainerId,refreshSourcePins}) {
        const assert=(condition,message)=>{if(!condition)throw new Error(message);};
        const equal=(actual,expected,message)=>assert(JSON.stringify(actual)===JSON.stringify(expected),message+' expected='+JSON.stringify(expected)+' actual='+JSON.stringify(actual));
        assert(location.origin===origin&&game.ready&&game.system.id==='ptu'&&game.version==='13.351'&&game.user.isGM,'Matrix native context unavailable');
        const requireItems=(actor,spec)=>{
            assert(actor?.items,'Missing matrix Actor');
            const species=actor.items.get(spec.speciesId),item=spec.ruleId?actor.items.get(spec.ruleId):null;
            assert(species?.id===spec.speciesId,'Missing expected matrix Species');
            assert(spec.ruleId===null||item?.id===spec.ruleId,'Missing expected matrix rule Item');
            assert(actor.items.size===(spec.ruleId===null?1:2),'Matrix Item count differs from fixed fixture');
            return {species,item};
        };
        // Verify persisted identities before any reload-specific calculation/source lookup.
        if(phase==='reload')for(const spec of specs)requireItems(game.actors.get(spec.actorId),spec);
        if(phase==='create'&&(specs.some(spec=>game.actors.has(spec.actorId))||game.actors.has(trainerId)))return {ok:false,cleanupForbidden:true,error:'Preexisting matrix Actor; no creation or cleanup allowed',snapshots:[],stages:[]};
        const hp=await import(origin+'/systems/ptu/src/util/huge-power.js');
        const tables=await import(origin+'/systems/ptu/src/util/huge-power-bindings.js');
        assert(hp.HUGE_POWER_ENABLED===false&&['HUGE_POWER_ADMISSIONS','HUGE_POWER_CONTRIBUTORS','HUGE_POWER_PREPARATIONS'].every(k=>Array.isArray(tables[k])&&Object.isFrozen(tables[k])&&tables[k].length===0),'Production admission changed');
        const response=await fetch(origin+'/systems/ptu/src/util/huge-power.js',{cache:'no-store'});
        assert(response.ok&&new URL(response.url).origin===origin,'Matrix served source unavailable');
        const digest=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await response.arrayBuffer()))].map(v=>v.toString(16).padStart(2,'0')).join('');
        assert(digest===servedHugePowerSHA256,'Matrix source mismatch');
        assert(trainerId==='P05M2T0000000001','Unexpected Trainer identity');
        const expectedRefreshPaths=['src/module/actor/pokemon/document.js','src/scripts/hooks/trainer-pokemon-sync.js'];
        equal(Object.keys(refreshSourcePins??{}),expectedRefreshPaths,'Refresh source selection');
        for(const source of expectedRefreshPaths){
            const response=await fetch(origin+'/systems/ptu/'+source,{cache:'no-store'});
            assert(response.ok&&new URL(response.url).origin===origin,'Refresh source unavailable');
            const actual=[...new Uint8Array(await crypto.subtle.digest('SHA-256',await response.arrayBuffer()))].map(v=>v.toString(16).padStart(2,'0')).join('');
            assert(actual===refreshSourcePins[source],'Corrective served source mismatch: '+source);
        }
        const keys=['hp','atk','def','spatk','spdef','spd'],contestKeys=['cool','tough','beauty','smart','cute'];
        const snapshots=[],stages=[];let refreshEvidence=null;
        function observeRefresh(actor){
            const prior=Object.getOwnPropertyDescriptor(actor,'refreshPreparedData'),delegate=actor.refreshPreparedData;
            assert(actor.id==='P05M2A0000000007'&&actor.getFlag('ptu','p05SandboxRun')===runId&&typeof delegate==='function','Refresh observer ownership');
            assert(prior===undefined||(Object.hasOwn(prior,'value')&&prior.configurable),'Refresh observer descriptor');
            let calls=0,restored=false;
            function wrapper(...args){assert(this===actor,'Refresh observer receiver');calls++;assert(calls<=8,'Refresh call bound');return Reflect.apply(delegate,this,args);}
            Object.defineProperty(actor,'refreshPreparedData',{value:wrapper,writable:true,enumerable:false,configurable:true});
            return {count:()=>calls,restore(){
                if(restored)return;
                const current=Object.getOwnPropertyDescriptor(actor,'refreshPreparedData');
                assert(current?.value===wrapper&&current.writable===true&&current.enumerable===false&&current.configurable===true,'Refresh observer unexpectedly changed');
                if(prior)Object.defineProperty(actor,'refreshPreparedData',prior);else assert(Reflect.deleteProperty(actor,'refreshPreparedData'),'Refresh observer removal');
                const after=Object.getOwnPropertyDescriptor(actor,'refreshPreparedData');
                assert(prior?after.value===prior.value&&after.writable===prior.writable&&after.enumerable===prior.enumerable&&after.configurable===prior.configurable:after===undefined,'Refresh descriptor restoration');restored=true;
            }};
        }

        const sourceRule=value=>({key:'ActiveEffectLike',mode:'add',path:'system.modifiers.baseStats.atk.mod',value,phase:'applyAEs',label:'P05 ordinary additive fixture'});
        const verify=(actor,spec,{stats,contests,rule=spec.rule,enabled=spec.enabled,nickname='P05 matrix '+spec.case,stage})=>{
            assert(actor?.id===spec.actorId&&actor.getFlag('ptu','p05SandboxRun')===runId,'Matrix ownership mismatch');
            assert(actor instanceof CONFIG.Actor.documentClass&&actor.type==='pokemon'&&actor.validate({strict:true})!==false,'Invalid native matrix Actor');
            const {species,item}=requireItems(actor,spec);
            assert(species?.type==='species'&&species instanceof CONFIG.Item.documentClass&&species.validate({strict:true})!==false,'Matrix Species identity or validation');
            equal(keys.map(k=>species.system.stats[k]),[10,10,10,10,10,10],'Matrix species source stats changed');
            assert(actor.effects.size===0&&species.effects.size===0&&species.system.rules.length===0&&['basic','advanced','high'].every(k=>species.system.abilities[k].length===0),'Unexpected matrix effects/abilities');
            assert(hp.inspectHugePower(actor)===null,'Unexpected managed Huge Power context');
            equal(keys.map(k=>actor.system.stats[k].total),stats,'Matrix '+spec.case+' '+stage+' stats');
            const derived=contestKeys.map(k=>{const c=actor.system.contests.stats[k];assert(c.stats.mod===0&&c.poffins.total===0&&actor.system.contests.voltage.value===0,'Unexpected contest input');equal([c.stats.value,c.stats.total,c.dice],[contests[contestKeys.indexOf(k)],contests[contestKeys.indexOf(k)],contests[contestKeys.indexOf(k)]],'Matrix contest '+k);return c.dice;});
            equal(keys.map(k=>actor.system.stats[k].levelUp),[spec.hpPoints,spec.atkPoints,0,0,0,0],'Matrix allocated points changed');
            assert(actor.system.nature.value===spec.nature&&actor.system.nickname===nickname,'Matrix saved selection changed');
            assert(actor.getFlag('ptu','rulesSelections')?.p05MatrixCase===spec.case,'Matrix saved case selection changed');
            assert(actor.system.modifiers.baseStats.atk.total===(enabled?rule:0),'Matrix additive contribution mismatch');
            const saved=actor.toObject();
            equal(keys.map(k=>[saved.system.modifiers.baseStats[k].value,saved.system.modifiers.baseStats[k].mod]),keys.map(()=>[0,0]),'Saved base modifiers must remain unchanged');
            if(spec.case==='repeat-unrelated'&&stage!=='created'&&!stage.startsWith('refresh-'))assert(saved.flags.ptu.party?.trainer===trainerId,'Saved Trainer link missing');
            let ruleClass=null;
            if(item){
                assert(item instanceof CONFIG.Item.documentClass&&item.type==='feat'&&item.validate({strict:true})!==false&&item.effects.size===0,'Matrix RuleElement Item invalid');
                assert(item.system.enabled===enabled&&item.system.rules.length===1,'Matrix enabled state or source rule count');
                const source=item.toObject().system.rules[0];
                assert(source.key==='ActiveEffectLike'&&source.mode==='add'&&source.path==='system.modifiers.baseStats.atk.mod'&&source.value===rule&&source.phase==='applyAEs','Matrix source rule changed');
                assert(item.rules.length===1&&item.rules[0].invalid===false&&item.rules[0].ignored===!enabled,'Invalid or wrongly enabled native RuleElement');
                assert(actor.rules.length===(enabled?1:0),'Unexpected active RuleElement count');
                ruleClass=item.rules[0].constructor.name;assert(ruleClass==='AELikeRuleElement','Not actual additive RuleElement');
            }else assert(actor.rules.length===0,'Unexpected RuleElement');
            stages.push(JSON.stringify({case:spec.case,stage,stats:keys.map(k=>actor.system.stats[k].total),contests:derived,rule,enabled})); // Lossless compact JSON records keep receipts within the accepted caps.
            return {case:spec.case,actorId:actor.id,speciesId:species.id,ruleId:item?.id??null,actorClass:actor.constructor.name,speciesClass:species.constructor.name,ruleClass,stats,contests:derived,nature:actor.system.nature.value,points:[spec.hpPoints,spec.atkPoints],rule,enabled,nickname,selection:actor.getFlag('ptu','rulesSelections').p05MatrixCase};
        };
        try {
        let trainer;
        if(phase==='create')trainer=await CONFIG.Actor.documentClass.create({_id:trainerId,name:'P05 matrix owned Trainer',type:'character',flags:{ptu:{p05SandboxRun:runId}},system:{level:{milestones:0,miscexp:0}},items:[]},{keepId:true,renderSheet:false});
        else trainer=game.actors.get(trainerId);
        assert(trainer?.id===trainerId&&trainer.type==='character'&&trainer instanceof CONFIG.Actor.documentClass&&trainer.getFlag('ptu','p05SandboxRun')===runId&&trainer.items.size===0&&trainer.effects.size===0&&trainer.validate({strict:true})!==false,'Owned Trainer invalid');
        assert(trainer.toObject().system.level.milestones===(phase==='create'?0:1),'Trainer saved milestone mismatch');
        assert(!trainer.toObject().flags.ptu.starterTraining&&trainer.items.size===0&&trainer.system.dex.owned.length===0,'Unexpected starter-training or dex contribution');
        assert(trainer.system.level.current===(phase==='create'?1:2),'Trainer level oracle mismatch');
        for(const spec of specs){
            let actor;
            if(phase==='create'){
                const statInput=Object.fromEntries(keys.map(k=>[k,{levelUp:k==='hp'?spec.hpPoints:k==='atk'?spec.atkPoints:0,mod:{value:0,mod:0},stage:{value:0,mod:0}}]));
                const items=[{_id:spec.speciesId,name:'P05 matrix synthetic species',type:'species',system:{stats:{hp:10,atk:10,def:10,spatk:10,spdef:10,spd:10},types:['Untyped'],abilities:{basic:[],advanced:[],high:[]},rules:[]}}];
                if(spec.ruleId)items.push({_id:spec.ruleId,name:'P05 ordinary additive fixture',type:'feat',system:{enabled:spec.enabled,rules:[sourceRule(spec.rule)]}});
                actor=await CONFIG.Actor.documentClass.create({_id:spec.actorId,name:'P05 matrix '+spec.case,type:'pokemon',flags:{ptu:{p05SandboxRun:runId,rulesSelections:{p05MatrixCase:spec.case}}},system:{nickname:'P05 matrix '+spec.case,nature:{value:spec.nature},stats:statInput,modifiers:{baseStats:Object.fromEntries(keys.map(k=>[k,{value:0,mod:0}]))}},items},{keepId:true,keepEmbeddedIds:true,renderSheet:false});
                verify(actor,spec,{stats:spec.stats,contests:spec.contests,stage:'created'});
                if(spec.case==='item-update'){
                    await actor.items.get(spec.ruleId).update({'system.rules':[sourceRule(12)]});
                    verify(actor,spec,{stats:spec.finalStats,contests:spec.finalContests,rule:12,stage:'item-rule-updated'});
                }
                if(spec.case==='enable-transitions'){
                    await actor.items.get(spec.ruleId).toggleEnableState(false);
                    verify(actor,spec,{stats:spec.disabledStats,contests:spec.disabledContests,enabled:false,stage:'disabled'});
                    await actor.items.get(spec.ruleId).toggleEnableState(true);
                    verify(actor,spec,{stats:spec.stats,contests:spec.contests,stage:'reenabled'});
                }
                if(spec.case==='repeat-unrelated'){
                    const sourceBefore=JSON.stringify(actor.toObject()),observer=observeRefresh(actor);
                    refreshEvidence={phase:'updates',expectedRefreshCalls:5,observedRefreshCalls:0,explicit:null,party:null,trainer:null,unrelated:null,caps:[[5,6],[7,2],[9,4]],observerRestored:false,stage:'explicit'};
                    try {
                        for(let n=1;n<=3;n++){actor.refreshPreparedData();assert(observer.count()===n,'Explicit refresh call count');verify(actor,spec,{stats:spec.stats,contests:spec.contests,stage:'refresh-'+n});equal(JSON.stringify(actor.toObject()),sourceBefore,'Refresh mutated saved source');}
                        refreshEvidence.explicit=observer.count();refreshEvidence.stage='party';
                        assert(actor.toObject().flags.ptu.party?.trainer===undefined,'Trainer link was not initially absent');
                        equal([actor.attributes.level.cap.training,actor.attributes.level.cap.amount],[5,6],'Unlinked cap oracle');
                        await actor.update({'flags.ptu.party.trainer':trainerId});
                        refreshEvidence.party=observer.count()-3;
                        assert(observer.count()===4,'Party update did not invoke exactly one owned refresh');
                        equal([actor.attributes.level.cap.training,actor.attributes.level.cap.amount],[7,2],'Linked level-one cap oracle');
                        verify(actor,spec,{stats:spec.stats,contests:spec.contests,stage:'party-link-update'});
                        refreshEvidence.stage='trainer';
                        await trainer.update({'system.level.milestones':1});
                        refreshEvidence.trainer=observer.count()-4;
                        assert(observer.count()===5,'Trainer update did not invoke exactly one owned refresh');
                        assert(trainer.toObject().system.level.milestones===1&&trainer.system.level.current===2,'Trainer level update did not persist/derive');
                        equal([actor.attributes.level.cap.training,actor.attributes.level.cap.amount],[9,4],'Linked level-two cap oracle');
                        verify(actor,spec,{stats:spec.stats,contests:spec.contests,stage:'trainer-level-update'});
                        refreshEvidence.stage='unrelated';
                        await actor.update({'system.nickname':'P05 matrix unrelated update'});
                        refreshEvidence.unrelated=observer.count()-5;
                        assert(observer.count()===5,'Unrelated update invoked refresh callback');
                        verify(actor,spec,{stats:spec.stats,contests:spec.contests,nickname:'P05 matrix unrelated update',stage:'unrelated-update'});
                    } finally {refreshEvidence.observedRefreshCalls=observer.count();try{observer.restore();refreshEvidence.observerRestored=true;}catch(e){refreshEvidence.restorationError=String(e.message).slice(0,300);throw e;}}
                }
            }else actor=game.actors.get(spec.actorId);
            snapshots.push(verify(actor,spec,{stats:spec.finalStats??spec.stats,contests:spec.finalContests??spec.contests,rule:spec.case==='item-update'?12:spec.rule,nickname:spec.case==='repeat-unrelated'?'P05 matrix unrelated update':'P05 matrix '+spec.case,stage:phase==='create'?'before-reload':'after-reload'}));
        }
        if(phase==='reload'){
            const ownedIds=[...specs.map(spec=>spec.actorId),trainerId].sort();
            equal(game.actors.contents.map(actor=>actor.id).sort(),ownedIds,'Targeted ready requires only the nine owned Actors');
            assert(game.actors.contents.every(actor=>actor.getFlag('ptu','p05SandboxRun')===runId),'Targeted ready ownership markers');
            const spec=specs.find(spec=>spec.case==='repeat-unrelated'),actor=game.actors.get(spec.actorId);
            const naturalReload=verify(actor,spec,{stats:spec.stats,contests:spec.contests,nickname:'P05 matrix unrelated update',stage:'natural-reload'});
            equal([actor.attributes.level.cap.training,actor.attributes.level.cap.amount],[9,4],'Natural reload level cap oracle');
            const {TrainerPokemonSync}=await import(origin+'/systems/ptu/src/scripts/hooks/trainer-pokemon-sync.js');
            const prior=Object.getOwnPropertyDescriptor(Hooks,'on'),captured=[];
            assert(prior&&Object.hasOwn(prior,'value')&&typeof prior.value==='function'&&prior.configurable,'Hooks.on capture descriptor');
            refreshEvidence={phase:'targeted-ready',targetedReady:null,observedRefreshCalls:0,naturalReadyCallCount:'not measured',captureEvents:[],hooksOnRestored:false,observerInstalled:false,observerRestored:false};
            function capture(event,callback){assert(captured.length<3&&typeof callback==='function','Callback capture bound');captured.push([event,callback]);refreshEvidence.captureEvents.push(event);}
            try {Object.defineProperty(Hooks,'on',{...prior,value:capture});TrainerPokemonSync.listen();}
            finally {
                Object.defineProperty(Hooks,'on',prior);const restored=Object.getOwnPropertyDescriptor(Hooks,'on');
                refreshEvidence.hooksOnRestored=restored.value===prior.value&&restored.writable===prior.writable&&restored.enumerable===prior.enumerable&&restored.configurable===prior.configurable;
                assert(refreshEvidence.hooksOnRestored,'Hooks.on restoration');
            }
            equal(captured.map(row=>row[0]),['ready','updateActor','updateActor'],'Captured callback shape');
            equal(game.actors.contents.map(actor=>actor.id).sort(),ownedIds,'Targeted ready Actor set changed during import');
            assert(game.actors.contents.every(actor=>actor.getFlag('ptu','p05SandboxRun')===runId),'Targeted ready ownership changed');
            const sourceBefore=JSON.stringify(actor.toObject()),observer=observeRefresh(actor);
            refreshEvidence.observerInstalled=true;
            try {
                captured[0][1]();refreshEvidence.targetedReady=observer.count();assert(observer.count()===1,'Targeted ready did not invoke exactly one owned refresh');
                const checked=verify(actor,spec,{stats:spec.stats,contests:spec.contests,nickname:'P05 matrix unrelated update',stage:'targeted-ready-callback'});
                equal(checked,naturalReload,'Targeted ready changed native results');equal(JSON.stringify(actor.toObject()),sourceBefore,'Targeted ready mutated saved source');
                equal([actor.attributes.level.cap.training,actor.attributes.level.cap.amount],[9,4],'Targeted ready level cap oracle');
            }finally{refreshEvidence.observedRefreshCalls=observer.count();try{observer.restore();refreshEvidence.observerRestored=true;}catch(e){refreshEvidence.restorationError=String(e.message).slice(0,300);throw e;}}
        }
        return {ok:true,runId,servedSourceSHA256:digest,refreshSourcePins,refreshEvidence,hugePowerEnabled:false,trainer:{id:trainer.id,milestones:trainer.toObject().system.level.milestones,level:trainer.system.level.current},snapshots,stages};
        }catch(e){const raw=String(e.message);return {ok:false,runId,snapshots,stages,refreshEvidence,error:raw.slice(0,1000),errorAccounting:{observedChars:raw.length,omittedChars:Math.max(0,raw.length-1000)}};}

}

/** Eight bounded native scenarios; the numeric expectations above are not learned from this run. */
export async function checkNativePreparationMatrix(page, {runId,origin,servedHugePowerSHA256}) {
    if (!/^p05-[a-z0-9-]{12,80}$/.test(runId) || !localSandboxURL(origin+'/',Number(new URL(origin).port))) throw new Error('Invalid matrix identity');
    const owned=[...NATIVE_MATRIX_V2.map(s=>({actorId:s.actorId,speciesId:s.speciesId,ruleId:s.ruleId,case:s.case})),{actorId:NATIVE_MATRIX_TRAINER_V2,case:'trainer'}];
    let before=null,after=null,cleanup=null,error=null,errorAccounting=null,creationAttempted=false;
    const evaluate=phase=>page.evaluate(evaluateNativeMatrixPhase,{phase,specs:NATIVE_MATRIX_V2,runId,origin,servedHugePowerSHA256,trainerId:NATIVE_MATRIX_TRAINER_V2,refreshSourcePins:NATIVE_REFRESH_SOURCE_PINS});
    try {
        await page.evaluate(({owned,origin})=>{
            if(location.origin!==origin||!game.ready||!game.user.isGM)throw new Error('Matrix ownership preflight unavailable');
            if(owned.some(s=>game.actors.has(s.actorId)))throw new Error('Preexisting matrix Actor; no creation or cleanup allowed');
            return {absent:true};
        },{owned,origin});
        creationAttempted=true;before=await evaluate('create');
        if(!before?.ok)throw new Error(before?.error??'Matrix creation result missing');
        await page.reload({waitUntil:'domcontentloaded',timeout:60000});
        await page.waitForFunction(()=>globalThis.game?.ready,{timeout:60000});
        after=await evaluate('reload');
        if(!after?.ok)throw new Error(after?.error??'Matrix reload result missing');
        if(!before?.ok||!after?.ok||JSON.stringify(before.snapshots)!==JSON.stringify(after.snapshots)||JSON.stringify(before.trainer)!==JSON.stringify(after.trainer))throw new Error('Matrix changed across reload');
    }catch(e){const raw=String(e.message);error=raw.slice(0,1000);errorAccounting={observedChars:raw.length,omittedChars:raw.length-error.length};}
    finally{
        if(creationAttempted&&before?.cleanupForbidden!==true)try{
            cleanup=await page.evaluate(async ({owned,runId,origin})=>{
                if(location.origin!==origin||!game.ready)throw new Error('Matrix cleanup context unavailable');
                const results=[];
                for(const spec of owned){
                    const actor=game.actors.get(spec.actorId);
                    if(!actor){results.push({actorId:spec.actorId,absent:true});continue;}
                    if(actor.getFlag('ptu','p05SandboxRun')!==runId){results.push({actorId:spec.actorId,deleted:false,reason:'ownership-mismatch'});continue;}
                    try{await actor.delete();results.push({actorId:spec.actorId,deleted:!game.actors.has(spec.actorId)});}
                    catch(e){results.push({actorId:spec.actorId,deleted:false,reason:String(e.message).slice(0,200)});}
                }
                return {deleted:results.every(r=>r.deleted||r.absent),results};
            },{owned,runId,origin});
        }catch(e){cleanup={deleted:false,error:String(e.message).slice(0,500)};}
    }
    return {ok:!error&&cleanup?.deleted===true,before,after,cleanup,error,errorAccounting,scenarioCount:8,fixtureLimit:9,reloadLimit:1,oracleRevision:'P05-NATIVE-PREPARATION-MATRIX-20261116-01',repairAuthority:'p05-source-restoring-refresh-v2',validationBoundary:'source-restoring-refresh',historicalDirectPreparationFailure:'22-to-34 preserved in V1'};
}
