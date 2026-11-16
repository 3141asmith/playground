const {chromium}=require('../../.runtime/tools/node_modules/playwright');
const assert=require('node:assert/strict');
(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try {
    const page=await browser.newPage({viewport:{width:1280,height:950},reducedMotion:'reduce'}),errors=[];
    page.on('pageerror',e=>errors.push(e.message));
    const base=process.env.PLAYGROUND_URL||'http://127.0.0.1:4185/playground/';
    let total=0;
    for(const [id,count]of [['02',3],['03',4],['04',8],['09',4]]){
      await page.goto(base+'computer-science/slr-'+id+'/');
      await page.waitForFunction(()=>document.body.dataset.scopeReady==='true');
      assert.equal(await page.locator('[data-scope-ready=true][role=tabpanel]').count(),count);
      total+=count;
      const topics=await page.locator('[data-scope-ready=true][role=tabpanel]').evaluateAll(nodes=>nodes.map(n=>n.id));
      for(const topic of topics){
        await page.locator('#tab-'+topic).click();
        const panel=page.locator('#'+topic);
        assert.equal(await panel.locator(':scope > .scope-overview').count(),1);
        assert.match(await panel.locator(':scope > .scope-overview').textContent(),/OCR FOCUS/);
        assert(await panel.locator('.scope-extra').count()>0,`No extra-context annotations in ${id}/${topic}`);
        await page.setViewportSize({width:390,height:844});
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+'/'+topic+' overflows');
        await page.setViewportSize({width:1280,height:950});
      }
      if(id==='02'){
        assert.match(await page.locator('#risc .scope-related').first().textContent(),/1\.1\.1\(d\)/);
        assert.match(await page.locator('#parallel .scope-extra').allTextContents().then(a=>a.join(' ')),/Amdahl/);
      }
      if(id==='04'){
        await page.locator('#tab-scheduling').click();
        const quantum=page.locator('#scheduling .study-terms div').filter({has:page.locator('dt',{hasText:'Time quantum'})});
        assert.equal(await quantum.locator('.scope-extra').count(),0,'Core round-robin quantum should not be marked extra');
      }
      if(id==='09'){
        await page.locator('#tab-encryption').click();
        const panel=page.locator('#encryption');
        assert.match(await panel.locator(':scope > .scope-overview').textContent(),/key arrangements is core content/);
        assert.match(await panel.locator('.scope-lab').textContent(),/Named algorithms, modes, nonces\/IVs/);
        assert.match(await panel.locator('.scope-extra').allTextContents().then(a=>a.join(' ')),/Certificates.*Hybrid encryption.*Digital signatures/s);
        // The core key explanation stays unmarked as extension material.
        assert.equal(await panel.locator('.concept-grid > article').first().locator('.scope-extra').count(),0);
        await page.locator('#tab-hashing').click();
        assert.match(await page.locator('#hashing .scope-lab').first().textContent(),/SHA-256/);
        assert.match(await page.locator('#hashing .scope-extra').allTextContents().then(a=>a.join(' ')),/Salting/);
      }
      await page.locator('#tab-review').click();
      assert.equal(await page.locator('#review > .scope-overview').count(),1);
      await page.locator('#quiz button[type=submit]').click();
      assert(await page.locator('.scope-question').count()>0);
      await page.locator('#quiz-reset').click();
    }
    assert.equal(total,19);assert.deepEqual(errors,[]);
    if(!process.env.PLAYGROUND_URL){
      await page.locator('#tab-encryption').click();
      await page.locator('#encryption .study-section').last().scrollIntoViewIfNeeded();
      await page.screenshot({path:'artifacts/cs-scope-encryption.png'});
    }
    console.log('PASS 19 OCR scope mappings, local extra/related labels, core key/quantum distinctions, crypto lab labels, quiz feedback and mobile layout');
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
