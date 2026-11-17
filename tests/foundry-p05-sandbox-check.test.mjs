import test from 'node:test';


test('backend deny policy blocks networking, redirects, sockets and delegated execution before dispatch', async () => {
    const {installBackendNoOutbound}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const calls=[],decisions=[];let getterCalls=0;
    const original=name=>function(...args){calls.push(name);return {receiver:this,args};};
    const object=(prefix,keys)=>Object.fromEntries(keys.map(key=>[key,original(prefix+'.'+key)]));
    const net=object('net',['connect','createConnection']);net.Socket=function(){};
    net.Socket.prototype.connect=original('socket.connect');net.Socket.prototype.write=original('socket.write');
    const dgram=object('dgram',['createSocket']);dgram.Socket=function(){};
    Object.assign(dgram.Socket.prototype,object('dgram.socket',['bind','connect','send']));
    const modules={net,dgram,tls:object('tls',['connect']),http:object('http',['request','get']),https:object('https',['request','get']),http2:object('http2',['connect']),dns:object('dns',['lookup','resolve','Resolver']),childProcess:object('child',['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork']),workerThreads:object('worker',['Worker']),cluster:object('cluster',['fork']),inspector:object('inspector',['open'])};
    modules.dns.promises=object('dns.promises',['lookup','resolve','Resolver']);
    modules.childProcess.ChildProcess=function(){};
    modules.childProcess.ChildProcess.prototype.spawn=original('child.prototype.spawn');
    const globals={fetch:original('fetch')};
    Object.defineProperty(globals,'WebSocket',{get(){getterCalls++;return original('WebSocket');},configurable:true});
    const processObject={binding:original('binding')};
    const policy=installBackendNoOutbound({modules,globals,processObject,denied:d=>decisions.push(d)});
    try{
        const attempts=[
            ()=>globals.fetch('https://forge-vtt.com/'),
            ()=>globals.fetch('https://api.foundryvtt.com/_api/license/sign/'),
            ()=>globals.fetch('https://unknown.invalid/',{redirect:'follow'}),
            ()=>modules.http.request('http://forge-vtt.com/'),
            ()=>modules.https.get('https://forge-vtt.com/'),
            ()=>modules.http2.connect('https://forge-vtt.com'),
            ()=>modules.net.connect(443,'forge-vtt.com'),
            ()=>new modules.net.Socket().connect({host:'127.0.0.1',port:30091}),
            ()=>modules.tls.connect({host:'forge-vtt.com',port:443}),
            ()=>modules.dns.lookup('forge-vtt.com'),
            ()=>modules.dns.promises.resolve('forge-vtt.com'),
            ()=>new modules.dns.Resolver(),
            ()=>modules.dgram.createSocket('udp4'),
            ()=>new modules.dgram.Socket().send(Buffer.from('x'),443,'forge-vtt.com'),
            ()=>modules.childProcess.spawn('other-program',[]),
            ()=>new modules.childProcess.ChildProcess().spawn({file:'other-program',args:[]}),
            ()=>new modules.workerThreads.Worker('other-worker'),
            ()=>modules.cluster.fork(),
            ()=>modules.inspector.open(9229),
            ()=>new globals.WebSocket('wss://forge-vtt.com/'),
            ()=>processObject.binding('tcp_wrap'),
            ()=>processObject.binding('process_wrap'),
            ()=>processObject.binding('spawn_sync')
        ];
        for(const attempt of attempts)assert.throws(attempt,/prohibited/);
        assert.equal(calls.length,0);assert.equal(getterCalls,0);assert.equal(decisions.length,attempts.length);
        assert.ok(decisions.every(d=>d.decision==='denied-before-dispatch'));
        // Accepted inbound socket response primitives are not replaced.
        const socket=new modules.net.Socket();assert.equal(socket.write('response').receiver,socket);
        assert.deepEqual(calls,['socket.write']);
        assert.equal(processObject.binding('buffer').args[0],'buffer');
    }finally{policy.restoreForTests();}
    globals.fetch('inert restored delegate');assert.equal(calls.at(-1),'fetch');
    assert.equal(getterCalls,0);
});

test('backend policy and listener adapter bind the exact IPv4 literal without DNS dispatch', {timeout:10000}, async () => {
    const {installBackendNoOutbound,createLoopbackListen}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const net=(await import('node:net')).default,dns=(await import('node:dns')).default;
    const inert=keys=>Object.fromEntries(keys.map(k=>[k,()=>{throw new Error('Unexpected inert dispatch');}]));
    const childProcess=inert(['spawn','spawnSync','exec','execSync','execFile','execFileSync','fork']);
    childProcess.ChildProcess=function(){};childProcess.ChildProcess.prototype.spawn=()=>{throw new Error('Unexpected native spawn delegate');};
    const dgram=inert(['createSocket']);dgram.Socket=function(){};Object.assign(dgram.Socket.prototype,inert(['bind','connect','send']));
    const modules={net,dns,dgram,childProcess,tls:inert(['connect']),http:inert(['request','get']),https:inert(['request','get']),http2:inert(['connect']),workerThreads:inert(['Worker']),cluster:inert(['fork']),inspector:inert(['open'])};
    const originalLookup=dns.lookup;let dnsDispatches=0;
    dns.lookup=function(...args){dnsDispatches++;return Reflect.apply(originalLookup,this,args);};
    let policy;const server=net.createServer();
    try{
        policy=installBackendNoOutbound({modules,globals:inert(['fetch']),processObject:{binding:()=>{throw new Error('Unexpected binding delegate');}}});
        const ready=once(server,'listening');
        createLoopbackListen(net.Server.prototype.listen).call(server,30091,'0.0.0.0');
        await ready;
        assert.deepEqual(server.address(),{address:'127.0.0.1',family:'IPv4',port:30091});
        for(const host of ['localhost','forge-vtt.com','127.0.0.2','::1','0.0.0.0','2130706433'])assert.throws(()=>dns.lookup(host,{all:true},()=>{}),/prohibited/);
        assert.throws(()=>dns.lookup('127.0.0.1',{all:false},()=>{}),/prohibited/);
        assert.throws(()=>dns.lookup('127.0.0.1',{all:true,family:4},()=>{}),/prohibited/);
        let getterCalls=0;assert.throws(()=>dns.lookup('127.0.0.1',{get all(){getterCalls++;return true;}},()=>{}),/prohibited/);assert.equal(getterCalls,0);
        const socket=new net.Socket();try{assert.throws(()=>socket.connect(30091,'127.0.0.1'),/prohibited/);}finally{socket.destroy();}
        assert.equal(dnsDispatches,0);
        assert.ok(policy.coverage.some(x=>x.operation==='dns.lookup'&&x.status==='local-literal-only'));
    }finally{
        if(server.listening)await new Promise(r=>server.close(r));
        policy?.restoreForTests();dns.lookup=originalLookup;
    }
});

import assert from 'node:assert/strict';
import http from 'node:http';
import {once} from 'node:events';
import {mkdtemp, mkdir, symlink} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {localSandboxURL, requireOwnedPath, browserLaunchOptions, startLocalOnlyProxy, validateBrowserLaunchPlan, observeOwnedErrors, installBrowserSpawnGuard, beginOwnedBrowserLaunch} from '../tools/foundry-p05-sandbox-check.mjs';

test('URL classifier admits only the literal owned loopback origin', () => {
    for (const url of ['http://127.0.0.1:30091/', 'ws://127.0.0.1:30091/socket.io/?EIO=4']) assert.ok(localSandboxURL(url,30091));
    for (const url of ['https://forge-vtt.com/', 'http://forge-vtt.com/', 'http://127.0.0.1:30091@forge-vtt.com/', 'http://127.0.0.1:30091.evil/', 'http://localhost:30091/', 'http://2130706433:30091/', 'http://127.0.0.1:30092/', 'https://127.0.0.1:30091/', 'file:///x', 'data:text/html,x', 'http://127.0.0.1:30091/#x', 'http://127.0.0.1:30091/\\x', 'http://127.0.0.1:30091/\nx']) assert.equal(localSandboxURL(url,30091),null,url);
});

