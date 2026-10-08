const UPDATE_ROUTE = '/api/dsh-theme-gallery/update/';
export function createUpdateController({fetchImpl=globalThis.fetch?.bind(globalThis),storage=globalThis.localStorage,client,navigate,probe,timeoutMs=15000}={}) {
  let baselineId=null;try{baselineId=storage?.getItem('dsh.themeGallery.updateBaseline')??null}catch{}
  let state={status:'idle',client,info:null,target:null,reason:null,checks:null,baseline:null};
  let disposed=false,current=null,generation=0;
  const listeners=new Set();
  const publish=patch=>{if(disposed)return;state={...state,...patch};for(const fn of listeners)fn(state)};
  const request=async(operation,body,abort)=>{
    if(typeof fetchImpl!=='function')throw Error('Host API unavailable');
    const response=await fetchImpl(UPDATE_ROUTE+operation,{method:body===undefined?'GET':'POST',credentials:'same-origin',signal:abort.signal,headers:{'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});
    const payload=await response.json();if(abort.signal.aborted)throw Error('cancelled');if(!response.ok)throw Error(payload.reason??`Host HTTP ${response.status}`);return payload;
  };
  const run=async(status,operation)=>{
    if(disposed||current)return false;
    const abort=new AbortController();current=abort;const runId=++generation;publish({status,reason:null});
    let timer;const deadline=new Promise((_,reject)=>{timer=setTimeout(()=>{abort.abort();reject(Error('request timeout'))},timeoutMs)});
    // Cancellation also settles uncooperative transports, without retaining a timer.
    const cancelled=new Promise((_,reject)=>abort.signal.addEventListener('abort',()=>reject(Error('cancelled')),{once:true}));
    try{const answer=await Promise.race([operation(abort),deadline,cancelled]);if(runId===generation&&!disposed)publish(answer);return true}
    catch(error){if(runId===generation&&!disposed)publish({status:abort.signal.aborted?'unknown':'failed',reason:String(error.message??error)});return false}
    finally{clearTimeout(timer);if(current===abort)current=null}
  };
  const configuration=()=>{
    const read=key=>{try{return storage?.getItem(key)??null}catch{return null}};
    return{selection:read('dsh.themeGallery.selection'),visual:read('dsh.themeGallery.visual')};
  };
  return{
    getSnapshot:()=>state,subscribe(fn){listeners.add(fn);return()=>listeners.delete(fn)},
    check(){if(!current&&!disposed)publish({checks:null,target:null});return run('checking',async abort=>{
      const local=await request('info',undefined,abort);publish({info:local.info});
      return request('check',{client},abort);
    })},
    preflight(){if(!current&&!disposed)publish({checks:null});return run('preflight',abort=>request('preflight',{client},abort))},
    backup(){const previous=state.status;return run('preflight',async abort=>{
      const answer=await request('backup',{client,configuration:configuration()},abort);
      // A saved baseline means ready to guide, never ready to auto-install.
      baselineId=answer.baseline.id;try{storage?.setItem('dsh.themeGallery.updateBaseline',baselineId)}catch{}
      return{status:previous,baseline:answer.baseline};
    })},
    verify(){return run('verifying',async abort=>request('verify',{client,baselineId,configuration:configuration(),registration:typeof probe==='function'?await probe(abort.signal):{}},abort))},
    openManager(){if(disposed||typeof navigate!=='function')return false;try{return navigate()!==false}catch(error){publish({status:'unsupported',reason:String(error.message??error)});return false}},
    cancel(){if(current){++generation;current.abort();current=null;publish({status:'unknown',reason:'cancelled'})}},
    dispose(){if(current)state={...state,status:'unknown',reason:'plugin-unloaded'};disposed=true;++generation;current?.abort();current=null;listeners.clear()},
  };
}
export const UPDATE_LOCALES = {
  zh:{updates:'版本与更新',runningVersion:'实际加载版本',runningHostVersion:'运行 Host 插件版本',diskVersion:'磁盘声明版本',installation:'安装来源',lockedCommit:'安装锁定 commit',runtime:'DSH / Node',latest:'远端目标',checkUpdates:'检查更新',preflight:'查看兼容性',backup:'保存恢复基线',downloadBackup:'下载恢复基线',openManager:'打开 DSH 插件详情',changelog:'更新日志',cancelCheck:'取消检查',unknownValue:'未知',updateSafety:'不会自动安装。此宿主没有安全升级事务，更新由原生插件管理器或外部 Agent 经确认完成。',idle:'尚未检查',checking:'正在检查',available:'发现更新',upToDate:'已与远端核对一致',unsupported:'仅支持引导更新',incompatible:'不兼容，禁止更新',failed:'检查失败',unknown:'状态未知',verifying:'验证运行状态中',success:'运行状态验证通过',restartRequired:'等待宿主重启 / 客户端硬刷新',rollbackRequired:'需要人工恢复',compatible:'兼容',guideTitle:'更新与恢复步骤',guide:'先下载恢复基线，并从独立终端记录 dsh --version、当前 Profile、安装来源、锁定 commit、原安装包及本插件 selection.json。核对目标版本的 DSH peer（包含 prerelease）和 Node 要求，确认产物 manifest 与 bundle 一致。没有明确原安装包和恢复路径时不要卸载。GitHub 安装要核对锁文件的固定 commit；link / junction 只在源目录按版本更新，绝不移动或删除链接目标。Windows 必须完全退出宿主以释放文件占用；不要在即将卸载的插件或 DSH 会话内执行安装。仅用官方管理器 / 匹配来源的包管理器更新本插件，不升级 DSH，不改其他插件。安装结束后重启宿主、浏览器硬刷新，核对实际版本、active 状态、主题入口、资源、原主题与四滑条。下载失败保留原安装；安装失败重新安装已记录的原固定产物；Host 加载失败从外部终端恢复原版；页面失败先检查 Client 版本/缓存再硬刷新；结果未知先检查实际安装和加载状态，不重复安装。恢复时只还原本插件 selection.json 原字节及两个浏览器键，保留备份，不覆盖整个 DSH_HOME。',loadedCommit:'运行源码 commit',buildFingerprint:'构建标识',preflightChecks:'预检明细',compatibility:'DSH 与 Node',target:'目标产物',localArtifact:'运行与磁盘一致性',source:'安装类型',writable:'安装目录可写',activation:'唯一 active 入口',backupCheck:'恢复路径',executor:'独立安全执行器',verifyUpdate:'重新验证运行状态',noSafeExecutor:'没有独立安全升级事务；已禁用自动安装。',restoreBrowser:'恢复浏览器配置',restoreFile:'导入本插件恢复基线',restoreDone:'浏览器配置已恢复；宿主选择文件按恢复步骤处理。'},
  en:{updates:'Version and updates',runningVersion:'Running client version',runningHostVersion:'Running Host plugin version',diskVersion:'Manifest on disk',installation:'Installation source',lockedCommit:'Locked installation commit',runtime:'DSH / Node',latest:'Remote target',checkUpdates:'Check for updates',preflight:'Check compatibility',backup:'Save recovery baseline',downloadBackup:'Download recovery baseline',openManager:'Open DSH plugin details',changelog:'Changelog',cancelCheck:'Cancel check',unknownValue:'Unknown',updateSafety:'Never installs automatically. This Host has no safe upgrade transaction; use its native manager or an external Agent after confirmation.',idle:'Not checked',checking:'Checking',available:'Update available',upToDate:'Verified against remote',unsupported:'Guided updates only',incompatible:'Incompatible; update blocked',failed:'Check failed',unknown:'Unknown',verifying:'Verifying runtime',success:'Runtime verified',restartRequired:'Waiting for Host restart / hard refresh',rollbackRequired:'Manual recovery required',compatible:'Compatible',guideTitle:'Update and recovery steps',guide:'Download the recovery baseline first. From an independent terminal record dsh --version, the current Profile, installation source, locked commit, the original fixed artifact, and this plugin’s selection.json. Check all target DSH peers with prereleases and its Node engine; verify manifest and bundle agree. Do not uninstall without a recoverable original artifact. For GitHub installs verify the exact lockfile commit; for link/junction installs update only the source checkout, never move or delete its target. On Windows fully stop the Host to release file locks. Never install from the plugin or DSH session being replaced. Update only this plugin via the official manager or matching package manager, never DSH or other plugins. Restart the Host and hard-refresh the browser; verify running versions, active status, navigation, resources, theme and all four sliders. A download failure leaves the original intact; after an install failure reinstall the recorded original artifact. Recover Host load failures externally; for client failures inspect bundle/cache then refresh. For unknown outcomes inspect installed and running state before retrying. Restore only this plugin’s original selection.json bytes and two browser keys; retain backups and never overwrite all of DSH_HOME.',loadedCommit:'Running source commit',buildFingerprint:'Build fingerprint',preflightChecks:'Preflight details',compatibility:'DSH and Node',target:'Target artifact',localArtifact:'Running/disk agreement',source:'Installation type',writable:'Writable target',activation:'Single active entry',backupCheck:'Recovery path',executor:'Independent safe executor',verifyUpdate:'Verify running state again',noSafeExecutor:'No independent safe upgrade transaction; automatic installation is disabled.',restoreBrowser:'Restore browser settings',restoreFile:'Import plugin recovery baseline',restoreDone:'Browser settings restored; follow the guide for Host selection restoration.'},
};
export function createUpdatePanel(React,controller){
  const h=React.createElement;
  return function UpdatePanel({t=key=>key}){
    const [state,setState]=React.useState(()=>controller.getSnapshot());
    React.useEffect(()=>controller.subscribe(setState),[]);
    const busy=['checking','preflight','verifying'].includes(state.status);
    const unknown=t('unknownValue');
    const statusKey={'up-to-date':'upToDate','restart-required':'restartRequired','rollback-required':'rollbackRequired'}[state.status]??state.status;
    const details=[['runningVersion',state.client?.version],['runningHostVersion',state.info?.build?.version],['diskVersion',state.info?.manifest?.version],['installation',state.info?.source?.spec?`${state.info.source.kind}: ${state.info.source.spec}`:null],['lockedCommit',state.info?.source?.commit],['loadedCommit',state.client?.sourceDirty===false?state.client.sourceCommit:null],['buildFingerprint',state.client?.fingerprint?.slice(0,16)],['runtime',state.info?`${state.info.runtimeVersion??unknown} / ${state.info.nodeVersion??unknown}`:null],['latest',state.target?`${state.target.version} · ${state.target.commit?.slice(0,12)} (${state.target.channel})`:null]];
    const download=()=>{
      const blob=new Blob([JSON.stringify(state.baseline.record,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`dsh-theme-gallery-baseline-${state.baseline.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
    };
    return h('section',{className:'dsh-gallery-updates','aria-label':t('updates')},
      h('h3',null,t('updates')),
      h('dl',{className:'dsh-gallery-version-grid'},details.map(([key,value])=>h('div',{key},h('dt',null,t(key)),h('dd',null,value??unknown)))),
      h('p',{role:'status','aria-live':'polite','data-update-status':state.status},t(statusKey)),
      state.reason?h('p',{className:'dsh-gallery-update-reason'},state.reason):null,
      h('p',null,t('updateSafety')),
      h('div',{className:'dsh-gallery-update-actions'},
        h('button',{type:'button',disabled:busy,onClick:()=>controller.check()},t('checkUpdates')),
        busy?h('button',{type:'button',onClick:()=>controller.cancel()},t('cancelCheck')):null,
        h('button',{type:'button',disabled:busy||!state.target,onClick:()=>controller.preflight()},t('preflight')),
        h('button',{type:'button',disabled:busy||!state.info,onClick:()=>controller.backup()},t('backup')),
        state.baseline?h('button',{type:'button',onClick:download},t('downloadBackup')):null,
        h('button',{type:'button',disabled:busy,onClick:()=>controller.verify()},t('verifyUpdate')),
        h('button',{type:'button',disabled:busy,onClick:()=>controller.openManager()},t('openManager')),
        h('a',{href:state.target?.url??'https://github.com/Xuanyi-king/dsh-theme-gallery/releases',target:'_blank',rel:'noopener noreferrer'},t('changelog'))),
      state.baseline?h('p',{className:'dsh-gallery-update-reason'},state.baseline.path):null,
      state.checks?h('details',{open:true},h('summary',null,t('preflightChecks')),h('dl',{className:'dsh-gallery-version-grid'},Object.entries(state.checks).map(([key,value])=>h('div',{key},h('dt',null,t(key==='backup'?'backupCheck':key)),h('dd',null,`${t(value.status)} · ${value.reason}`))))):null,
      h('details',null,h('summary',null,t('guideTitle')),h('p',null,t('guide'))));
  };
}
