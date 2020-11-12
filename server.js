var express = require('express');
var https = require('https');
var cors = require('cors')
var querystring = require('querystring');
const puppeteer = require("puppeteer");


var app = express();

var PORT = 3000;

// var server = http.createServer(function(req, res) {
//     res.writeHead(200, { "Content-type": "text/plain" });
//     res.end("Hello world\n");
// });

// app.use(cors());
var corsOptions = {
  origin: 'http://127.0.0.1:8080',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

app.get('/', cors(corsOptions), function(req, res) {	
	// crawlWebData(res);
	crawlWebDataVietlott(res);
	
	// NCTInfo = {ROOT_URL: "https://www.nhaccuatui.com/", mineKey: ""}  
	// var songKey = "gv8GB8rRmZU6";
	// var data = querystring.stringify({type: "playlist", key: songKey, v: new Date().getTime()});
	// var cookieString = 'nct_uuid=249B539AEB014DF59FFE5B5EE7B6F717; nctads_ck=1tju85skvw6tbcspg90v9muta_1604886752649; _ga=GA1.2.961065546.1604886753; _gid=GA1.2.442756511.1604886753; autoPlayNext=true; NCTNPLS=00602e96535dd4bdda2f9eb27cbe4d0e; NCTCRLS=e2feb07a7ce197c49784edbb5ec453eca1e6c6a06d2c8ece446df4c0ab00862c98dc66dd9699cc23aa1d0209e161d8bc8133e7070f181340c824d78212bfbd49984e4bcbcb1f9f07c8a1961bb65387da80f18f03470823825449492053fde3fdc52e04bcb9e10496dbbb99085674e3d28f43e3a3ac89187eb9900a11a33682ffabd22da77fffd4384b379f9bb84d1c1330bf1a5e1b2d9886b255aa12d27daf2f6ec593fd6a720d1e1b1c32821be359cb56ff0973c46083353951ba2e37195548498994f5640192653b998f63b1c6fed93f375c83ad35f349e47829d3734d12985c8b69452fa453fc7c177d05cec56606; __utmc=157020004; 84bd8=4d7ef391f04f7aaec22979778a2; popupNewVersion=true; _gat_gtag_UA_273986_1=1; JSESSIONID=q7iga4kpwn2z1pldbmc8tztu1; NCT_TVC_PREROLL=1735_4726; __utma=157020004.961065546.1604886753.1604915809.1604973488.2; __utmz=157020004.1604973488.2.2.utmcsr=nhaccuatui.com|utmccn=(referral)|utmcmd=referral|utmcct=/bai-hat/dai-ngu-dai-ngu-hai-duong-ost-song-senh.gv8GB8rRmZU6.html; __utmt=1; __utmb=157020004.2.9.1604973488'

 //    var options = {
 //        host: "www.nhaccuatui.com",        
 //        path: '/download/song/gv8GB8rRmZU6_128',
 //        method: 'GET',
 //        headers: {
 //            'Content-Type': 'application/x-www-form-urlencoded',
 //            'Cookie': cookieString
 //            // 'Content-Length': Buffer.byteLength(data)
 //        }
 //    };

 //    var requ = https.request(options, function (resp) {
 //        resp.setEncoding('utf8');
 //        resp.on('data', function (chunk) {
 //        	var data = JSON.parse(chunk).data.stream_url;
 //            console.log("body: " + chunk);
 //            res.status(200).send(chunk);
 //        });
        
 //    });
 //    // requ.write(data);
 //    requ.end();
})

app.listen(PORT, function() {
    console.log('Server is running at 3000')
});


var crawlWebData = async (res) => {	
    debugger
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto("https://www.nhaccuatui.com/bai-hat/top-20.html");
    const songs = await page.evaluate(() => {        
        let items = document.querySelectorAll(".name_song");
        let links = [];
        items.forEach(item => {
            links.push({
                title: item.innerText,
                url: item.getAttribute("href")
            });
        });
        return links;
    });
    console.log(songs);
    res.status(200).send(songs);
    await browser.close();
}



var crawlWebDataVietlott = async (res) => {	
    // puppeteer options: {headless: false}, {devtools: true}
    let result = []
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/winning-number-655.html");
    let canGoNextPage = true;
    let pageIndex = 1;   
    const wait = (ms) => new Promise(r => setTimeout(r, ms));   
    while (canGoNextPage) {        
        const evalResult = await page.evaluate((pageIndex, canGoNextPage) => {                        
            const getNextPageButton = (pageIndex) => {
                const nextPageButtons = document.querySelectorAll("[href='javascript:NextPage(" + pageIndex +");']");            
                const length = nextPageButtons.length;
                return nextPageButtons[length-1];
            }  
            let resultList = []  
            let resultLines = document.querySelectorAll(".doso_output_nd .day_so_ket_qua_v2");
            for (resultLine of resultLines) {
                const resultNumbers = [];
                for (let i = 0; i < 8; i++) {           
                    if (i !== 6) {
                        resultNumbers.push(resultLine.children[i].innerHTML)
                    }
                }
                resultList.push(resultNumbers);
            }
            console.log(getNextPageButton(pageIndex)) 
            if (getNextPageButton(pageIndex)) {
                const href = "javascript:NextPage(" + pageIndex + ")";                 
                window.location.href = href;                
                pageIndex++                
                console.log(pageIndex);
            } else {
                canGoNextPage = false;
            }
            return { resultList, canGoNextPage, pageIndex };
        }, pageIndex, canGoNextPage);

        canGoNextPage = evalResult.canGoNextPage;
        pageIndex = evalResult.pageIndex
        result.push(evalResult.resultList);        
        await wait(1000);
    }    
    result = result.flat(1);
    console.log(result);
    res.status(200).send(result);
    await browser.close();
}