test('proxy forwards an owned WebSocket upgrade and closes both tunnel sides', {timeout:10000}, async t => {
    const {createHash}=await import('node:crypto');
    const controller=new AbortController(), peers=new Set(), ownedSockets=new Set();
    const workDeadline=performance.now()+8000;
    let upgrades=0, proxy, proxyOpening, client, upstreamPeer, request, emergency=false, cleanupPromise, closureTriggered=false;
    const closureEvents=[], endpointEvidence={};
    const upstream=http.createServer((_req,res)=>res.end('not upgraded'));
    const probe=http.createServer();
    const stage=label=>t.diagnostic('WebSocket fixture stage: '+label);
    const record=label=>{closureEvents.push(label);stage(label);};
    const observeEndpoint=(socket,label)=>{
        const evidence=endpointEvidence[label]={eof:null,close:null};
        socket.once('end',()=>{
            evidence.eof={afterProxyClosure:closureTriggered,emergency};record(label+'-eof');
            if(!socket.destroyed&&!socket.writableEnded)socket.end(); // Normal response to remote EOF.
        });
        socket.once('close',hadError=>{
            evidence.close={afterProxyClosure:closureTriggered,emergency,hadError};record(label+'-close');
        });
    };
    const socketState=socket=>socket?{allowHalfOpen:socket.allowHalfOpen,readableEnded:socket.readableEnded,writableEnded:socket.writableEnded,destroyed:socket.destroyed}:null;
    const track=socket=>{ownedSockets.add(socket);socket.on('close',()=>ownedSockets.delete(socket));socket.on('error',()=>{});};
    upstream.on('connection',track);probe.on('connection',track);
    const destroyOwned=()=>{
        request?.destroy();client?.destroy();
        for(const socket of ownedSockets)socket.destroy();
        for(const peer of peers)peer.destroy();
    };
    const bounded=(promise,milliseconds,label,signal)=>new Promise((resolve,reject)=>{
        let settled=false;
        const finish=(error,value)=>{
            if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',aborted);
            error?reject(error):resolve(value);
        };
        const aborted=()=>finish(new Error('Cancelled during '+label,{cause:signal.reason}));
        const timer=setTimeout(()=>finish(new Error('Deadline during '+label)),Math.max(0,milliseconds));
        Promise.resolve(promise).then(value=>finish(null,value),error=>finish(error));
        if(signal?.aborted)aborted();else signal?.addEventListener('abort',aborted,{once:true});
    });
    const wait=(promise,label)=>bounded(promise,workDeadline-performance.now(),label,controller.signal);
    const closeServer=server=>new Promise((resolve,reject)=>server.close(error=>error&&error.code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve()));
    const cleanup=()=>cleanupPromise??=(async()=>{
        emergency=true;destroyOwned();
        await bounded(Promise.all([proxyOpening?.then(value=>value.close()),closeServer(probe),closeServer(upstream)]),1500,'fixture cleanup');
    })();
    const cancelled=()=>{emergency=true;controller.abort(t.signal.reason);destroyOwned();};
    t.signal.addEventListener('abort',cancelled,{once:true});
    t.after(async()=>{try{await cleanup();}finally{t.signal.removeEventListener('abort',cancelled);}});
    upstream.on('upgrade',(incoming,socket,head)=>{
        upgrades++;upstreamPeer=socket;observeEndpoint(socket,'upstream');peers.add(socket);socket.on('close',()=>peers.delete(socket));
        if(incoming.url!=='/ws') {controller.abort(new Error('Unexpected fixture upgrade path'));destroyOwned();return;}
        const accept=createHash('sha1').update(incoming.headers['sec-websocket-key']+'258EAFA5-E914-47DA-95CA-C5AB0DC85B11').digest('base64');
        socket.write('HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Accept: '+accept+'\r\n\r\n');
        socket.write(Buffer.from([0x81,2,0x6f,0x6b]));
        if(head.length)socket.write(head);
        socket.resume(); // Consume the fixture peer's readable EOF as well as data.
    });
    try{
        stage('upstream-listen');upstream.listen(0,'127.0.0.1');await wait(once(upstream,'listening'),'upstream listen');const port=upstream.address().port;
        stage('proxy-port');probe.listen(0,'127.0.0.1');await wait(once(probe,'listening'),'port reservation');const proxyPort=probe.address().port;await wait(closeServer(probe),'reservation close');
        stage('proxy-listen');proxyOpening=startLocalOnlyProxy({sandboxPort:port,proxyPort}).then(value=>{proxy=value;return value;});await wait(proxyOpening,'proxy listen');
        stage('upgrade');
        const opened=new Promise((resolve,reject)=>{
            request=http.request({host:'127.0.0.1',port:proxyPort,path:'ws://127.0.0.1:'+port+'/ws',headers:{Connection:'Upgrade',Upgrade:'websocket','Sec-WebSocket-Key':'dGhlIHNhbXBsZSBub25jZQ==','Sec-WebSocket-Version':'13'}});
            request.on('error',reject);request.on('response',r=>{r.resume();reject(new Error('Upgrade not forwarded'));});
            request.on('upgrade',(response,socket,head)=>{client=socket;track(socket);observeEndpoint(socket,'client');resolve({response,socket,head});});request.end();
        });
        const {response,socket,head}=await wait(opened,'upgrade');assert.equal(response.statusCode,101);
        stage('frame');
        const frame=await wait(new Promise((resolve,reject)=>{
            const chunks=[head];let size=head.length;
            const clear=()=>{socket.off('data',data);socket.off('close',closed);socket.off('error',errored);};
            const ready=()=>{if(size<4)return;clear();resolve(Buffer.concat(chunks));};
            const data=b=>{chunks.push(b);size+=b.length;ready();};
            const closed=()=>{clear();reject(new Error('Tunnel closed before frame'));};
            const errored=error=>{clear();reject(error);};
            socket.on('data',data);socket.once('close',closed);socket.once('error',errored);ready();
        }),'frame');
        assert.deepEqual(frame,Buffer.from([0x81,2,0x6f,0x6b]));
        assert.equal(peers.size,1);assert.equal(upgrades,1);assert.equal(proxy.counts.websocketAllowed,1);
        stage('proxy-close-proof');client.resume();
        assert.ok(Object.values(endpointEvidence).every(row=>row.eof===null&&row.close===null),'Peer closed before proxy closure');
        const closed=Promise.all([once(client,'close'),once(upstreamPeer,'close')]);
        closureTriggered=true;record('proxy-close-trigger');
        const proxyClosed=proxy.close().then(()=>record('proxy-close-completed'));
        await wait(Promise.all([proxyClosed,closed]),'proxy close and both peers');
        assert.equal(emergency,false,'Emergency destruction cannot prove proxy closure');
        for(const label of ['client','upstream']){
            const row=endpointEvidence[label];
            assert.deepEqual(row.eof,{afterProxyClosure:true,emergency:false},label+' EOF evidence');
            assert.deepEqual(row.close,{afterProxyClosure:true,emergency:false,hadError:false},label+' close evidence');
            assert.ok(closureEvents.indexOf('proxy-close-trigger')<closureEvents.indexOf(label+'-eof'));
            assert.ok(closureEvents.indexOf(label+'-eof')<closureEvents.indexOf(label+'-close'));
        }
        assert.equal(peers.size,0);stage('closure-proved');
    }catch(error){
        t.diagnostic('WebSocket pre-cleanup state: '+JSON.stringify({closureTriggered,emergency,closureEvents,endpointEvidence,client:socketState(client),upstream:socketState(upstreamPeer)}));
        throw error;
    }finally{stage('cleanup');await cleanup();}
});
test('proxy denies remote and invalid WebSocket upgrades without upstream contact', {timeout:10000}, async () => {
    const upstream=http.createServer((_req,res)=>res.end('unexpected'));let upgrades=0;
    upstream.on('upgrade',(_req,socket)=>{upgrades++;socket.destroy();});
    upstream.listen(0,'127.0.0.1');await once(upstream,'listening');const port=upstream.address().port;
    const probe=http.createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const proxyPort=probe.address().port;await new Promise(r=>probe.close(r));
    const proxy=await startLocalOnlyProxy({sandboxPort:port,proxyPort});
    const denied=(path,upgrade)=>new Promise((resolve,reject)=>{
        const req=http.request({host:'127.0.0.1',port:proxyPort,path,headers:{Connection:'Upgrade',Upgrade:upgrade}});
        req.on('error',reject);req.on('response',res=>{res.resume();res.on('end',()=>resolve(res.statusCode));});req.on('upgrade',(_res,socket)=>{socket.destroy();reject(new Error('Forbidden upgrade accepted'));});req.end();
    });
    try{
        assert.equal(await denied('ws://forge-vtt.com/world','websocket'),403);
        assert.equal(await denied('ws://127.0.0.1:'+port+'/ws','other-protocol'),403);
        assert.equal(upgrades,0);assert.equal(proxy.counts.websocketAllowed,0);assert.equal(proxy.counts.blocked,2);
    }finally{await proxy.close();await new Promise(r=>upstream.close(r));}
});

test('browser configuration uses pipe, new profile, proxy with no direct fallback', () => {
    const options=browserLaunchOptions({executablePath:'/test/browser',userDataDir:'/test/owned/profile',proxyPort:30092});
    assert.equal(options.pipe,true); assert.equal(options.headless,true);assert.equal(options.userDataDir,'/test/owned/profile');
    assert.ok(options.args.includes('--proxy-bypass-list=<-loopback>'));
    assert.equal(options.args.find(v=>v.startsWith('--proxy-server=')),'--proxy-server=http://127.0.0.1:30092');
    assert.ok(!options.args.some(v=>v.includes('no-sandbox')||v.includes('ignore-certificate')));
});
test('owned paths reject escape and links', async () => {
    const root=await mkdtemp(join(tmpdir(),'ptu-policy-test-')); await mkdir(join(root,'owned'));
    assert.equal(await requireOwnedPath(root,join(root,'owned')),join(root,'owned'));
    await assert.rejects(requireOwnedPath(root,root));
    await assert.rejects(requireOwnedPath(root,join(root,'..','escape')));
    await symlink(join(root,'owned'),join(root,'link'),'dir');
    await assert.rejects(requireOwnedPath(root,join(root,'link')));
});
test('proxy blocks external strings and CONNECT without contacting them', async () => {
    const upstream=http.createServer((_req,res)=>res.end('owned')); upstream.listen(0,'127.0.0.1'); await once(upstream,'listening');
    const port=upstream.address().port;
    // Reserve a distinct ephemeral port for the finite local-only test.
    const probe=http.createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const proxyPort=probe.address().port;await new Promise(r=>probe.close(r));
    const proxy=await startLocalOnlyProxy({sandboxPort:port,proxyPort});
    const request=(method,path)=>new Promise((resolve,reject)=>{
        const req=http.request({host:'127.0.0.1',port:proxyPort,method,path},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,body}));});
        req.on('connect',(res,socket)=>{socket.destroy();resolve({status:res.statusCode});});req.on('error',reject);req.end();
    });
    try{
        assert.deepEqual(await request('GET',`http://127.0.0.1:${port}/`),{status:200,body:'owned'});
        assert.equal((await request('GET','https://forge-vtt.com/')).status,403);
        assert.equal((await request('CONNECT','forge-vtt.com:443')).status,403);
        assert.equal(proxy.counts.httpAllowed,1);assert.equal(proxy.counts.blocked,2);
    }finally{await proxy.close();await new Promise(r=>upstream.close(r));}
});

test('process-local listener adapter preserves ordinary delegation and rejects other transports', async () => {
    const {createLoopbackListen}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const receiver={},result={},callback=()=>{},calls=[],audit=[];
    const original=function(...args){calls.push({receiver:this,args});return result;};
    const wrapped=createLoopbackListen(original,row=>audit.push(row));
    assert.equal(wrapped.call(receiver,30091,'0.0.0.0',123,callback),result);
    assert.equal(calls.length,1);assert.equal(calls[0].receiver,receiver);
    assert.deepEqual(calls[0].args,[30091,'127.0.0.1',123,callback]);
    const options={port:30091,host:'::',backlog:321,exclusive:true};
    assert.equal(wrapped.call(receiver,options,callback),result);
    assert.deepEqual(calls[1].args,[{port:30091,host:'127.0.0.1',backlog:321,exclusive:true},callback]);
    assert.equal(options.host,'::');
    for(const args of [[30092],[0],['30091'],['pipe'],[{path:'pipe'}],[{port:30091,fd:2}],[{port:30091,ipv6Only:true}],[30091,'localhost',1,'extra']])assert.throws(()=>wrapped(...args),/rejected/);
    let getterCalls=0;assert.throws(()=>wrapped({get port(){getterCalls++;return 30091;}}),/rejected/);assert.equal(getterCalls,0);
    assert.equal(calls.length,2);assert.equal(audit.filter(row=>row.accepted).length,2);
    const ordinaryError=new Error('ordinary error');
    assert.throws(()=>createLoopbackListen(()=>{throw ordinaryError;})(30091),e=>e===ordinaryError);
});


test('resolved browser plan rejects ambiguous profile, changed executable and relaxed flags before dispatch',()=>{
    const options=browserLaunchOptions({executablePath:'/test/browser',userDataDir:'/test/owned/profile',proxyPort:30092});
    const args=[...options.args,'--user-data-dir='+options.userDataDir,'--remote-debugging-pipe'];
    const input={executablePath:options.executablePath,expectedExecutable:'/test/browser',profile:options.userDataDir,defaultProfile:'/test/owned/home/AppData/Local/Google/Chrome/User Data',proxyPort:30092,args};
    assert.deepEqual(validateBrowserLaunchPlan(input).args,args);
    for(const bad of [args.filter(x=>!x.startsWith('--user-data-dir')),args.concat('--user-data-dir=/other'),args.concat('--remote-debugging-port=9222'),args.concat('--no-sandbox'),args.concat('--proxy-server=direct://')])assert.throws(()=>validateBrowserLaunchPlan({...input,args:bad}));
    assert.throws(()=>validateBrowserLaunchPlan({...input,executablePath:'/other'}));
    assert.throws(()=>validateBrowserLaunchPlan({...input,defaultProfile:input.profile}));
});

