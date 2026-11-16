const {chromium} = require('../../.runtime/tools/node_modules/playwright');
const assert = require('node:assert/strict');
(async () => {
  const browser = await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try {
    const page = await browser.newPage({viewport:{width:1280,height:950},reducedMotion:'reduce'});
    const errors = [], missing = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', r => { if(r.status() >= 400 && r.url().includes('/computer-science/')) missing.push(r.url()); });
    const base = process.env.PLAYGROUND_URL || 'http://127.0.0.1:4185/playground/';
    let topicCount = 0, exampleCount = 0, checkCount = 0;
    for (const [id, count, labCount] of [['02',3,3],['03',4,4],['04',8,8],['09',4,6]]) {
      await page.goto(base+'computer-science/slr-'+id+'/');
      await page.waitForFunction(() => document.body.dataset.studyReady === 'true');
      assert.equal(await page.locator('[data-study-ready=true][role=tabpanel]').count(), count);
      assert.equal(await page.locator('.lab').count(), labCount);
      const ids = await page.locator('[data-study-ready=true][role=tabpanel]').evaluateAll(nodes => nodes.map(n=>n.id));
      exampleCount += await page.locator('.study-example').count();
      checkCount += await page.locator('.study-check').count();
      for (const topic of ids) {
        topicCount++;
        await page.locator('#tab-'+topic).click();
        const panel = page.locator('#'+topic);
        assert(await panel.isVisible());
        assert.equal(await panel.locator(':scope > .study-reading').count(), 1);
        assert.equal(await panel.locator('.study-check').count(), 3);
        const originalHash = new URL(page.url()).hash;
        await panel.getByRole('button',{name:'Worked examples',exact:true}).click();
        assert(await panel.locator('.study-examples').evaluate(n=>n===document.activeElement));
        await panel.getByRole('button',{name:'Interactive lab',exact:true}).click();
        assert(await panel.locator('.lab').first().evaluate(n=>n===document.activeElement));
        await panel.getByRole('button',{name:'Practice & answers',exact:true}).click();
        assert(await panel.locator('.study-apply').evaluate(n=>n===document.activeElement));
        assert.equal(new URL(page.url()).hash, originalHash);
        for (let i=0;i<3;i++) {
          const check = panel.locator('.study-check').nth(i);
          await check.locator('summary').click();
          assert(await check.locator('p').isVisible());
          await check.locator('summary').click();
        }
        await page.setViewportSize({width:390,height:844});
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),id+'/'+topic+' mobile overflow');
        // Wide tables scroll within their region instead of widening the document.
        const tables = panel.locator('.study-table');
        for(let i=0;i<await tables.count();i++) assert(await tables.nth(i).evaluate(n=>n.clientWidth<=innerWidth));
        await page.setViewportSize({width:1280,height:950});
      }
      await page.locator('#tab-'+ids[0]).click();
      await page.locator('#'+ids[0]+' .reviewed').click();
      // SLR 9 uses its original progress display rather than shared course controls.
      assert.equal(await page.locator('#'+ids[0]+' .reviewed').getAttribute('aria-pressed'), 'true');
      await page.locator('#tab-review').click();
      assert(await page.locator('#quiz').isVisible());
    }
    assert.equal(topicCount,19); assert.equal(exampleCount,42); assert.equal(checkCount,57);
    await page.goto(base+'computer-science/');
    assert.match(await page.locator('.lead').textContent(),/58 worked examples/);
    assert.equal(await page.locator('a.unit-card').count(),5);
    assert.deepEqual(errors,[]); assert.deepEqual(missing,[]);
    console.log('PASS all 19 guides, 42 examples, 57 answer reveals, existing 21 labs, jump focus/hash preservation, progress and mobile layouts');
  } finally { await browser.close(); }
})().catch(e=>{console.error(e);process.exit(1);});
