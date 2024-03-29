const express = require('express');
const https = require('https');
const cors = require('cors');
const querystring = require('querystring');
const puppeteer = require('puppeteer');
const fetch = require('node-fetch');
// const redis = require('redis');
const router = express.Router();
const bodyParser = require('body-parser');
const FormData = require('form-data');

const app = express();
// const REDIS_PORT = process.env.PORT || 6379
const PORT = process.env.PORT || 3000;

// const client = redis.createClient(REDIS_PORT)

//Here we are configuring express to use body-parser as middle-ware.
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOptions = {
  origin: 'http://127.0.0.1:8080',
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};

// app.get('/repos/:username', cache, getRepos);

app.get('/', cors(corsOptions), function (req, res) {
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
});

async function fetchRecursive(url, count) {
  if (count > 5) return {};
  count++;
  let result = await getYoutubeVideoSrc(url);
  if (result.status === 'wait') {
    return await fetchRecursive(url, count);
  }
  return result;
}

app.post('/youtube', cors(corsOptions), async function (req, res) {
  let result = await fetchRecursive(req.body.url, 0);
  res.status(200).send(result);
});

app.listen(PORT, function () {
  console.log('Server is running at 3000');
});

// async function getRepos(req, res, next) {
//     try {
//         console.log('Fetching data...')
//         const { username } = req.params;
//         const response = await fetch(`https://api.github.com/users/${username}`);
//         const data = await response.json();
//         const repos = data.public_repos;
//         // set data to Redis
//         client.setex(username, 3600, repos)
//         res.send(setResponse(username, repos));

//     } catch (err) {
//         console.error(err);
//         res.status(500);
//     }
// }

// // Cache middleware
// function cache(req, res, next) {
//     const {username} = req.params;

//     client.get(username, (err, data) => {
//         if (err) throw err;
//         if (data !== null) {
//             res.send(setResponse(username, data));
//         } else {
//             next();
//         }
//     })
// }

function setResponse(username, repos) {
  return `<h2>${username} has ${repos} Github repos</h2>`;
}

var crawlWebData = async (res) => {
  debugger;
  try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.nhaccuatui.com/bai-hat/top-20.html');
    const songs = await page.evaluate(() => {
      let items = document.querySelectorAll('.name_song');
      let links = [];
      items.forEach((item) => {
        links.push({
          title: item.innerText,
          url: item.getAttribute('href'),
        });
      });
      return links;
    });
    console.log(songs);
    res.status(200).send(songs);
    await browser.close();
  } catch (err) {
    console.error(err);
    res.status(500);
  }
};

async function getYoutubeVideoSrc(youtubeLink) {
  let formData = new FormData();
  formData.append('url', youtubeLink);
  formData.append('action', 'homePure');

  const url = 'https://en.fetchfile.net/fetch/';
  const response = await fetch(url, {
    method: 'POST',
    body: formData, // body data type must match "Content-Type" header
  });
  return response.json();
}

async function crawlWebDataVietlott(res) {
  // puppeteer options: {headless: false}, {devtools: true}
  let result = [];
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    'https://vietlott.vn/vi/trung-thuong/ket-qua-trung-thuong/winning-number-655.html'
  );
  let canGoNextPage = true;
  let pageIndex = 1;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  while (canGoNextPage) {
    const evalResult = await page.evaluate(
      (pageIndex, canGoNextPage) => {
        const getNextPageButton = (pageIndex) => {
          const nextPageButtons = document.querySelectorAll(
            "[href='javascript:NextPage(" + pageIndex + ");']"
          );
          const length = nextPageButtons.length;
          return nextPageButtons[length - 1];
        };
        let resultList = [];
        let resultLines = document.querySelectorAll(
          '.doso_output_nd .day_so_ket_qua_v2'
        );
        for (resultLine of resultLines) {
          const resultNumbers = [];
          for (let i = 0; i < 8; i++) {
            if (i !== 6) {
              resultNumbers.push(resultLine.children[i].innerHTML);
            }
          }
          resultList.push(resultNumbers);
        }
        console.log(getNextPageButton(pageIndex));
        if (getNextPageButton(pageIndex)) {
          const href = 'javascript:NextPage(' + pageIndex + ')';
          window.location.href = href;
          pageIndex++;
          console.log(pageIndex);
        } else {
          canGoNextPage = false;
        }
        return { resultList, canGoNextPage, pageIndex };
      },
      pageIndex,
      canGoNextPage
    );

    canGoNextPage = evalResult.canGoNextPage;
    pageIndex = evalResult.pageIndex;
    result.push(evalResult.resultList);
    await wait(1000);
  }
  result = result.flat(1);
  console.log(result);
  res.status(200).send(result);
  await browser.close();
}