test('owned Chrome spawn captures exact PID and labels early stdio reset without shell fallback',async()=>{
    const {EventEmitter}=await import('node:events');
    const errors=[],spawns=[],calls=[];let kills=0;
    const child=new EventEmitter();child.pid=123;child.stdio=Array.from({length:5},()=>new EventEmitter());child.kill=()=>{kills++;};
    const cp={spawn:(...args)=>{calls.push(args);return child;},execSync:()=>{throw new Error('Unwanted original shell dispatch');}};
    const original=cp.spawn,shell=cp.execSync,plan={executablePath:'/test/browser',args:['fixed']};
    const guard=installBrowserSpawnGuard({childProcess:cp,plan,onSpawn:x=>spawns.push(x),onError:x=>errors.push(x)});
    try{
        assert.throws(()=>cp.spawn('/other',['fixed'],{}));assert.equal(calls.length,0);
        cp.spawn('/test/browser',['fixed'],{});
        child.stdio[4].emit('error',Object.assign(new Error('read reset'),{code:'ECONNRESET'}));
        assert.equal(errors[0].role,'chrome-stdio-4');assert.equal(errors[0].code,'ECONNRESET');assert.equal(kills,1);
        assert.equal(spawns[0].pid,123);assert.equal(calls.length,1);
        assert.throws(()=>cp.spawn('/test/browser',['fixed'],{}));
        assert.throws(()=>cp.execSync('taskkill /pid 123 /T /F'),/not admitted/);
        assert.equal(errors.at(-1).role,'chrome-shell-cleanup-blocked');
    }finally{child.emit('close',1,null);guard.restore({launchSettled:true});}
    assert.equal(cp.spawn,original);assert.equal(cp.execSync,shell);
    const resource=new EventEmitter();let destroyed=0;
    observeOwnedErrors(resource,'proxy-pre-upgrade',row=>errors.push(row),()=>destroyed++);
    resource.emit('error',Object.assign(new Error('early reset'),{code:'ECONNRESET'}));
    assert.equal(errors.at(-1).role,'proxy-pre-upgrade');assert.equal(destroyed,1);
});

test('proxy handles abrupt rejection and upstream negotiation resets with bounded closure', {timeout:10000},async t=>{
    const net=(await import('node:net')).default;
    const controller=new AbortController(),workDeadline=performance.now()+8000;
    const peers=new Set(),faults=[],seen={upgrade:0};let proxy,proxyOpening,cleanupPromise;
    const upstream=http.createServer(req=>req.socket.resetAndDestroy()),probe=http.createServer();
    const track=s=>{peers.add(s);s.on('error',()=>{});s.on('close',()=>peers.delete(s));};
    upstream.on('connection',track);probe.on('connection',track);
    const destroyOwned=()=>{for(const s of peers)s.destroy();};
    const bounded=(promise,ms,label,signal)=>new Promise((resolve,reject)=>{
        let settled=false;
        const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve(value);};
        const abort=()=>finish(new Error('Cancelled: '+label));
        const timer=setTimeout(()=>finish(new Error('Deadline: '+label)),Math.max(0,ms));
        Promise.resolve(promise).then(v=>finish(null,v),e=>finish(e));
        if(signal?.aborted)abort();else signal?.addEventListener('abort',abort,{once:true});
    });
    const wait=(promise,label)=>bounded(promise,workDeadline-performance.now(),label,controller.signal);
    const closeServer=server=>new Promise((resolve,reject)=>server.close(e=>e&&e.code!=='ERR_SERVER_NOT_RUNNING'?reject(e):resolve()));
    const cleanup=()=>cleanupPromise??=(async()=>{
        destroyOwned();
        await bounded(Promise.all([proxyOpening?.then(value=>value.close()),closeServer(probe),closeServer(upstream)]),1500,'reset fixture cleanup');
    })();
    const cancelled=()=>{controller.abort(t.signal.reason);destroyOwned();};
    t.signal.addEventListener('abort',cancelled,{once:true});
    t.after(async()=>{try{await cleanup();}finally{t.signal.removeEventListener('abort',cancelled);}});
    upstream.on('upgrade',(_req,socket)=>{seen.upgrade++;socket.resetAndDestroy();});
    try{
        upstream.listen(0,'127.0.0.1');await wait(once(upstream,'listening'),'upstream listen');const port=upstream.address().port;
        probe.listen(0,'127.0.0.1');await wait(once(probe,'listening'),'port reservation');const proxyPort=probe.address().port;await wait(closeServer(probe),'reservation close');
        proxyOpening=startLocalOnlyProxy({sandboxPort:port,proxyPort,onFailure:row=>faults.push(row)}).then(value=>{proxy=value;return value;});await wait(proxyOpening,'proxy listen');
        const raw=payload=>wait(new Promise(resolve=>{
            const socket=net.connect({host:'127.0.0.1',port:proxyPort});track(socket);
            socket.on('data',()=>socket.resetAndDestroy());socket.on('connect',()=>socket.write(payload));socket.on('close',resolve);
        }),'raw connection closure');
        await raw('CONNECT forbidden.invalid:443 HTTP/1.1\r\nHost: forbidden.invalid\r\n\r\n');
        await raw('GET ws://forbidden.invalid/ HTTP/1.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n');
        assert.equal(seen.upgrade,0);
        await raw('GET http://127.0.0.1:'+port+'/ HTTP/1.1\r\nHost: 127.0.0.1\r\n\r\n');
        await raw('GET ws://127.0.0.1:'+port+'/ HTTP/1.1\r\nConnection: Upgrade\r\nUpgrade: websocket\r\n\r\n');
        assert.equal(seen.upgrade,1);assert.equal(proxy.counts.blocked,2);
        assert.ok(faults.some(x=>x.role==='proxy-http-upstream'&&x.code==='ECONNRESET'));
        assert.ok(faults.some(x=>x.role==='proxy-upgrade-upstream'&&x.code==='ECONNRESET'));
    }finally{await cleanup();}
});

test('deferred browser launch remains guarded through abort and asynchronous child closure',async()=>{
    const {EventEmitter}=await import('node:events');
    const child=new EventEmitter();child.pid=456;child.stdio=[];child.kill=()=>{};
    const cp={spawn:()=>child,execSync:()=>{throw new Error('Original shell must not run');}};
    const original=cp.spawn,plan={executablePath:'/test/browser',args:['fixed']},errors=[];
    const guard=installBrowserSpawnGuard({childProcess:cp,plan,onSpawn:()=>{},onError:row=>errors.push(row)});
    let rejectLaunch,aborted=false;
    const session=beginOwnedBrowserLaunch({options:{},launch:options=>{
        cp.spawn('/test/browser',['fixed'],{});
        options.signal.addEventListener('abort',()=>{aborted=true;},{once:true});
        return new Promise((_,reject)=>{rejectLaunch=reject;});
    }});
    await Promise.resolve();session.abort(new Error('owned failure'));
    assert.equal(aborted,true);assert.equal(session.settled,false);
    assert.throws(()=>guard.restore({launchSettled:session.settled}),/unresolved/);
    assert.throws(()=>cp.execSync('taskkill'),/not admitted/);
    rejectLaunch(new Error('launch aborted'));
    await assert.rejects(session.promise,/launch aborted/);
    assert.equal(session.settled,true);
    assert.throws(()=>guard.restore({launchSettled:session.settled}),/unresolved/);
    child.emit('close',1,null);guard.restore({launchSettled:session.settled});
    assert.equal(cp.spawn,original);assert.equal(errors.length,1);
});


test('public argument planning awaits delayed success and propagates asynchronous rejection before dispatch', async () => {
    const {prepareBrowserLaunchPlan}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const profile=join(tmpdir(),'ptu-async-plan-profile'),defaultProfile=join(tmpdir(),'ptu-async-plan-default');
    const input={...browserLaunchOptions({executablePath:'/owned/chrome',userDataDir:profile,proxyPort:30092}),dumpio:true};
    input.args.push('--remote-debugging-pipe');
    let resolveArgs,rejectArgs,captured,dispatches=0;
    const controller={defaultArgs(options){assert.equal(this,controller);captured=options;return new Promise(r=>{resolveArgs=r;});}};
    const pending=prepareBrowserLaunchPlan({controller,options:input,expectedExecutable:'/owned/chrome',profile,defaultProfile,proxyPort:30092}).then(value=>{dispatches++;return value;});
    await Promise.resolve();assert.equal(dispatches,0);assert.ok(Object.isFrozen(captured));assert.ok(Object.isFrozen(captured.args));
    input.args.push('--irrelevant-caller-mutation');
    resolveArgs([...captured.args,'--user-data-dir='+profile,'about:blank']);
    const ready=await pending;assert.equal(dispatches,1);assert.equal(ready.options,captured);assert.ok(Object.isFrozen(ready.plan.args));assert.ok(!ready.plan.args.includes('--irrelevant-caller-mutation'));
    let launchOptions;
    const session=beginOwnedBrowserLaunch({launch:async options=>{launchOptions=options;return {};},options:ready.options});await session.promise;
    assert.equal(launchOptions.args,ready.options.args);assert.equal(launchOptions.userDataDir,profile);assert.equal(launchOptions.executablePath,'/owned/chrome');
    const failure=new Error('asynchronous public argument rejection');
    const rejecting={defaultArgs(options){assert.equal(this,rejecting);assert.ok(Object.isFrozen(options));return new Promise((_r,j)=>{rejectArgs=j;});}};
    const rejected=prepareBrowserLaunchPlan({controller:rejecting,options:ready.options,expectedExecutable:'/owned/chrome',profile,defaultProfile,proxyPort:30092}).then(()=>{dispatches++;});
    const observed=assert.rejects(rejected,error=>error===failure);await Promise.resolve();assert.equal(dispatches,1);rejectArgs(failure);await observed;assert.equal(dispatches,1);
});


