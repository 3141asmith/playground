/* webR's PostMessage mode works on static GitHub Pages without COOP/COEP. */
let failedImports=0;
export class RSession{
  constructor(onOutput,onLimit){this.onOutput=onOutput;this.onLimit=onLimit;this.runtime=null;this.closed=false;this.started=false;this.outputSize=0;}
  async start(){
    let module;
    try{module=await import('https://webr.r-wasm.org/v0.5.8/webr.mjs'+(failedImports?'?retry='+failedImports:''));}catch(error){failedImports++;throw error;}
    const {WebR,ChannelType}=module;
    if(this.closed)throw Error('R session stopped.');
    this.runtime=new WebR({baseUrl:'https://webr.r-wasm.org/v0.5.8/',channelType:ChannelType.PostMessage,interactive:false,RArgs:['--quiet','--no-save','--no-restore']});
    await this.runtime.init();
    if(this.closed)throw Error('R session stopped.');
    this.consume().catch(error=>{if(!this.closed)this.onOutput('R output channel: '+error.message+'\n','stderr');});
    await this.runtime.evalRVoid('options(max.print = 2000, width = 80)');
    const version=await this.runtime.evalRString('R.version.string');this.started=true;return version;
  }
  async consume(){
    while(!this.closed){const event=await this.runtime.read();if(this.closed||event.type==='closed')return;
      if(event.type==='stdout'||event.type==='stderr'){
        const text=String(event.data)+'\n';this.outputSize+=text.length;
        if(this.outputSize>60000){this.close();this.onLimit?.();return;}
        this.onOutput(text,event.type);
      }
    }
  }
  async run(code,csv,answers){
    this.outputSize=0;const shelter=await new this.runtime.Shelter();
    try{
      const env=await shelter.evalR('new.env(parent = globalenv())');
      // R strings are constructed through the API, never interpolated into code.
      const lines=answers===''?[]:answers.replace(/\r\n?/g,'\n').split('\n');
      if(lines.length>1&&lines.at(-1)==='')lines.pop();
      const csvValue=await new this.runtime.RCharacter(csv),answerValue=await new this.runtime.RCharacter(lines);
      try{await env.bind('csv_text',csvValue);await env.bind('.workspace_answers',answerValue);}finally{await this.runtime.destroy(csvValue);await this.runtime.destroy(answerValue);}
      await shelter.evalR(`.workspace_position <- 0L
readline <- function(prompt = "") {
  if (nzchar(prompt)) cat(prompt)
  .workspace_position <<- .workspace_position + 1L
  if (.workspace_position > length(.workspace_answers)) {
    stop("No more input: add an answer per line in the input box.", call. = FALSE)
  }
  .workspace_answers[.workspace_position]
}`,{env,captureGraphics:false});
      const result=await shelter.captureR(code,{env,withAutoprint:true,captureStreams:false,throwJsException:false,captureGraphics:{width:900,height:600,pointsize:18,bg:'white'}});
      // webR's stream channel is line buffered. Complete a final cat() line
      // before declaring the run finished so partial output is not stranded.
      await this.runtime.evalRVoid('cat("\\n", file = stdout()); cat("\\n", file = stderr())',{captureStreams:false,captureConditions:false,captureGraphics:false});
      await new Promise(resolve=>setTimeout(resolve,0));
      let failed=false;
      for(const event of result.output){
        if(event.type==='stdout'||event.type==='stderr')this.onOutput(String(event.data)+'\n',event.type);
        else{
          let text;
          try{text=await (await event.data.get('message')).toString();}catch{text=String(event.data);}
          if(event.type==='error')failed=true;
          this.onOutput(`${event.type==='error'?'Error':event.type==='warning'?'Warning':'Message'}: ${text}\n`,event.type==='warning'?'warning':event.type==='error'?'stderr':'stdout');
        }
      }
      return {images:result.images,failed};
    }finally{if(!this.closed)await shelter.purge();}
  }
  close(){if(this.closed)return;this.closed=true;this.runtime?.close();}
}
