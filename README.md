# LightNovelScraper-API

A node.js API which fetches light novel data from [Boxnovel.com](https://boxnovel.com), using [puppeteer](https://github.com/puppeteer/puppeteer) and [cherrio](https://github.com/cheeriojs/cheerio). Uses a random proxy generated for each request, free proxies from [sslproxies.org](https://sslproxies.org/).

- Recommend using a JSON parser extension to view the parsed data, chrome users can get this from store [JSON Formatter](https://chrome.google.com/webstore/detail/json-formatter/bcjindcccaagfpapjjmafapmmgkkhgoa).
- Live demo : https://light-novel-scraper-api.herokuapp.com/novel-list/1/views

## API

- To get list of novels use below api (10 novels per page).

  - `http://localhost:8000/novel-list/<page>/<orderBy>`
  - Replace `<page>` with numerical value `http://localhost:8000/novel-list/1/<orderBy>`
  - Replace `<orderBy>` with parameters `trending` `views` `new` `latest` `alphapet`
  - Example api gets 10 novels data from page 1, ordered by most views `http://localhost:8000/novel-list/1/views`

    ```
    [
      {
        "title": "Top Tier Providence, Secretly Cultivate for a Thousand Years",
        "link": "http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years/",
        "score": "4.4",
        "lastestChapter": " Chapter 261 ",
        "lastUpdated": "7 hours ago"
      },
      {
        "title": "She Becomes Glamorous After The Engagement Annulment",
        "link": "http://localhost:8000/novel/she-becomes-glamorous-after-the-engagement-annulment/",
        "score": "4.1",
        "lastestChapter": " Chapter 172 ",
        "lastUpdated": "1 hour ago"
      },
      {
        "title": "Astral Pet Store",
        "link": "http://localhost:8000/novel/astral-pet-store-boxnovel/",
        "score": "4.1",
         ......
         ....
    ```

- To get information about a novel.

  - `http://localhost:8000/novel/<novel-name>`
  - Replacing `<novel-name>` with example name `http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years`.
  - Since this api is basically a scraper, names are scraped from the website, so to get specific data about a novel, use the links generated from the above api.

    ```
    [
      {
      "name": "Top Tier Providence, Secretly Cultivate for a Thousand Years",
      "author": "Let me laugh",
      "rating": "4.4",
      "status": "OnGoing",
      "summary": "<div class=\"summary__content show-more\"><h2 class=\"pt4 pb4 oh mb4 auto_height\"><em>Top Tier Providence, Secretly Cultivate for a Thousand Years</em>
      </h2>\n<h3 class=\"g_h2 fs24 lh32 fw700 pl1 ell mb16\">Synopsis</h3>\n<div class=\"g_txt_over mb48 fs16 j_synopsis _txtover _on\">\n<p class=\"c_000\">
      Being reincarnated in a cultivation world, Han Jue realizes that he can live his life like a video game. He con reroll his cultivation potential and connate providence.
      <br>\nSo,...............
      "geners": [
        "Action",
        "Adventure",
        "Fantasy"
      ],
      "chaptersListData": [
        {
          "chapterName": "Chapter 261 - Chaos in the Buddhist Sect, Mysterious Mastermind",
          "chapterLinkName": "http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years/chapter-261",
          "chapterReleaseTime": "7 hours ago"
        },
        {
          "chapterName": "Chapter 260 - Killing the Enemies, Wrath of the Demon Emperor",
          "chapterLinkName": "http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years/chapter-260",
          "chapterReleaseTime": "19 hours ago"
        },
        {
          "chapterName": "Chapter 259 - Immeasurable Emperor, Dragon Race’s Invasion",
          "chapterLinkName": "http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years/chapter-259",
          "chapterReleaseTime": "1 day ago"
        },
        ........
        .....

    ```

- To get chapter of a novel

  - `http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years/chapter-<number>`

  - Replace `<number>` with a corresponding chapter number `http://localhost:8000/novel/top-tier-providence-secretly-cultivate-for-a-thousand-years/chapter-260`.

  - Best use the links generated from the above api to get chapters in latest order.
    ```
          {
            "title": "chapter-1",
            "data": "Chapter 1: Eleven Years of Rolling the Dice, Today Is the Lucky Day\n11\n\nTranslator: Atlas Studios  Editor: Atlas Studios [Name: Han Jue]\n\n\n\n\n\n\n
            [Lifespan: 11 / 65]\n15\n\n\n\n\n[Race: Mortal]\n3\n\n\n\n\n[Cultivation: None]\n\n\n\n\n[Technique: None]\n\n\n\n\n[Magic: None]\n\n\n\n\n[Mystical Power:
            None]\n\n\n\n\n[Equipment: None]\n3\n\n\n\n\n[Cultivation Potential: Extremely Bad (Click to roll the dice)]\n7\n\n\n\n\n[Connate Providence is as follows
            (Click to roll the dice)]\n9\n\n\n\n\n[Earth and Wood Spiritual Powers: Earth and Wood Cultivation Potential strengthened]\n\n\n\n\n
            [Spear Dao Spirit Child: Spear Dao aptitude strengthened, physique strengthened.]\n5\n\n\n\n\n[Click here to start your thrilling life]
            \n9\n\n\n\n\n…\n\n\n\n\nLooking at the attributes list in front of him, the 11-year-old Han Jue almost lost all hope.\n\n\n\n\nCultivation
            Potential and Connate Providence could be randomly changed every day by rolling the dice. However, each could only be changed once,
            and they could be refreshed every day at seven in the morning.\n\n\n\n\nHan Jue had been refreshing since he was born.\n\n\n\n\n\n\n
            It had been eleven years, but he still hadn’t managed to produce the best attributes and Connate Providence.\n4\n\n\n\n\n“
            Should I just start like this?”\n\n\n\n\nA thought popped up in Han Jue’s mind.\n\n\n\n\nNo!\n\n\n\n\nIt wasn’t easy for him to come to a world of immortals and ghosts.
            How could it allow mortals to cultivate?\n3\n\n\n\n\nHan Jue wanted to be the almighty protagonist!\n\n\n\n\nRoll the dice again!\n4\n\n\n\n\n
            Han Jue raised his hand and clicked at the attributes list in front of him.\n\n\n\n\nCultivation Potential changed!\n\n\n\n\n[Cultivation Potential:
            ............
    ```

## Technologies used

- Express
- Puppeteer
- Cherrio
- axios
- random-useragent