test('proxy client decisions bind reset classification to the same never-forwarded connection', async () => {
    const {EventEmitter}=await import('node:events');
    const {createProxyClientLedger}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const records=[],fatal=[];let dispatches=0;
    const ledger=createProxyClientLedger({record:row=>records.push(row),onFailure:row=>fatal.push(row)});
    const socket=()=>{const s=new EventEmitter();s.destroy=()=>{s.destroyed=true;queueMicrotask(()=>s.emit('close'));};ledger.observe(s);return s;};
    for(const code of ['ECONNRESET','EPIPE']){
        const s=socket();ledger.begin(s);ledger.deny(s);
        ledger.error(s,{role:'proxy-client-socket',code,message:'inert denied error'});
        assert.equal(fatal.length,0);assert.equal(records.at(-1).classification,'denied-client-policy-closure');
        assert.equal(records.at(-1).closure.status,'pending');assert.equal(ledger.pendingClosures,1);
        await Promise.resolve();assert.equal(records.at(-1).closure.status,'closed');assert.equal(ledger.pendingClosures,0);
        assert.equal(dispatches,0);
    }
    for(const code of ['ECONNRESET','EPIPE'])for(const mode of ['unknown','allowed','forwarded-then-denied','denied-then-reused','other-connection','owned','upstream','cdp']){
        const s=socket();const before=fatal.length;
        if(mode==='allowed'){ledger.begin(s);ledger.forward(s);dispatches++;}
        if(mode==='forwarded-then-denied'){ledger.begin(s);ledger.forward(s);dispatches++;ledger.begin(s);ledger.deny(s);}
        if(mode==='denied-then-reused'){ledger.begin(s);ledger.deny(s);ledger.begin(s);ledger.deny(s);}
        if(mode==='other-connection'){const other=socket();ledger.begin(other);ledger.deny(other);other.destroy();}
        if(mode==='owned'){ledger.begin(s);ledger.deny(s,{intendedOwned:true});assert.equal(fatal.at(-1).code,'OWNED_ENDPOINT_DENIED');}
        if(mode==='upstream'||mode==='cdp'){ledger.begin(s);ledger.deny(s);}
        ledger.error(s,{role:mode==='upstream'?'proxy-http-upstream':mode==='cdp'?'chrome-stdio-4':'proxy-client-socket',code,message:'inert '+mode});
        assert.ok(fatal.length>before);assert.equal(records.at(-1).classification,'fatal');s.destroy();
    }
    const s=socket();ledger.begin(s);ledger.deny(s);
    const before=fatal.length;ledger.error(s,{role:'proxy-client-socket',code:'EIO',message:'not a policy reset'});
    assert.equal(fatal.length,before+1);s.destroy();await Promise.resolve();assert.equal(ledger.pendingClosures,0);
    assert.equal(dispatches,4);
});

test('denied client closure has a hard deadline and every retained event keeps closure evidence', {timeout:5000}, async () => {
    const {EventEmitter}=await import('node:events');
    const {createProxyClientLedger}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const records=[],fatal=[];let resolveFailure;
    const failed=new Promise(resolve=>{resolveFailure=resolve;});
    const ledger=createProxyClientLedger({record:row=>records.push(row),onFailure:row=>{fatal.push(row);resolveFailure();}});
    const s=new EventEmitter();let destroys=0;s.destroy=()=>{destroys++;};ledger.observe(s);ledger.begin(s);ledger.deny(s);
    ledger.error(s,{role:'proxy-client-socket',code:'ECONNRESET',message:'inert denied reset'});
    ledger.error(s,{role:'proxy-http-request',code:'EPIPE',message:'inert same-client pipe'});
    assert.equal(records[0].closure,records[1].closure);assert.equal(s.listenerCount('close'),1);
    const keepAlive=setTimeout(()=>{},2000);
    try{await failed;}finally{clearTimeout(keepAlive);s.emit('close');}
    assert.equal(fatal.length,1);assert.equal(fatal[0].code,'CLOSE_DEADLINE');assert.equal(records[0].closure.status,'deadline');assert.equal(ledger.pendingClosures,0);assert.equal(destroys,3);
});

test('signal-closed child uses a latched close promise while launch settlement remains independent', async () => {
    const {EventEmitter}=await import('node:events');
    for(const mode of ['delayed','unresolved']){
        const child=new EventEmitter();child.pid=789;child.stdio=[];child.exitCode=null;child.signalCode=null;let kills=0;
        child.kill=()=>{kills++;};const original=()=>child,cp={spawn:original,execSync:()=>{throw new Error('Unexpected shell');}};
        const guard=installBrowserSpawnGuard({childProcess:cp,plan:{executablePath:'/owned/chrome',args:['fixed']},onSpawn:()=>{},onError:()=>{}});
        let rejectLaunch,aborted=false;
        const session=beginOwnedBrowserLaunch({options:{},launch:options=>{
            cp.spawn('/owned/chrome',['fixed'],{});options.signal.addEventListener('abort',()=>{aborted=true;},{once:true});
            return new Promise((_resolve,reject)=>{rejectLaunch=reject;});
        }});
        await Promise.resolve();child.signalCode='SIGTERM';child.emit('close',null,'SIGTERM');
        assert.equal(child.exitCode,null);assert.equal(guard.lifecycle.processClosed,true);
        const lateListenerCount=child.listenerCount('close');
        session.abort(new Error('owned cancellation'));
        if(!guard.lifecycle.processClosed)guard.child.kill();
        assert.deepEqual(await guard.closed,{code:null,signal:'SIGTERM'});assert.equal(kills,0);assert.equal(child.listenerCount('close'),lateListenerCount);
        assert.equal(aborted,true);assert.equal(session.settled,false);assert.throws(()=>guard.restore({launchSettled:session.settled}),/unresolved/);
        if(mode==='delayed'){
            rejectLaunch(new Error('delayed rejection'));await assert.rejects(session.promise,/delayed rejection/);
            assert.equal(session.settled,true);guard.restore({launchSettled:true});assert.equal(cp.spawn,original);
        }else{
            // This promise is deliberately never settled. Closed processes do not manufacture settlement.
            await Promise.resolve();assert.equal(session.settled,false);assert.notEqual(cp.spawn,original);
            assert.throws(()=>guard.restore({launchSettled:false}),/unresolved/);
        }
    }
});


test('proxy denial context is diagnostic-only, bounded, private and distinguishes target forms', async () => {
    const {proxyDenialContext}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const base={sandboxPort:30091,handler:'http',method:'GET',hostHeader:'127.0.0.1:30091',reason:'TARGET_NOT_ELIGIBLE'};
    for(const [raw,form,exact,substring,scheme,host] of [
        ['http://127.0.0.1:30091/path?secret=hidden','absolute',true,false,'http:','127.0.0.1'],
        ['ws://127.0.0.1:30091/socket.io/?secret=hidden','absolute',true,false,'ws:','127.0.0.1'],
        ['127.0.0.1:30091','authority',true,false,'http:','127.0.0.1'],
        ['/path?secret=hidden','origin',false,false,'unparsed','unparsed'],
        ['https://other.invalid/?next=127.0.0.1:30091&secret=hidden','absolute',false,true,'https:','non-owned-redacted'],
        ['http://user:password@127.0.0.1:30091/path','absolute',false,true,'http:','127.0.0.1'],
        ['http://localhost:30091/','absolute',false,false,'http:','non-owned-redacted'],
        ['http://127.0.0.1:30092/','absolute',false,false,'http:','127.0.0.1'],
        ['*','asterisk',false,false,'unparsed','unparsed']
    ]){
        const row=proxyDenialContext({...base,rawTarget:raw,upgradeHeader:'WebSocket'});
        assert.equal(row.targetForm,form);assert.equal(row.exactOwnedAuthority,exact);assert.equal(row.substringOnly,substring);assert.equal(row.scheme,scheme);assert.equal(row.host,host);
        assert.equal(row.targetLength,raw.length);assert.match(row.targetSHA256,/^[0-9a-f]{64}$/);assert.equal(row.targetHashTruncated,false);
        assert.equal(row.upgradeClass,'websocket');assert.equal(row.hostHeaderClass,'exact-owned');assert.equal(row.dnsDispatched,false);assert.equal(row.upstreamDispatched,false);
        assert.ok(Object.isFrozen(row));assert.ok(JSON.stringify(row).length<1024);assert.ok(!JSON.stringify(row).includes('hidden'));assert.ok(!JSON.stringify(row).includes('password'));assert.ok(!JSON.stringify(row).includes('other.invalid'));
    }
    const oversized=proxyDenialContext({...base,rawTarget:'/'+'x'.repeat(20000),hostHeader:'private.invalid',upgradeHeader:'sensitive-value',method:'x'.repeat(80)});
    assert.equal(oversized.targetHashTruncated,true);assert.equal(oversized.targetLength,20001);assert.equal(oversized.method,'other');assert.equal(oversized.upgradeClass,'other');assert.equal(oversized.hostHeaderClass,'non-owned-redacted');assert.ok(JSON.stringify(oversized).length<1024);
    // Diagnostic parsing must not change eligibility, including canonicalized aliases or credentials.
    for(const raw of ['http://127.1:30091/','http://127.0.0.1:30091@other.invalid/','http://user:password@127.0.0.1:30091/','/origin','127.0.0.1:30091','https://127.0.0.1:30091/'])assert.equal(localSandboxURL(raw,30091),null);
});

test('proxy denial metadata precedes failure callbacks and retains connection request history', async () => {
    const {EventEmitter}=await import('node:events');
    const {proxyDenialContext,createProxyClientLedger}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const denials=[],errors=[],failures=[];let upstreamDispatches=0;
    const ledger=createProxyClientLedger({recordDenial:row=>denials.push(row),record:row=>errors.push(row),onFailure:row=>{assert.equal(denials.at(-1),row.denial);failures.push(row);}});
    const client=new EventEmitter();client.destroy=()=>client.emit('close');
    const context=proxyDenialContext({handler:'connect',method:'CONNECT',rawTarget:'127.0.0.1:30091',sandboxPort:30091,hostHeader:'127.0.0.1:30091',reason:'CONNECT_NOT_ADMITTED'});
    ledger.begin(client);ledger.deny(client,{intendedOwned:true,context});
    assert.equal(denials.length,1);assert.equal(denials[0].requestOrdinal,1);assert.equal(denials[0].priorForwarding,false);assert.equal(denials[0].reason,'CONNECT_NOT_ADMITTED');assert.equal(failures[0].code,'OWNED_ENDPOINT_DENIED');assert.equal(upstreamDispatches,0);
    ledger.begin(client);ledger.forward(client);upstreamDispatches++;
    ledger.begin(client);ledger.deny(client,{intendedOwned:true,context});
    assert.equal(denials[1].connectionId,denials[0].connectionId);assert.equal(denials[1].requestOrdinal,3);assert.equal(denials[1].priorForwarding,true);assert.equal(upstreamDispatches,1);client.destroy();
});

