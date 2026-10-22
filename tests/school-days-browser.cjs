const {chromium}=require('../../.runtime/tools/node_modules/playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try{
  const page=await browser.newPage({viewport:{width:1200,height:900}}),errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await page.clock.install({time:new Date('2026-10-22T10:00:00Z')});
  const response=await page.goto('http://127.0.0.1:4185/playground/school-days/');assert.equal(response.status(),200);
  assert.equal(await page.locator('#number').textContent(),'1');
  await page.screenshot({path:path.resolve(__dirname,'../assets/school-days.png')});
  await page.getByRole('button',{name:'Christmas',exact:true}).click();
  assert.equal(await page.locator('.month').count(),3);
  await page.getByText('Use a different starting date',{exact:true}).click();
  await page.locator('#from').fill('2027-06-25');await page.locator('#target').fill('2027-06-27');await page.locator('#target').dispatchEvent('change');
  assert.equal(await page.locator('#number').textContent(),'1');
  assert.match(await page.locator('#message').textContent(),/Saturday/);
  await page.getByRole('button',{name:/26 Jun 2027:/}).click();
  assert.match(await page.locator('#day-detail').textContent(),/compulsory/);
  await page.locator('#target').fill('2027-07-09');await page.locator('#target').dispatchEvent('change');
  assert.equal(await page.locator('#number').textContent(),'—');assert.match(await page.locator('#message').textContent(),/another school calendar/);
  await page.locator('#reset').click();await page.getByRole('button',{name:'Summer holidays',exact:true}).click();
  for(const width of [390,760,1200]){
   await page.setViewportSize({width,height:844});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`No overflow at ${width}px`);
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: date entry, presets, custom start, Saturday detail, unsupported dates, responsive layout and no browser errors');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exit(1);});
