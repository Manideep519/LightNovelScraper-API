const router = require("express").Router();
const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

const middlewares = require("./middlewares");
const options = middlewares.options;

const baseScrapeURL = "https://boxnovel.com/";

router.get("/", (req, res, next) => {
  res.send("API is up and runing \n\n Navigate using below link \n\n add the following to your url /novel-list/1/views ");
});

router.get("/novel/:name", (req, res, next) => {
  let url = req.headers.host;
  let protocol = req.protocol;
  let name = req.params.name.replace(/^name:/, "");
  let encodedURI = encodeURI(`novel/${name}`);
  (async () => {
    let novelData = {};
    try {
      const browser = await puppeteer.launch({ args: [`--proxy-server =${options.proxy}:${options.port}`, `--ignore-certificate-errors`, `--no-sandbox`, "--disable-extensions"] });
      const page = await browser.newPage();
      page.setUserAgent(options.useAgent);
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (["image", "font", "stylesheet"].indexOf(request.resourceType()) !== -1) {
          request.abort();
        } else {
          request.continue();
        }
      });
      await page.goto(baseScrapeURL.concat(encodedURI));
      await page.waitForSelector("#manga-chapters-holder > div.page-content-listing.single-page > div > ul");
      const content = await page.content();
      const $ = cheerio.load(content);
      novelData.name = $("div.post-title h1").html().trim();
      // novelData.imageUrl = $("div.profile-manga.summary-layout-1 > div > div > div > div.tab-summary > div.summary_image > a > img").attr("src");
      novelData.author = $(" div.summary-content > div.author-content > a").html();
      novelData.rating = $("div.post-total-rating span.score").html();
      novelData.status = $("div.post-status div.summary-content:last-child").html().trim();
      novelData.summary = $("div.c-page__content div.description-summary").html().trim();
      novelData.geners = [];
      novelData.chaptersListData = [];
      $("div.summary-content div.genres-content a")
        .contents()
        .each((i, elm) => {
          novelData.geners[i] = elm.data;
        });
      $("#manga-chapters-holder > div.page-content-listing.single-page > div > ul li.wp-manga-chapter a").each((i, elm) => {
        elm.children.forEach((node) => {
          novelData.chaptersListData.push({ chapterName: node.data.trim() });
        });
      });
      $("#manga-chapters-holder > div.page-content-listing.single-page > div > ul li.wp-manga-chapter a").each((i, elm) => {
        novelData.chaptersListData[i].chapterLinkName = elm.attribs.href.replace(`${baseScrapeURL}`, `${protocol}://${url}/`).slice(0, -1);
      });
      $("#manga-chapters-holder > div.page-content-listing.single-page > div > ul li.wp-manga-chapter span.chapter-release-date i")
        .contents()
        .each((i, elm) => {
          novelData.chaptersListData[i].chapterReleaseTime = elm.data;
          browser.close();
        });
      res.send(JSON.stringify(novelData));
      res.end();
    } catch (error) {
      console.log("Error in get Novel Details" + error);
      res.send(JSON.stringify("Error in get Novel Details" + error));
      res.end();
    }
  })();
});

//

/* Get specific chapter for a novel

URL Format =  http://localhost:8000/novel/<name>/chapter-<chapterNumber>
Example = http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years/chapter-261 

*/
router.get("/novel/:name/:chapter", (req, res, next) => {
  let name = req.params.name.replace(/^name:/, "");
  let chapterNumber = req.params.chapter.replace(/\s/, "");
  let encodedURI = encodeURI(`novel/${name}/${chapterNumber}`);
  let chapter = {
    title: chapterNumber,
    data: "",
  };
  (async () => {
    try {
      const browser = await puppeteer.launch({ args: [`--proxy-server =${options.proxy}:${options.port}`, `--ignore-certificate-errors`, `--no-sandbox`, "--disable-extensions"] });
      const page = await browser.newPage();
      page.setUserAgent(options.useAgent);
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (["image", "stylesheet", "font", "script"].indexOf(request.resourceType()) !== -1) {
          request.abort();
        } else {
          request.continue();
        }
      });
      await page.goto(baseScrapeURL.concat(encodedURI), { waitUntil: "domcontentloaded" });
      const html = await page.content();
      const $ = cheerio.load(html);
      chapter.data = $("div.text-left").html();
      res.send(chapter);
      res.end();
      browser.close();
    } catch (error) {
      console.log("Error: in get chapters of each novel , or check the url", error);
      res.send(JSON.stringify("Error: in gets chapters of each novel , or check the url", error));
      res.end();
    }
  })();
});

