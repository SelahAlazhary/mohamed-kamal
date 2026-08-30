const http=require("http"),fs=require("fs"),p=require("path");
const T={".html":"text/html",".svg":"image/svg+xml",".png":"image/png"};
http.createServer((q,s)=>{const f=p.join(process.cwd(),decodeURIComponent(q.url.split("?")[0]));
 fs.readFile(f,(e,d)=>e?(s.writeHead(404),s.end("no")):(s.writeHead(200,{"content-type":T[p.extname(f)]||"application/octet-stream"}),s.end(d)));
}).listen(4321,()=>console.log("on"));
