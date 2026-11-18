const {chromium}=require('../../.runtime/tools/node_modules/playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const context=await browser.newContext({viewport:{width:1500,height:1000},acceptDownloads:true}),page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));const base=process.env.PLAYGROUND_URL||'http://127.0.0.1:4185/playground/';
  await page.goto(base+'computer-science/slr-09/#encryption');await page.getByRole('link',{name:'Open Python editor & runner'}).click();await page.waitForFunction(()=>document.body.dataset.ready==='true');
  assert.equal(await page.locator('#script-list button').count(),10);
  const run=async()=>{await page.locator('#run').click();await page.waitForFunction(()=>!document.querySelector('#run').disabled,{},{timeout:150000});return page.locator('#output').textContent();};
  const choose=async id=>page.locator(`[data-script="${id}"]`).click();
  let output=await run();assert.match(output,/Phhw ph dw wkh oleudub!/);assert.match(output,/Recovered:.*Meet me at the library!/);assert.match(await page.locator('#runtime-status').textContent(),/Finished/);console.log('PASS real Python runtime and Caesar round trip');
  const expected={vigenere:/LXFOPVEFRNHR/,atbash:/Svool, dliow!/, 'rail-fence':/WEAREDISCOVEREDFLEEATONCE/, 'one-time-pad':/A secret for the classroom/, fernet:/Wrong key rejected/, 'aes-gcm':/Tampering detected/, 'rsa-oaep':/Unrelated private key rejected/,hashing:/Hex digits:\s+64/,input:/3\. Hello, Ada!/};
  for(const [id,pattern]of Object.entries(expected)){await choose(id);output=await run();assert.match(output,pattern,id+' failed: '+output);assert.match(await page.locator('#runtime-status').textContent(),/Finished/,id);console.log('PASS example '+id);}
  await choose('vigenere');await page.locator('#code').fill(await page.locator('#code').inputValue()+'\ntry:\n    vigenere("ABC", "ß")\nexcept ValueError:\n    print("Non-ASCII keyword rejected")\nelse:\n    raise AssertionError("Invalid keyword accepted")\n');output=await run();assert.match(output,/Non-ASCII keyword rejected/);
  await choose('input');
  await page.locator('#stdin').fill('Ada');output=await run();assert.match(output,/EOFError/);assert.match(output,/student.py/);
  await page.locator('#new-script').click();await page.locator('#code').fill('print("<b>literal output</b>")\nprint(sum(range(10)))');output=await run();assert.match(output,/<b>literal output<\/b>\n45/);assert.equal(await page.locator('#output b').count(),0);
  await page.locator('#code').fill('print("broken"');output=await run();assert.match(output,/SyntaxError/);assert.match(output,/line 1/);
  await page.locator('#code').fill('raise ValueError("classroom error")');output=await run();assert.match(output,/ValueError: classroom error/);
  await page.locator('#code').fill('secret_variable = 42');await run();await page.locator('#code').fill('print(secret_variable)');output=await run();assert.match(output,/NameError/);
  // Drafts are independent and survive reloading the page.
  await choose('caesar');await page.locator('#code').fill('print("saved Caesar draft")');await choose('vigenere');await choose('caesar');assert.equal(await page.locator('#code').inputValue(),'print("saved Caesar draft")');await page.reload();await page.waitForFunction(()=>document.body.dataset.ready==='true');assert.equal(await page.locator('#code').inputValue(),'print("saved Caesar draft")');
  page.once('dialog',d=>d.accept());await page.locator('#reset').click();assert.match(await page.locator('#code').inputValue(),/def caesar/);
  await page.locator('#file-input').setInputFiles({name:'lesson.py',mimeType:'text/x-python',buffer:Buffer.from('print("opened file")')});assert.equal(await page.locator('#code').inputValue(),'print("opened file")');
  const [download]=await Promise.all([page.waitForEvent('download'),page.locator('#download').click()]);assert.equal(download.suggestedFilename(),'playground.py');
  const stream=await download.createReadStream();let downloaded='';for await(const chunk of stream)downloaded+=chunk;assert.equal(downloaded,'print("opened file")');
  await page.locator('#code').fill('if True:');await page.locator('#code').focus();await page.keyboard.press('End');await page.keyboard.press('Enter');assert.equal(await page.locator('#code').inputValue(),'if True:\n    ');await page.keyboard.press('Tab');assert.equal(await page.locator('#code').inputValue(),'if True:\n        ');await page.keyboard.press('Shift+Tab');assert.equal(await page.locator('#code').inputValue(),'if True:\n    ');
  await page.locator('#code').fill('while True:\n    pass');await page.locator('#run').click();await page.waitForFunction(()=>document.querySelector('#runtime-status').dataset.state==='running',{},{timeout:120000});await page.locator('#stop').click();assert.match(await page.locator('#runtime-status').textContent(),/Stopped/);assert(await page.locator('#run').isEnabled());
  await page.locator('#code').fill('print("running after Stop")');output=await run();assert.match(output,/running after Stop/);
  await page.locator('#code').fill('for n in range(100000):\n    print("abcdefghij")');output=await run();assert(output.length<61000);assert.match(output,/Output limited/);
  await page.locator('#script-search').fill('RSA');assert.equal(await page.locator('#script-list button').count(),1);await page.locator('#script-search').fill('no-matching-script');assert(await page.locator('#search-empty').isVisible());await page.locator('#script-search').fill('');
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await choose('aes-gcm');assert(await page.locator('#code').isVisible());
  if(!process.env.PLAYGROUND_URL){await page.screenshot({path:'artifacts/python-mobile.png',fullPage:true});await page.setViewportSize({width:1500,height:1000});await choose('vigenere');await page.screenshot({path:'artifacts/python-desktop.png'});}
  const offline=await browser.newContext();await offline.route('https://cdn.jsdelivr.net/**',route=>route.abort());const failure=await offline.newPage();await failure.goto(base+'computer-science/python/');await failure.locator('#run').click();await failure.waitForFunction(()=>document.querySelector('#runtime-status').dataset.state==='error');assert.match(await failure.locator('#runtime-status').textContent(),/could not load/);assert(await failure.locator('#run').isEnabled());assert.match(await failure.locator('#code').inputValue(),/def caesar/);await offline.close();
  assert.deepEqual(errors,[]);console.log('PASS stdin/EOF, errors, fresh variables, draft persistence, reset, file import/export, indentation, Stop/restart, output limit, search, mobile and download-failure recovery');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