/* Get all novels available 10 novels data each request and sort query


*/
router.get("/novel-list/:page/:order", (req, res, next) => {
  let url = req.headers.host;
  let protocol = req.protocol;
  let novel = [];
  let tempImageUrl;
  let viewBy = req.params.order.replace(/^order=/, "");
  let page = req.params.page.replace(/^:page/, "");
  let encodedURI = encodeURI(`/novel/page/${page}/?m_orderby=${viewBy}`);
  (async () => {
    try {
      const browser = await puppeteer.launch({ args: [`--proxy-server =${options.proxy}:${options.port}`, `--ignore-certificate-errors`, `--no-sandbox`, "--disable-extensions"] });
      const page = await browser.newPage();
      page.setUserAgent(options.useAgent);
      await page.setRequestInterception(true);
      page.on("request", (request) => {
        if (["image", "stylesheet", "font"].indexOf(request.resourceType()) !== -1) {
          request.abort();
        } else {
          request.continue();
        }
      });
      await page.goto(baseScrapeURL.concat(encodedURI), { waitUntil: "domcontentloaded" });
      const html = await page.content();
      const $ = cheerio.load(html);

      $("div.item-summary > div.post-title.font-title > h3 > a")
        .contents()
        .each((i, elm) => {
          novel.push({ title: elm.data, link: elm.parentNode.attribs.href.replace(`${baseScrapeURL}`, `${protocol}://${url}/`) });
        });

      $("div.page-item-detail a img").each(async (i, elm) => {
        novel[i].imageUrl = encodeURI(elm.attribs.src);
      });

      $("div.page-item-detail span.score")
        .contents()
        .each((i, elm) => {
          novel[i].score = elm.data;
        });

      $("div.page-item-detail div.chapter-item:first-child a.btn-link")
        .contents()
        .each((i, elm) => {
          novel[i].lastestChapter = elm.data;
        });

      $("div.page-item-detail div.chapter-item:first-child span.post-on")
        .contents()
        .each((i, elm) => {
          novel[i].lastUpdated = elm.data.trim();
        });
      page.close();

      browser.close();
      res.send(novel);
      res.end();
    } catch (error) {
      console.log("Error: something went wrong in getNovel List, or check the url" + error);
      res.send(JSON.stringify("Error: something went wrong in getNovel List, or check the url", error));
      res.end();
    }
  })();
});

// router.get("/test", (req, res) => {
//   (async () => {
//     try {
//       let urls = ["https://boxnovel.com/wp-content/uploads/2020/02/Let-Me-Game-in-Peace-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2018/12/lord-of-the-mysteries-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2019/07/A-Stay-at-home-Dads-Restaurant-In-An-Alternate-World-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2020/06/Mages-Are-Too-OP-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2021/05/i-turned-wild-after-being-doted-on-by-the-big-bosses-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2019/09/worlds-apocalypse-online-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2018/07/War-Sovereign-Soaring-The-Heavens-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2021/02/im-actually-a-cultivation-bigshot-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2018/07/Cultivation-Chat-Group-110x150.jpg", "https://boxnovel.com/wp-content/uploads/2020/12/Fey-Evolution-Merchant-110x150.jpg"];
//       for (let i = 0; i < urls.length; i++) {
//         const browser = await puppeteer.launch({ headless: true, args: [`--proxy-server =${options.proxy}:${options.port}`, `--ignore-certificate-errors`, `--no-sandbox`, "--disable-extensions"] });
//         const pageTwo = await browser.newPage();
//         const [imageResponse] = await Promise.all([pageTwo.waitForResponse((response) => response), pageTwo.goto(urls[i])]);
//         const buffer = await imageResponse.buffer();
//         const base64 = "data:image/png;base64," + buffer.toString("base64");
//         await pageTwo.close();
//         console.log(base64);
//         browser.close();
//       }
//     } catch (error) {
//       console.log(error);
//     }
//   })();
// });
// router.get("/test", (req, res) => {
//   (async () => {
//     try {
//       const browser = await puppeteer.launch({ headless: false });
//       const page = await browser.newPage();
//       await page.setViewport({ width: 1366, height: 768 });

//       page.

//       await page.goto("https://boxnovel.com/novel/?m_orderby=views");
//       res.end("done");
//     } catch (error) {
//       console.log(error);
//     }
//   })();
// });

module.exports = router;
