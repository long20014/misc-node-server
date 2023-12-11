import pkg from 'puppeteer';
const { launch } = pkg;

async function crawlWebDataVietlott(res) {
  // puppeteer options: {headless: false}, {devtools: true}
  let result = [];
  const browser = await launch({ headless: false });
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

const VietlottModule = {
  crawlWebDataVietlott,
};

export default VietlottModule;