test('actual local proxy preserves CONNECT and target denials with zero upstream dispatch and bounded metadata', {timeout:10000}, async t => {
    const net=(await import('node:net')).default;
    const controller=new AbortController(),clients=new Set(),peers=new Set(),failures=[];
    const workDeadline=performance.now()+7000;
    let upstreamDispatches=0,upstreamConnections=0,proxy,proxyOpening,proxyClosePromise,cleanupPromise,stopping=false;
    const upstream=http.createServer((_req,res)=>{upstreamDispatches++;res.end('unexpected');});
    const destroyOwned=()=>{for(const socket of clients)socket.destroy();for(const socket of peers)socket.destroy();};
    const cancel=reason=>{stopping=true;controller.abort(reason);destroyOwned();};
    const bounded=(promise,milliseconds,label,signal)=>new Promise((resolve,reject)=>{
        let settled=false;
        const finish=(error,value)=>{if(settled)return;settled=true;clearTimeout(timer);signal?.removeEventListener('abort',aborted);error?reject(error):resolve(value);};
        const aborted=()=>finish(new Error('Cancelled during '+label,{cause:signal.reason}));
        const timer=setTimeout(()=>finish(new Error('Deadline during '+label)),Math.max(0,milliseconds));
        Promise.resolve(promise).then(value=>finish(null,value),error=>finish(error));
        if(signal?.aborted)aborted();else signal?.addEventListener('abort',aborted,{once:true});
    });
    const wait=(promise,label)=>bounded(promise,workDeadline-performance.now(),label,controller.signal);
    const closeServer=()=>new Promise((resolve,reject)=>upstream.close(error=>error&&error.code!=='ERR_SERVER_NOT_RUNNING'?reject(error):resolve()));
    const closeProxy=()=>proxyClosePromise??=(proxy?proxy.close():Promise.resolve());
    const cleanup=()=>cleanupPromise??=(async()=>{
        stopping=true;clearTimeout(operationTimer);destroyOwned();
        await bounded(Promise.all([proxyOpening?.then(()=>closeProxy(),()=>{}),closeServer()]),1500,'owned denial cleanup');
    })();
    const cancelled=()=>cancel(t.signal.reason);
    const operationTimer=setTimeout(()=>cancel(new Error('Whole denial operation deadline')),7000);
    t.signal.addEventListener('abort',cancelled,{once:true});
    t.after(async()=>{try{await cleanup();}finally{clearTimeout(operationTimer);t.signal.removeEventListener('abort',cancelled);}});
    upstream.on('error',cancel);
    upstream.on('connection',socket=>{upstreamConnections++;peers.add(socket);socket.on('close',()=>peers.delete(socket));socket.on('error',cancel);if(stopping)socket.destroy();});
    upstream.on('connect',()=>{upstreamDispatches++;});upstream.on('upgrade',()=>{upstreamDispatches++;});
    const exchange=request=>new Promise((resolve,reject)=>{
        if(stopping||controller.signal.aborted){reject(new Error('Denial fixture stopped'));return;}
        const socket=net.createConnection({host:'127.0.0.1',port:30092});clients.add(socket);let data='',settled=false;
        const finish=error=>{if(settled)return;settled=true;socket.destroy();error?reject(error):resolve();};
        socket.on('error',finish);socket.on('data',b=>{data+=b.toString();if(data.length>2048)finish(new Error('Owned denial capture bound'));});
        socket.on('connect',()=>{if(stopping)socket.destroy();else socket.end(request);});
        socket.on('close',()=>{clients.delete(socket);try{assert.match(data,/403/);finish();}catch(error){finish(error);}});
    });
    try{
        controller.signal.throwIfAborted();
        const listening=once(upstream,'listening');upstream.listen(30091,'127.0.0.1');await wait(listening,'upstream listen');
        assert.deepEqual(upstream.address(),{address:'127.0.0.1',family:'IPv4',port:30091});
        proxyOpening=startLocalOnlyProxy({sandboxPort:30091,proxyPort:30092,onFailure:row=>failures.push(row)}).then(value=>{
            proxy=value;if(stopping)closeProxy().catch(()=>{});return value;
        });
        await wait(proxyOpening,'proxy listen');
        for(const target of ['127.0.0.1:30091','other.invalid:443'])await wait(exchange('CONNECT '+target+' HTTP/1.1\r\nHost: '+target+'\r\n\r\n'),'denial exchange');
        await wait(exchange('GET /origin?secret=hidden HTTP/1.1\r\nHost: 127.0.0.1:30091\r\nConnection: close\r\n\r\n'),'denial exchange');
        await wait(exchange('GET http://127.0.0.1:30091/path HTTP/1.1\r\nHost: 127.0.0.1:30091\r\nConnection: Upgrade\r\nUpgrade: not-websocket\r\n\r\n'),'denial exchange');
        for(let i=0;i<16;i++)await wait(exchange('GET http://other.invalid/private?secret=hidden HTTP/1.1\r\nHost: other.invalid\r\nConnection: close\r\n\r\n'),'denial exchange');
        assert.equal(upstreamConnections,0);assert.equal(upstreamDispatches,0);assert.equal(proxy.counts.httpAllowed,0);assert.equal(proxy.counts.websocketAllowed,0);assert.equal(proxy.counts.blocked,20);
        assert.equal(proxy.counts.denialCount,20);assert.equal(proxy.denials.length,16);assert.equal(proxy.counts.omittedDenials,4);
        assert.equal(proxy.denials[0].handler,'connect');assert.equal(proxy.denials[0].method,'CONNECT');assert.equal(proxy.denials[0].exactOwnedAuthority,true);assert.equal(proxy.denials[0].reason,'CONNECT_NOT_ADMITTED');
        assert.equal(proxy.denials[1].exactOwnedAuthority,false);assert.equal(proxy.denials[2].targetForm,'origin');assert.equal(proxy.denials[3].handler,'upgrade');assert.equal(proxy.denials[3].upgradeClass,'other');
        assert.equal(proxy.denials[3].reason,'UPGRADE_HEADER_NOT_WEBSOCKET');assert.equal(failures.filter(x=>x.code==='OWNED_ENDPOINT_DENIED').length,2);
        assert.ok(proxy.denials.every(x=>x.dnsDispatched===false&&x.upstreamDispatched===false));assert.ok(!JSON.stringify(proxy.denials).includes('hidden'));
    }finally{await cleanup();}
});


test('owned CONNECT authority requires exact target and a single unambiguous Host', async () => {
    const {validateOwnedConnectRequest} = await import('../tools/foundry-p05-sandbox-check.mjs');
    const valid = () => ({method:'CONNECT',url:'127.0.0.1:30091',httpVersion:'1.1',
        rawHeaders:['Host','127.0.0.1:30091'],headers:{host:'127.0.0.1:30091'}});
    assert.equal(validateOwnedConnectRequest(valid()),true);
    for (const target of ['localhost:30091','127.1:30091','2130706433:30091','[::1]:30091',
        '127.0.0.1:030091','127.0.0.1:30092','127.0.0.1:30091/','http://127.0.0.1:30091',
        'user@127.0.0.1:30091','127.0.0.1:30091@other.invalid','127.0.0.1:30091?x','127.0.0.1:30091 ']) {
        assert.equal(validateOwnedConnectRequest({...valid(),url:target}),false,target);
    }
    for (const rawHeaders of [[],['Host','other.invalid:443'],['Host','127.0.0.1:30091','host','127.0.0.1:30091'],
        ['Host','127.0.0.1:30091','Host','other.invalid:443'],['Host','127.0.0.1:30091','Forwarded','host=other.invalid'],
        ['Host','127.0.0.1:30091','X-Forwarded-Host','other.invalid'],['Host','127.0.0.1:30091','Proxy-Authorization','secret'],
        ['Host','127.0.0.1:30091','Authorization','secret'],['Host','127.0.0.1:30091','Content-Length','0'],
        ['Host','127.0.0.1:30091','Transfer-Encoding','chunked'],['Host','127.0.0.1:30091',':authority','other.invalid'],
        ['Host','127.0.0.1:30091','X-Note','x'.repeat(16384)]]) {
        assert.equal(validateOwnedConnectRequest({...valid(),rawHeaders}),false);
    }
    assert.equal(validateOwnedConnectRequest({...valid(),httpVersion:'1.0'}),false);
    assert.equal(validateOwnedConnectRequest({...valid(),method:'GET'}),false);
    assert.equal(validateOwnedConnectRequest({...valid(),headers:{host:'other.invalid'}}),false);
    assert.equal(validateOwnedConnectRequest(valid(),30092),false);
});

async function inertConnectHarness(t,{limits={},verify,connect='success',stallPeer=false}={}) {
    const {Duplex} = await import('node:stream');
    const {createOwnedConnectManager} = await import('../tools/foundry-p05-sandbox-check.mjs');
    const failures=[],created=[],held=[];let proofs=0;
    class Socket extends Duplex {
        constructor(stall=false) { super({allowHalfOpen:true,readableHighWaterMark:65536,writableHighWaterMark:32});this.writes=[];this.stall=stall;this.remoteAddress='127.0.0.1';this.remotePort=30091; }
        _read() {}
        _write(chunk,_encoding,callback) { this.writes.push(Buffer.from(chunk));if(this.stall)held.push(callback);else callback(); }
        _final(callback) { this.push(null);callback(); }
        _destroy(error,callback) { for(const release of held.splice(0))release();callback(error); }
        connect(options) { this.connectOptions=options;if(connect==='success')queueMicrotask(()=>this.emit('connect'));else if(connect==='error')queueMicrotask(()=>this.destroy(new Error('inert upstream failure')));return this; }
    }
    const proof = {pid:123,token:'12345678-1234-1234-1234-123456789012',address:'127.0.0.1',family:'IPv4',port:30091};
    const manager=createOwnedConnectManager({verifyOwnedListener:verify??(()=>{proofs++;return {...proof};}),limits,
        socketFactory:()=>{const peer=new Socket(stallPeer);created.push(peer);return peer;},
        onFailure:row=>failures.push(row)});
    const clients=[];
    const bounded=(promise,ms=1200)=>new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error('Inert CONNECT test deadline')),ms);
        Promise.resolve(promise).then(value=>{clearTimeout(timer);resolve(value);},error=>{clearTimeout(timer);reject(error);});
    });
    const waitFor=async condition=>{const deadline=Date.now()+1000;while(!condition()){t.signal.throwIfAborted();if(Date.now()>=deadline)throw new Error('Inert CONNECT condition deadline');await new Promise(r=>setTimeout(r,2));}};
    const cleanup=async()=>{for(const client of clients)client.destroy();for(const peer of created)peer.destroy();await bounded(manager.close());};
    t.after(cleanup); // Registered before the first client, ownership callback or dispatch.
    const open=head=>{t.signal.throwIfAborted();const client=new Socket();clients.push(client);client.on('error',()=>{});
        const request={method:'CONNECT',url:'127.0.0.1:30091',httpVersion:'1.1',rawHeaders:['Host','127.0.0.1:30091'],headers:{host:'127.0.0.1:30091'}};
        assert.equal(manager.handle(request,client,head??Buffer.alloc(0)),true);return client;};
    return {manager,created,failures,held,open,waitFor,cleanup,get proofs(){return proofs;}};
}

