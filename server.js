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

//

// Get seperate novel inforomation (name,author, chapters list, etc)
app.get("/novel/:name", (req, res, next) => {
  let name = req.params.name.replace(/^name:/, "");
  let encodedURI = encodeURI(`novel/${name}`);

  let novelData = {
    name: "",
    author: "",
    rating: 0,
    geners: [],
    status: "",
    summary: "",
    chaptersListData: [],
  };
  axios
    .get(encodedURI)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      novelData.name = $("div.post-title h1").html();
      novelData.author = $("div.author-content a").html();
      novelData.rating = $("div.post-total-rating span.score").html();
      novelData.status = $("div.post-status div.summary-content").html().replace(/\t$/, "");
      novelData.summary = $("div.summary__content p:odd").html();

      $("div.genres-content a")
        .contents()
        .each((i, elm) => {
          novelData.geners.push(elm.data);
        });
    })
    .then(() => {
      axios.post(`novel/${name}/ajax/chapters`).then((response) => {
        const html = response.data;
        const $ = cheerio.load(html);

        console.log(response.data);
        $(" li.wp-manga-chapter a").each((i, elm) => {
          elm.children.forEach((node) => {
            novelData.chaptersListData.push({ chapterName: node.data.replace(/\n/g, "") });
          });
        });
        $(" li.wp-manga-chapter span.chapter-release-date i")
          .contents()
          .each((i, elm) => {
            novelData.chaptersListData[i].chapterReleaseTime = elm.data;
          });
        res.send(JSON.stringify(novelData));
        res.end();
      });
    })
    .catch((error) => {
      console.log(error);
      res.send(JSON.stringify("Error: something went wrong, or check the url", error));
      res.end();
    });
});

// Get specific chapter content

//
app.get("/novel/:name/:chapter", (req, res, next) => {
  let name = req.params.name.replace(/^name:/, "");
  let chapter = req.params.chapter.replace(/^chapter:/, "");
  let encodedURI = encodeURI(`novel/${name}/chapter-${chapter}`);

  axios
    .get(encodedURI)
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
      console.log(error);
      res.send(JSON.stringify("Error: something went wrong, or check the url", error));
      res.end();
    });
});

// Get all novels available 10 novels data each request and sort query

//
app.get("/novel-list/:page/:order", (req, res, next) => {
  let viewBy = req.params.order.replace(/^order=/, "");
  let page = Number(req.params.page.replace(/^page=/, ""));
  let encodedURI = encodeURI(`/novel-list/page/${page}/?m_orderby=${viewBy}`);

  let novel = [];
  let imageUrlsArray = [];

  axios
    .get(encodedURI)
    .then((response) => {
      if (response.status === 200) {
        const html = response.data;
        const $ = cheerio.load(html);

        $("div.page-item-detail a img").each((i, elm) => {
          imageUrlsArray.push(encodeURI(elm.attribs.src));
        });

        $("div.page-item-detail .post-title a")
          .contents()
          .each((i, elm) => {
            novel.push({ title: elm.data, link: elm.parentNode.attribs.href });
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
      }
    })
    .then(() => {
      if (imageUrlsArray) {
        axios
          .all(imageUrlsArray.map((i) => axios.get(i, { responseType: "arraybuffer" })))
          .then(
            axios.spread((...response) => {
              for (let i = 0; i < 10; i++) {
                //  Buffer.from(res[i].data).toString("base64").replace(/^/, "data:image/jpeg;base64,")
                novel[i].baseImage = Buffer.from(response[i].data).toString("base64").replace(/^/, "data:image/jpeg;base64,");
              }
              res.send(JSON.stringify(novel));
              res.end();
            })
          )
          .catch((error) => {
            console.log("imagelURlcall Error: something went wrong, or check the url" + error);
            res.send(JSON.stringify("imagelURlcall Error: something went wrong, or check the url", JSON.stringify(error)));
            res.end();
          });
      }
    })
    .catch((error) => {
      console.log("main catch Error: something went wrong, or check the url" + error);
      res.send(JSON.stringify("main catch Error: something went wrong, or check the url", JSON.stringify(error)));
      res.end();
    });
});

app.listen(port, () => {
  console.log(`server up and runing on port : ${port}`);
});
