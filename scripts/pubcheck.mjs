import { chromium } from "playwright-core";
import { readFile } from "node:fs/promises";
const c=["C:/Program Files/Google/Chrome/Application/chrome.exe","C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"];
let ep=null; for(const p of c){try{await readFile(p);ep=p;break}catch{}}
const b=await chromium.launch({executablePath:ep,headless:true});
const p=await b.newPage({viewport:{width:1440,height:900},locale:"zh-CN"});
const errs=[]; p.on("pageerror",e=>errs.push(e.message));
p.on("console",m=>{if(m.type()==="error")errs.push("console: "+m.text())});

await p.goto("https://e470534.r6.cpolar.top/",{waitUntil:"networkidle",timeout:60000});
await p.waitForTimeout(2500);

const state=await p.evaluate(()=>({
  title: document.title,
  heroText: document.querySelector(".hero-layer")?.textContent,
  cursorOn: document.body.dataset.cursor,
  pinSpacer: !!document.querySelector(".pin-spacer"),
  grain: !!document.querySelector(".grain"),
  navItems: document.querySelectorAll(".nav-item").length,
  layerCount: document.querySelectorAll(".hero-layer").length,
}));
console.log("PUBLIC PAGE:", JSON.stringify(state,null,1));
console.log("errors:", errs.length ? errs.slice(0,3) : "none");

// 滚动测试
await p.mouse.wheel(0,900); await p.waitForTimeout(1200);
const after=await p.evaluate(()=>getComputedStyle(document.querySelector(".hero-stack")).transform);
console.log("after scroll transform:", after.slice(0,40));

await p.screenshot({path:"shots/public-desktop.png"});
await b.close();
