const {chromium}=require('../../.runtime/tools/node_modules/playwright'),assert=require('node:assert/strict');

(async()=>{
  const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
  try{
    const page=await browser.newPage({viewport:{width:1500,height:1000}}),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    const base=process.env.PLAYGROUND_URL||'http://127.0.0.1:4185/playground/';
    await page.goto(base+'papers/');await page.waitForFunction(()=>document.body.dataset.ready==='true');
    await page.click('#demo');await page.waitForFunction(()=>document.querySelectorAll('.source').length===2&&document.querySelector('#detected-question').options.length>1,null,{timeout:60000});
    await page.selectOption('#detected-question','q-0');await page.click('#add-detected');await page.waitForFunction(()=>document.querySelectorAll('.question').length===1,null,{timeout:30000});
    await page.fill('#paper-title','Saved mechanics paper');await page.selectOption('#layout','separate');await page.check('#references');await page.fill('#workspace-name','Mechanics revision');
    await page.click('#save-workspace');await page.waitForFunction(()=>document.querySelector('#status').textContent.includes('saved on this device'));
    const savedId=await page.locator('#saved-workspace').inputValue();assert.ok(savedId);
    await page.reload();await page.waitForFunction(()=>document.body.dataset.ready==='true');await page.waitForFunction(()=>document.querySelectorAll('#saved-workspace option').length===2);
    await page.selectOption('#saved-workspace',savedId);await page.click('#load-workspace');
    await page.waitForFunction(()=>document.querySelectorAll('.source').length===2&&document.querySelectorAll('.question').length===1&&document.querySelector('#status').textContent.includes('restored'));
    assert.equal(await page.locator('#paper-title').inputValue(),'Saved mechanics paper');
    assert.equal(await page.locator('#layout').inputValue(),'separate');
    assert.equal(await page.locator('#references').isChecked(),true);
    assert.equal(await page.locator('#question-count').textContent(),'1');
    await page.click('#build');await page.waitForFunction(()=>document.querySelector('#preview-dialog').open,null,{timeout:60000});
    const exported=await page.evaluate(async()=>{
      const pdfjs=await import('./vendor/pdf-6.5.438.js'),bytes=new Uint8Array(await(await fetch(document.querySelector('#preview').src)).arrayBuffer()),pdf=await pdfjs.getDocument({data:bytes}).promise;
      const pages=[];for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);pages.push((await page.getTextContent()).items.map(item=>item.str).join(' '));}
      await pdf.loadingTask.destroy();return pages.join(' ');
    });
    assert.match(exported,/Saved mechanics paper/);
    await page.click('#close-preview');page.once('dialog',dialog=>dialog.accept());await page.click('#delete-workspace');
    await page.waitForFunction(()=>document.querySelectorAll('#saved-workspace option').length===1);
    assert.deepEqual(errors,[]);
    console.log('Paper persistence passed: saved source PDFs, question selections and export settings survive reload, restore and export.');
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
