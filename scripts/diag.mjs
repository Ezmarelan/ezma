import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
const c=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
let ep=null; for(const p of c){try{await readFile(p);ep=p;break}catch{}}
const b=await chromium.launch({executablePath:ep,headless:true});

for (const [label,url] of [["LOCAL","http://localhost:3100/"],["PUBLIC","https://e470534.r6.cpolar.top/"]]) {
  const p=await b.newPage({viewport:{width:1440,height:900},locale:"zh-CN"});
  const bad=[];
  p.on("response",r=>{if(r.status()>=400) bad.push(r.status()+" "+r.url().slice(0,90))});
  await p.goto(url,{waitUntil:"networkidle",timeout:60000});
  await p.waitForTimeout(2000);

  const d=await p.evaluate(()=>{
    const hero=document.querySelector("[data-hero]");
    const cs=hero?getComputedStyle(hero):null;
    return {
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
      cursorOn: document.body.dataset.cursor,
      heroHeight: cs?.height,
      heroMin: cs?.minHeight,
      hasPin: !!document.querySelector(".pin-spacer"),
      fingerprinted: !!document.querySelector("script[src*='-']"),
      gsapLoaded: typeof window.gsap !== "undefined",
      scrollY: window.scrollY,
      docH: document.documentElement.scrollHeight,
    };
  });
  console.log(label, JSON.stringify(d));
  if (bad.length) console.log("  4xx:", bad.slice(0,4).join(" | "));
  await p.close();
}
await b.close();