test('owned CONNECT retains head ordering, backpressure, proof and closure without DNS', {timeout:5000}, async t => {
    const h=await inertConnectHarness(t,{stallPeer:true});
    const client=h.open(Buffer.from('HEAD'.repeat(16)));
    await h.waitFor(()=>h.manager.counts.connected===1);
    const peer=h.created[0];
    assert.deepEqual(peer.connectOptions.host,'127.0.0.1');assert.equal(peer.connectOptions.port,30091);assert.equal(peer.connectOptions.family,4);
    assert.equal(peer.connectOptions.autoSelectFamily,false);assert.equal(h.proofs,2);assert.equal(h.manager.counts.dnsCalls,0);
    assert.equal(Buffer.concat(client.writes).toString(),'HTTP/1.1 200 Connection Established\r\n\r\n');
    // The head write remains pending; later client bytes must not overtake it.
    client.push(Buffer.alloc(4096,65));await new Promise(r=>setImmediate(r));
    assert.equal(Buffer.concat(peer.writes).toString(),'HEAD'.repeat(16));assert.equal(client.readableFlowing,false);
    peer.stall=false;for(const release of h.held.splice(0))release();
    await h.waitFor(()=>Buffer.concat(peer.writes).length===4160);
    assert.equal(Buffer.concat(peer.writes).subarray(0,4).toString(),'HEAD');
    peer.push(Buffer.from('REPLY'));await h.waitFor(()=>Buffer.concat(client.writes).includes(Buffer.from('REPLY')));
    client.push(null);
    await h.waitFor(()=>h.manager.counts.active===0);
    assert.equal(h.failures.length,0);assert.equal(h.manager.counts.closed,1);
    const row=h.manager.records[0];assert.equal(row.ownerChecks,2);assert.equal(row.clientToUpstreamBytes,4160);assert.equal(row.upstreamToClientBytes,5);
    assert.equal(row.clientClosed,true);assert.equal(row.upstreamClosed,true);
    assert.ok(!JSON.stringify(row).includes('HEAD'));assert.ok(!JSON.stringify(row).includes('REPLY'));
});

test('owned CONNECT abort and failed ownership never dispatch, and upstream failures never return 200', {timeout:5000}, async t => {
    const invalid=await inertConnectHarness(t,{verify:()=>({pid:123,token:'bad',address:'127.0.0.1',family:'IPv4',port:30091})});
    const bad=invalid.open();await invalid.waitFor(()=>invalid.manager.counts.active===0);
    assert.equal(invalid.created.length,0);assert.equal(bad.writes.length,0);assert.equal(invalid.failures[0].code,'CONNECT_ADMISSION_FAILED');
    let release;const delayed=await inertConnectHarness(t,{verify:()=>new Promise(resolve=>{release=resolve;})});
    const aborted=delayed.open();aborted.destroy();await delayed.waitFor(()=>delayed.manager.counts.active===0);
    release({pid:123,token:'12345678-1234-1234-1234-123456789012',address:'127.0.0.1',family:'IPv4',port:30091});
    await new Promise(r=>setImmediate(r));assert.equal(delayed.created.length,0);
    assert.equal(aborted.writes.length,0);assert.equal(delayed.failures[0].code,'CONNECT_PREMATURE_CLOSE');
    assert.equal(delayed.manager.records[0].reason,'CONNECT_PREMATURE_CLOSE');
    const failing=await inertConnectHarness(t,{connect:'error'});const client=failing.open();
    await failing.waitFor(()=>failing.manager.counts.active===0);
    assert.equal(client.writes.length,0);assert.equal(failing.manager.counts.connected,0);
    assert.equal(failing.failures[0].code,'CONNECT_UPSTREAM_ERROR');
});

test('owned CONNECT freezes finite negotiation, lifetime, byte and concurrency bounds', {timeout:6000}, async t => {
    const timeout=await inertConnectHarness(t,{connect:'pending',limits:{connectMs:20}});
    timeout.open();await timeout.waitFor(()=>timeout.manager.counts.active===0);
    assert.equal(timeout.failures[0].code,'CONNECT_NEGOTIATION_DEADLINE');assert.equal(timeout.created[0].destroyed,true);
    const lifetime=await inertConnectHarness(t,{limits:{lifetimeMs:25}});
    lifetime.open();await lifetime.waitFor(()=>lifetime.manager.counts.active===0);
    assert.equal(lifetime.failures[0].code,'CONNECT_LIFETIME_DEADLINE');
    const bytes=await inertConnectHarness(t,{limits:{directionBytes:8}});
    const client=bytes.open(Buffer.from('HEAD'));await bytes.waitFor(()=>bytes.manager.counts.connected===1);
    client.push(Buffer.from('12345678'));await bytes.waitFor(()=>bytes.manager.counts.active===0);
    assert.equal(bytes.failures[0].code,'CONNECT_STREAM_ERROR');
    const capacity=await inertConnectHarness(t,{connect:'pending',limits:{concurrent:1,connectMs:30}});
    capacity.open();capacity.open();await capacity.waitFor(()=>capacity.manager.counts.active===0);
    assert.equal(capacity.created.length,1);assert.ok(capacity.failures.some(x=>x.code==='CONNECT_ADMISSION_BOUND'));
    const head=await inertConnectHarness(t,{limits:{headBytes:4}});
    head.open(Buffer.from('12345'));await head.waitFor(()=>head.manager.counts.active===0);assert.equal(head.created.length,0);
});

test('actual owned CONNECT forwards only fixed loopback bytes and rejects neighboring authorities before contact', {timeout:12000}, async t => {
    const net=(await import('node:net')).default,dns=(await import('node:dns')).default;
    const clients=new Set(),peers=new Set(),failures=[];let proxy,opening,stopping=false,cleaning,connections=0,dnsCalls=0;
    const end=performance.now()+8000,abort=new AbortController();
    const bounded=(promise,ms,label)=>new Promise((resolve,reject)=>{
        const timer=setTimeout(()=>reject(new Error(label+' deadline')),Math.max(1,ms));
        Promise.resolve(promise).then(v=>{clearTimeout(timer);resolve(v);},e=>{clearTimeout(timer);reject(e);});
    });
    const wait=(promise,label)=>bounded(Promise.race([promise,new Promise((_,reject)=>{if(abort.signal.aborted)reject(abort.signal.reason);else abort.signal.addEventListener('abort',()=>reject(abort.signal.reason),{once:true});})]),end-performance.now(),label);
    const upstream=net.createServer({allowHalfOpen:true},socket=>{
        connections++;peers.add(socket);socket.on('close',()=>peers.delete(socket));socket.on('error',e=>abort.abort(e));
        socket.on('data',b=>socket.write(b));socket.on('end',()=>socket.end());if(stopping)socket.destroy();
    });
    upstream.on('error',e=>abort.abort(e));
    const destroy=()=>{for(const s of clients)s.destroy();for(const s of peers)s.destroy();};
    const cleanup=()=>cleaning??=(async()=>{stopping=true;clearTimeout(operationTimer);destroy();
        await bounded(Promise.all([opening?.then(()=>proxy.close(),()=>{}),new Promise((resolve,reject)=>upstream.close(e=>e&&e.code!=='ERR_SERVER_NOT_RUNNING'?reject(e):resolve()))]),1500,'owned CONNECT cleanup');
    })();
    const cancel=()=>{abort.abort(t.signal.reason??new Error('CONNECT fixture cancelled'));destroy();};
    const operationTimer=setTimeout(()=>{abort.abort(new Error('CONNECT fixture operation deadline'));destroy();},8000);
    t.signal.addEventListener('abort',cancel,{once:true});
    t.after(async()=>{try{await cleanup();}finally{t.signal.removeEventListener('abort',cancel);clearTimeout(operationTimer);}});
    const originalLookup=dns.lookup;
    try {
        const listening=once(upstream,'listening');upstream.listen(30091,'127.0.0.1');await wait(listening,'upstream listen');
        const verifyOwnedListener=()=>{const a=upstream.address();if(!upstream.listening||a?.address!=='127.0.0.1'||a.port!==30091)throw new Error('Owned test listener gone');
            return {pid:process.pid,token:'12345678-1234-1234-1234-123456789012',address:a.address,family:a.family,port:a.port};};
        opening=startLocalOnlyProxy({sandboxPort:30091,proxyPort:30092,verifyOwnedListener,onFailure:row=>failures.push(row)}).then(v=>{proxy=v;if(stopping)proxy.close().catch(()=>{});return v;});
        await wait(opening,'proxy listen');
        dns.lookup=()=>{dnsCalls++;throw new Error('Unexpected DNS');};
        const exchange=(headers,{head='',payload=''}={})=>new Promise((resolve,reject)=>{
            const socket=new net.Socket({allowHalfOpen:true});clients.add(socket);let output=Buffer.alloc(0),sent=false,settled=false;
            const finish=error=>{if(settled)return;settled=true;socket.destroy();error?reject(error):resolve(output);};
            socket.on('error',finish);socket.on('close',()=>{clients.delete(socket);finish();});
            socket.on('data',b=>{output=Buffer.concat([output,b]);if(output.length>1048576){finish(new Error('CONNECT test capture bound'));return;}
                if(!sent&&output.includes(Buffer.from('\r\n\r\n'))){sent=true;if(payload)socket.end(payload);else socket.end();}});
            socket.on('connect',()=>socket.write(headers+head));
            socket.connect({host:'127.0.0.1',port:30092,family:4});
        });
        for(const headers of [
            'CONNECT localhost:30091 HTTP/1.1\r\nHost: localhost:30091\r\n\r\n',
            'CONNECT 127.0.0.1:30092 HTTP/1.1\r\nHost: 127.0.0.1:30092\r\n\r\n',
            'CONNECT 127.0.0.1:30091 HTTP/1.1\r\n\r\n',
            'CONNECT 127.0.0.1:30091 HTTP/1.1\r\nHost: 127.0.0.1:30091\r\nHost: other.invalid\r\n\r\n',
            'CONNECT 127.0.0.1:30091 HTTP/1.1\r\nHost: 127.0.0.1:30091\r\nHost: 127.0.0.1:30091\r\n\r\n']) {
            const out=await wait(exchange(headers),'neighbor denial');assert.match(out.toString(),/^HTTP\/1\.1 (403|400)/);
            assert.equal(connections,0);
        }
        const payload='x'.repeat(262144);
        const output=await wait(exchange('CONNECT 127.0.0.1:30091 HTTP/1.1\r\nHost: 127.0.0.1:30091\r\n\r\n',{head:'HEAD',payload}),'fixed tunnel');
        const expected=Buffer.from('HTTP/1.1 200 Connection Established\r\n\r\nHEAD'+payload);
        assert.deepEqual(output,expected);assert.equal(connections,1);assert.equal(dnsCalls,0);
        assert.equal(proxy.tunnelCounts.connected,1);assert.equal(proxy.tunnelCounts.dnsCalls,0);
        assert.equal(proxy.tunnelCounts.clientToUpstreamBytes,262148);assert.equal(proxy.tunnelCounts.upstreamToClientBytes,262148);
        assert.ok(failures.every(row=>row.code==='OWNED_ENDPOINT_DENIED')); // Existing owned-target denial remains fatal.
    } finally { dns.lookup=originalLookup;await cleanup(); }
});


