/* The James NZ — published live version 19; source c6f1ae3450beaceacccee44b893f1465cf88900a; export 2 October 2026. */
// Set this to your separately hosted backend URL, for example https://api.example.com.
// Never put an OpenAI API key in this file, HTML, or browser JavaScript.
window.THE_JAMES_API_BASE = "";
(() => {
 const originalFetch = window.fetch.bind(window);
 let bible;
 const json = (data,status=200) => new Response(JSON.stringify(data), {status,headers:{"Content-Type":"application/json"}});
 window.fetch = async (input,init) => {
  const value = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(value,location.href);
  if (url.origin !== location.origin || !url.pathname.includes("/api/")) return originalFetch(input,init);
  const path = url.pathname.slice(url.pathname.indexOf("/api/"));
  const base = window.THE_JAMES_API_BASE.trim().replace(/\/$/, "");
  if (base) return originalFetch(base + path + url.search,init);
  const method = init?.method || (input instanceof Request ? input.method : "GET");
  if (method === "GET" && path === "/api/content") return json({quotes:[],business:null});
  if (method === "GET" && path === "/api/friend") return json({enabled:false});
  if (method === "GET" && path === "/api/bible") {
   bible ||= originalFetch(new URL("./data/bible.json",location.href)).then(r=>{if(!r.ok)throw Error("Bible data could not load");return r.json()});
   const data = await bible, p=url.searchParams, book=p.get("book")||"", chapter=p.get("chapter"), terms=(p.get("q")||"").trim().toLowerCase().split(/\s+/).filter(Boolean),page=Math.max(0,Math.min(1000,Number(p.get("page"))||0));
   const found=data.filter(v=>(!book||v.book===book)&&(!chapter||v.chapter===Number(chapter))&&terms.every(t=>(v.text+" "+v.book+" "+v.chapter+":"+v.verse).toLowerCase().includes(t)));
   return json({total:found.length,count:data.length,page,verses:found.slice(page*40,page*40+40)});
  }
  return json({error:"This feature needs a connected backend. The GitHub copy includes the complete server source and setup instructions."},503);
 };
})();
