const express = require("express");
const axios = require("axios").default;
const cheerio = require("cheerio");
const cors = require("cors");
const app = express();
const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

const port = process.env.PORT || 8000;

axios.defaults.baseURL = "https://wuxiaworld.site";

app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/JSON; charset=utf-8");
  next();
});

// Status check

app.get("/", (req, res, next) => {
  res.send(JSON.stringify("API is up and runing"));
});

// Get seperate novel inforomation (name,author, chapters list, etc)
app.get("/novel/:name", (req, res, next) => {
  axios
    .get(`novel/${req.params.name.replace(/^name:/, "")}`)
    .then((response) => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        let novelData = {
          name: "",
          author: "",
          rating: 0,
          geners: [],
          status: "",
          summary: "",
          chaptersListData: [],
        };
        novelData.name = $("div.post-title h1").html();
        novelData.author = $("div.author-content a").html();
        novelData.rating = $("div.post-total-rating span.score").html();
        novelData.status = $("div.post-status div.summary-content").html().replace(/^\n/, "").replace(/\t$/, "");
        novelData.summary = $("div.summary__content p:odd").html();

        $("ul.version-chap li.wp-manga-chapter a").each((i, elm) => {
          elm.children.forEach((node) => {
            novelData.chaptersListData.push({ chapterName: node.data });
          });
        });
        $("ul.version-chap li.wp-manga-chapter span.chapter-release-date i")
          .contents()
          .each((i, elm) => {
            novelData.chaptersListData[i].chapterReleaseTime = elm.data;
          });

        $("div.genres-content a")
          .contents()
          .each((i, elm) => {
            novelData.geners.push(elm.data);
          });

        res.send(JSON.stringify(novelData));
        res.end();
      }
    })
    .catch((error) => {
      res.send(JSON.stringify("Error: something went wrong, or check the url", error));
      res.end();
    });
});

// Get specific chapter content
app.get("/novel/:name/:chapter", (req, res, next) => {
  axios
    .get(`novel/${req.params.name.replace(/^name:/, "")}/chapter-${req.params.chapter.replace(/^chapter:/, "")}`)
    .then((response) => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        let chapter_data = $.html("div.text-left p");

        res.send(JSON.stringify(chapter_data));
        res.end();
      }
    })
    .catch((error) => {
      res.send(JSON.stringify("Error: something went wrong, or check the url", error));
      res.end();
    });
});

// Get all novels available 10 novels data each request and sort query
app.get("/novel-list/:order", (req, res, next) => {
  let viewBy = req.params.order.replace(/^order=/, "");

  axios
    .get(`/novel-list/page/1/?m_orderby=${viewBy}`)
    .then((response) => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);
        let novel = [];

        $("div.page-item-detail .post-title a")
          .contents()
          .each((i, elm) => {
            novel.push({ title: elm.data, link: elm.parentNode.attribs.href });
          });

        $("div.page-item-detail a img").each((i, elm) => {
          novel[i].imageUrl = elm.attribs.src;
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
            novel[i].lastUpdated = elm.data.replace(/^\n/, "");
          });

        res.end(JSON.stringify(novel));
        res.end();
      }
    })
    .catch((error) => {
      res.send(JSON.stringify("Error: something went wrong, or check the url", error));
      res.end();
    });
});

app.listen(port, () => {
  console.log(`server up and runing on port : ${port}`);
});