test('owned CONNECT leaves unverified closure explicit and rejects the close promise', {timeout:3000}, async t => {
    const {Duplex}=await import('node:stream');
    const {createOwnedConnectManager}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const failures=[];
    class Stuck extends Duplex {
        _read() {}
        _write(_chunk,_encoding,callback){callback();}
        _destroy(_error,_callback){} // Inert fixture: deliberately no close notification.
    }
    const client=new Stuck();
    const manager=createOwnedConnectManager({
        verifyOwnedListener:()=>new Promise(()=>{}), // No network or other live resource.
        limits:{connectMs:15,closeMs:15},onFailure:row=>failures.push(row),
        socketFactory:()=>{throw new Error('Must not reach socket creation');}
    });
    t.after(()=>{client.removeAllListeners();});
    const req={method:'CONNECT',url:'127.0.0.1:30091',httpVersion:'1.1',rawHeaders:['Host','127.0.0.1:30091'],headers:{host:'127.0.0.1:30091'}};
    assert.equal(manager.handle(req,client,Buffer.alloc(0)),true);
    await assert.rejects(manager.close(),/closure not established/);
    assert.equal(manager.counts.closed,0);assert.equal(manager.counts.unverifiedClosures,1);
    assert.equal(manager.records[0].phase,'closure-unverified');assert.equal(manager.records[0].clientClosed,false);
    assert.ok(failures.some(row=>row.code==='CONNECT_CLOSE_DEADLINE'));
});


test('proxy cleanup attempts every owned resource after tunnel closure rejection', async () => {
    const {closeOwnedProxyResources}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const calls=[],failure=new Error('Owned CONNECT pair closure not established');
    const resources={
        tunnels:{close:async()=>{calls.push('tunnels');throw failure;}},
        upstreams:new Set([{destroy(){calls.push('request');}}]),
        sockets:new Set([{destroy(){calls.push('socket');}}]),
        server:{listening:true,close(callback){calls.push('server');this.listening=false;callback();}},
        clients:{settleClosures:async()=>{calls.push('denied-clients');},pendingClosures:0}
    };
    await assert.rejects(closeOwnedProxyResources(resources),error=>error===failure);
    assert.deepEqual(calls,['tunnels','request','socket','server','denied-clients']);
    assert.equal(resources.server.listening,false);
    calls.length=0;
    resources.upstreams.add({destroy(){calls.push('failed-request');throw new Error('request close');}});
    resources.server.listening=true;
    await assert.rejects(closeOwnedProxyResources(resources),error=>{
        assert.ok(error instanceof AggregateError);assert.equal(error.errors[0],failure);return true;
    });
    assert.deepEqual(calls,['tunnels','request','failed-request','socket','server','denied-clients']);
});

async function inertProofHarness() {
    const {EventEmitter}=await import('node:events');
    const {createOwnedListenerVerifier}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const child=new EventEmitter(),owner='12345678-1234-1234-1234-123456789012';
    Object.assign(child,{pid:123,connected:true,killed:false,exitCode:null,signalCode:null});
    const timers=new Map(),sent=[],callbacks=[];let timerId=0,currentChild=child,nonce=0;
    const initial={pid:123,owner,address:{address:'127.0.0.1',family:'IPv4',port:30091}};
    child.send=(value,callback)=>{sent.push(value);callbacks.push(callback);};
    const verify=createOwnedListenerVerifier({getChild:()=>currentChild,getInitialProof:()=>initial,owner,
        challengeFactory:()=>String(++nonce).padStart(32,'0'),timers:{
            setTimeout(callback,ms){assert.equal(ms,1000);timers.set(++timerId,callback);return timerId;},
            clearTimeout(id){timers.delete(id);}
        }});
    const reply=(change={})=>({type:'ptu-listener-proof',challenge:sent.at(-1)?.challenge,
        owner,pid:123,address:{address:'127.0.0.1',family:'IPv4',port:30091},...change});
    const clean=()=>{assert.equal(timers.size,0);for(const event of ['message','exit','error','disconnect'])assert.equal(child.listenerCount(event),0,event);};
    const timeout=()=>{assert.equal(timers.size,1);[...timers.values()][0]();};
    return {child,initial,owner,sent,callbacks,timers,verify,reply,clean,timeout,replace:()=>{currentChild=new EventEmitter();}};
}

test('actual IPC verifier uses fresh challenges and removes every listener and timer', async () => {
    const h=await inertProofHarness();
    const first=h.verify();assert.equal(h.timers.size,1);h.child.emit('message',h.reply());
    assert.deepEqual(await first,{pid:123,token:h.owner,address:'127.0.0.1',family:'IPv4',port:30091});h.clean();
    const prior=h.sent[0].challenge;
    const next=h.verify();assert.notEqual(h.sent[1].challenge,prior);
    h.child.emit('message',h.reply({challenge:prior}));assert.equal(h.timers.size,1);
    h.child.emit('message',h.reply());await next;h.clean();
});

test('actual IPC verifier fails closed on challenge, identity, liveness and send failures', async () => {
    for(const [name,act] of [
        ['wrong challenge',h=>{h.child.emit('message',h.reply({challenge:'f'.repeat(32)}));assert.equal(h.timers.size,1);h.timeout();}],
        ['missing challenge',h=>{h.child.emit('message',h.reply({challenge:undefined}));assert.equal(h.timers.size,1);h.timeout();}],
        ['missing reply',h=>h.timeout()],
        ['wrong owner',h=>h.child.emit('message',h.reply({owner:'a'.repeat(32)}))],
        ['wrong PID',h=>h.child.emit('message',h.reply({pid:124}))],
        ['wrong address',h=>h.child.emit('message',h.reply({address:{address:'127.0.0.2',family:'IPv4',port:30091}}))],
        ['wrong family',h=>h.child.emit('message',h.reply({address:{address:'127.0.0.1',family:'IPv6',port:30091}}))],
        ['wrong port',h=>h.child.emit('message',h.reply({address:{address:'127.0.0.1',family:'IPv4',port:30092}}))],
        ['child exit',h=>{h.child.exitCode=1;h.child.emit('exit',1);}],
        ['child disconnect',h=>{h.child.connected=false;h.child.emit('disconnect');}],
        ['child error',h=>h.child.emit('error',new Error('inert IPC error'))],
        ['send callback failure',h=>h.callbacks[0](new Error('inert send failure'))],
        ['silent disconnected reply',h=>{h.child.connected=false;h.child.emit('message',h.reply());}],
        ['replaced captured child',h=>{h.replace();h.child.emit('message',h.reply());}],
        ['killed reply',h=>{h.child.killed=true;h.child.emit('message',h.reply());}]
    ]) {
        const h=await inertProofHarness(),pending=h.verify();
        const rejected=assert.rejects(pending,/Owned listener|Current listener/,name);
        act(h);await rejected;h.clean();
        // A late matching reply cannot reopen a settled verifier or recreate timers.
        h.child.emit('message',h.reply());h.clean();
    }
    const initial=await inertProofHarness();initial.child.connected=false;
    await assert.rejects(initial.verify(),/not live/);assert.equal(initial.sent.length,0);initial.clean();
    const thrown=await inertProofHarness();thrown.child.send=()=>{throw new Error('send throw');};
    await assert.rejects(thrown.verify(),/IPC failed/);thrown.clean();
});

test('actual adapter challenge responder requires its captured current listener', async () => {
    const {replyToOwnedListenerChallenge}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const owner='12345678-1234-1234-1234-123456789012',sent=[],failures=[];
    const input=()=>({message:{type:'ptu-listener-proof',owner,challenge:'1'.repeat(32)},owner,pid:123,
        listener:{listening:true,address:()=>({address:'127.0.0.1',family:'IPv4',port:30091})},connected:true,
        send:(value,callback)=>{sent.push(value);callback();},onError:error=>failures.push(error)});
    assert.equal(replyToOwnedListenerChallenge(input()),true);assert.equal(sent.length,1);
    assert.deepEqual(sent[0],{type:'ptu-listener-proof',owner,pid:123,challenge:'1'.repeat(32),address:{address:'127.0.0.1',family:'IPv4',port:30091}});
    for(const changed of [
        {connected:false},{listener:null},{listener:{listening:false}},
        {listener:{listening:true,address:()=>null}},
        {listener:{listening:true,address:()=>({address:'127.0.0.2',family:'IPv4',port:30091})}},
        {listener:{listening:true,address:()=>({address:'127.0.0.1',family:'IPv6',port:30091})}},
        {listener:{listening:true,address:()=>({address:'127.0.0.1',family:'IPv4',port:30092})}},
        {message:{type:'ptu-listener-proof',owner,challenge:'bad'}},
        {message:{type:'ptu-listener-proof',owner:'other',challenge:'1'.repeat(32)}}
    ])assert.equal(replyToOwnedListenerChallenge({...input(),...changed}),false);
    assert.equal(sent.length,1);
    replyToOwnedListenerChallenge({...input(),send:(_value,callback)=>callback(new Error('IPC closed'))});
    replyToOwnedListenerChallenge({...input(),send:()=>{throw new Error('IPC throw');}});
    assert.equal(failures.length,2);
});

test('CONNECT rechecks ownership after TCP and closes both endpoints before any 200 on failure', {timeout:6000}, async t => {
    const valid={pid:123,token:'12345678-1234-1234-1234-123456789012',address:'127.0.0.1',family:'IPv4',port:30091};
    for(const next of [null,{...valid,pid:124},{...valid,token:'a'.repeat(32)},
        {...valid,address:'127.0.0.2'}, {...valid,port:30092}, new Error('proof unavailable')]) {
        t.signal.throwIfAborted();let calls=0;
        const h=await inertConnectHarness(t,{verify:()=>{
            if(++calls===1)return {...valid};
            if(next instanceof Error)throw next;return next;
        }});
        const client=h.open();await h.waitFor(()=>h.manager.counts.active===0);
        assert.equal(calls,2);assert.equal(h.created.length,1);assert.equal(client.writes.length,0);
        assert.equal(client.closed,true);assert.equal(h.created[0].closed,true);
        assert.equal(h.manager.counts.connected,0);assert.equal(h.failures[0].code,'CONNECT_NEGOTIATION_FAILED');
    }
});

test('CONNECT rejecting lookup callback fails without DNS fallback or success response', {timeout:3000}, async t => {
    const h=await inertConnectHarness(t,{connect:'pending'}),client=h.open();
    await h.waitFor(()=>h.created.length===1);
    let callbacks=0;h.created[0].connectOptions.lookup('127.0.0.1',{},error=>{
        callbacks++;assert.match(error.message,/DNS forbidden/);
    });
    await h.waitFor(()=>h.manager.counts.active===0);
    assert.equal(callbacks,1);assert.equal(client.writes.length,0);
    assert.equal(h.manager.counts.dnsCalls,1);assert.equal(h.manager.records[0].dnsCalls,1);
    assert.equal(h.failures[0].code,'CONNECT_DNS_FORBIDDEN');
    assert.equal(h.created[0].closed,true);assert.equal(client.closed,true);
});

test('CONNECT session, aggregate and queued-buffer limits stop admitted streams', {timeout:6000}, async t => {
    const sessions=await inertConnectHarness(t,{limits:{sessions:1}});
    const first=sessions.open();await sessions.waitFor(()=>sessions.manager.counts.connected===1);
    first.push(null);await sessions.waitFor(()=>sessions.manager.counts.active===0);
    const second=sessions.open();await sessions.waitFor(()=>second.closed);
    assert.equal(sessions.created.length,1);assert.equal(second.writes.length,0);
    assert.equal(sessions.failures[0].code,'CONNECT_ADMISSION_BOUND');
    const aggregate=await inertConnectHarness(t,{limits:{aggregateBytes:10}});
    const a=aggregate.open(Buffer.from('1234'));await aggregate.waitFor(()=>aggregate.manager.counts.connected===1);
    aggregate.created[0].push(Buffer.from('5678'));
    await aggregate.waitFor(()=>aggregate.manager.counts.upstreamToClientBytes===4);
    a.push(null);await aggregate.waitFor(()=>aggregate.manager.counts.active===0);
    const b=aggregate.open();await aggregate.waitFor(()=>aggregate.manager.counts.connected===2);
    b.push(Buffer.from('xyz'));await aggregate.waitFor(()=>aggregate.manager.counts.active===0);
    assert.equal(aggregate.failures[0].code,'CONNECT_STREAM_ERROR');
    assert.match(aggregate.failures[0].message,/byte bound/);
    assert.equal(aggregate.manager.counts.clientToUpstreamBytes+aggregate.manager.counts.upstreamToClientBytes,8);
    const buffered=await inertConnectHarness(t,{limits:{bufferedBytes:32}});
    const c=buffered.open();await buffered.waitFor(()=>buffered.manager.counts.connected===1);
    c.push(Buffer.alloc(64));await buffered.waitFor(()=>buffered.manager.counts.active===0);
    assert.equal(buffered.failures[0].code,'CONNECT_STREAM_ERROR');assert.match(buffered.failures[0].message,/buffer bound/);
});

test('native matrix freezes eight source-derived oracles and unique stable synthetic identities', async()=>{
    const {strict:assert}=await import('node:assert');
    const {NATIVE_MATRIX_V1:m}=await import('../tools/foundry-p05-sandbox-check.mjs');
    assert.equal(m.length,8);assert.ok(Object.isFrozen(m));
    assert.deepEqual(m.map(s=>s.stats[1]),[10,17,22,10,14,22,22,29]);
    assert.deepEqual(m.map(s=>s.contests[0]),[1,1,2,1,1,2,2,2]);
    assert.deepEqual(m[1].stats,[13,17,10,8,10,10]);assert.deepEqual(m[4].finalStats,[10,22,10,10,10,10]);
    const ids=m.flatMap(s=>[s.actorId,s.speciesId,s.ruleId].filter(Boolean));
    assert.equal(new Set(ids).size,ids.length);assert.ok(ids.every(id=>/^[A-Za-z0-9]{16}$/.test(id)));
    for(const s of m){assert.ok(Object.isFrozen(s));assert.ok(Object.isFrozen(s.stats));assert.ok(Object.isFrozen(s.contests));}
});

test('native matrix orchestration permits one reload and retains failure/cleanup evidence without retry', async()=>{
    const {strict:assert}=await import('node:assert');
    const {checkNativePreparationMatrix:run}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const options={runId:'p05-20261116-native-matrix-v1',origin:'http://127.0.0.1:30091',servedHugePowerSHA256:'a'.repeat(64)};
    for(const failure of [null,'preflight','create','reload','mismatch','cleanup']){
        const calls=[];let reloads=0;
        const page={
            async evaluate(fn,args){
                const phase=args.phase??(calls.length===0?'preflight':'cleanup');calls.push(phase);
                if(phase==='preflight'){if(failure==='preflight')throw new Error('preexisting');return {absent:true};}
                if(phase==='cleanup')return {deleted:failure!=='cleanup',results:[]};
                if(phase==='create'&&failure==='create')return {ok:false,error:'stats expected=22 actual=34',stages:[{stage:'created'}]};
                if(phase==='reload'&&failure==='reload')throw new Error('reload-evaluation-error');
                return {ok:true,snapshots:[{value:failure==='mismatch'&&phase==='reload'?2:1}],stages:[]};
            },
            async reload(){reloads++;},async waitForFunction(){}
        };
        const result=await run(page,options);
        assert.equal(result.ok,failure===null);
        assert.equal(reloads,['preflight','create'].includes(failure)?0:1);
        assert.equal(calls.filter(c=>c==='create').length,failure==='preflight'?0:1);
        assert.equal(calls.filter(c=>c==='cleanup').length,failure==='preflight'?0:1);
        if(failure==='create'){assert.match(result.error,/actual=34/);assert.equal(result.before.stages.length,1);}
        if(failure==='preflight')assert.equal(result.cleanup,null);
        if(failure==='cleanup')assert.equal(result.cleanup.deleted,false);
    }
});

test('actual native matrix verifier rejects a missing disabled rule Item before native source lookup', async()=>{
    const {strict:assert}=await import('node:assert');
    const {evaluateNativeMatrixPhase,NATIVE_MATRIX_V1}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const spec=NATIVE_MATRIX_V1[3],saved=new Map(['game','location'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
    const species={id:spec.speciesId,type:'species'};
    const actor={id:spec.actorId,items:new Map([[spec.speciesId,species]])};
    try{
        globalThis.location={origin:'http://127.0.0.1:30091'};
        globalThis.game={ready:true,system:{id:'ptu'},version:'13.351',user:{isGM:true},actors:new Map([[spec.actorId,actor]])};
        await assert.rejects(()=>evaluateNativeMatrixPhase({phase:'reload',specs:[spec],runId:'p05-20261116-native-matrix-v1',origin:location.origin,servedHugePowerSHA256:'a'.repeat(64)}),/Missing expected matrix rule Item/);
        // A wrong-ID Item does not satisfy the fixture even if item count is two.
        actor.items.set(spec.ruleId,{id:'P05WRONG00000001'});
        await assert.rejects(()=>evaluateNativeMatrixPhase({phase:'reload',specs:[spec],runId:'p05-20261116-native-matrix-v1',origin:location.origin,servedHugePowerSHA256:'a'.repeat(64)}),/Missing expected matrix rule Item/);
    }finally{for(const [k,d]of saved){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
});

test('actual create-phase conflict forbids cleanup even after the outer absence preflight', async()=>{
    const {strict:assert}=await import('node:assert');
    const {checkNativePreparationMatrix,evaluateNativeMatrixPhase,NATIVE_MATRIX_V2}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const saved=new Map(['game','location'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
    let calls=0,reloads=0,deletes=0;
    const existing={id:NATIVE_MATRIX_V2[0].actorId,getFlag:()=> 'p05-20261116-native-matrix-v1',delete:async()=>{deletes++;}};
    try{
        globalThis.location={origin:'http://127.0.0.1:30091'};
        globalThis.game={ready:true,system:{id:'ptu'},version:'13.351',user:{isGM:true},actors:new Map([[existing.id,existing]])};
        const page={async evaluate(fn,args){calls++;if(calls===1)return {absent:true};assert.equal(fn,evaluateNativeMatrixPhase);return fn(args);},async reload(){reloads++;},async waitForFunction(){}};
        const result=await checkNativePreparationMatrix(page,{runId:'p05-20261116-native-matrix-v1',origin:location.origin,servedHugePowerSHA256:'a'.repeat(64)});
        assert.equal(result.ok,false);assert.equal(result.before.cleanupForbidden,true);
        assert.match(result.error,/Preexisting matrix Actor/);assert.equal(result.cleanup,null);
        assert.equal(calls,2);assert.equal(reloads,0);assert.equal(deletes,0);
    }finally{for(const [k,d]of saved){if(d)Object.defineProperty(globalThis,k,d);else delete globalThis[k];}}
});


test('corrective native matrix keeps all numeric oracles and owns a distinct ninth Trainer',async()=>{
    const {NATIVE_MATRIX_V1:a,NATIVE_MATRIX_V2:b,NATIVE_MATRIX_TRAINER_V2:trainer,NATIVE_REFRESH_SOURCE_PINS:pins}=await import('../tools/foundry-p05-sandbox-check.mjs');
    assert.equal(b.length,8);assert.ok(Object.isFrozen(b));
    assert.deepEqual(b.map(({actorId,speciesId,ruleId,...spec})=>spec),a.map(({actorId,speciesId,ruleId,...spec})=>spec));
    const ids=b.flatMap(s=>[s.actorId,s.speciesId,s.ruleId].filter(Boolean)).concat(trainer);
    assert.equal(new Set(ids).size,ids.length);assert.ok(ids.every(id=>/^[A-Za-z0-9]{16}$/.test(id)));
    assert.ok(Object.isFrozen(pins));assert.equal(Object.keys(pins).length,2);assert.ok(Object.values(pins).every(s=>/^[a-f0-9]{64}$/.test(s)));
});


test('actual create-phase Trainer conflict forbids mutation and cleanup', async()=>{
    const {checkNativePreparationMatrix,evaluateNativeMatrixPhase,NATIVE_MATRIX_TRAINER_V2}=await import('../tools/foundry-p05-sandbox-check.mjs');
    const saved=new Map(['game','location'].map(k=>[k,Object.getOwnPropertyDescriptor(globalThis,k)]));
    let calls=0,reloads=0,deletes=0;
    const existing={id:NATIVE_MATRIX_TRAINER_V2,getFlag:()=> 'p05-20261116-native-matrix-v2',delete:async()=>{deletes++;}};
    try{
        globalThis.location={origin:'http://127.0.0.1:30091'};
        globalThis.game={ready:true,system:{id:'ptu'},version:'13.351',user:{isGM:true},actors:new Map([[existing.id,existing]])};
        const page={async evaluate(fn,args){calls++;if(calls===1)return {absent:true};assert.equal(fn,evaluateNativeMatrixPhase);return fn(args);},async reload(){reloads++;},async waitForFunction(){}};
        const result=await checkNativePreparationMatrix(page,{runId:'p05-20261116-native-matrix-v2',origin:location.origin,servedHugePowerSHA256:'a'.repeat(64)});
        assert.equal(result.ok,false);assert.equal(result.before.cleanupForbidden,true);assert.match(result.error,/Preexisting matrix Actor/);assert.equal(result.cleanup,null);
        assert.equal(calls,2);assert.equal(reloads,0);assert.equal(deletes,0);
    }finally{for(const [k,descriptor]of saved){if(descriptor)Object.defineProperty(globalThis,k,descriptor);else delete globalThis[k];}}
});
