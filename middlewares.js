const axios = require("axios").default;
const cheerio = require("cheerio");
const randomeUserAgent = require("random-useragent");

let userAgent = randomeUserAgent.getRandom();
let userAgentMetaData = randomeUserAgent.getRandomData();
let options = {
  protocol: "https",
  proxy: "",
  port: "",
  useAgent: userAgent,
  userAgentMetaData: userAgentMetaData,
};
const randomProxyGenerator = async (req, res, next) => {
  let ip_addresses = [];
  let port_numbers = [];
  let randomNumber = Math.ceil(Math.random() * 100);
  try {
    const response = await axios.get("https://sslproxies.org/");
    const html = response.data;
    const $ = cheerio.load(html);

    $("div.fpl-list td:nth-child(1)")
      .contents()
      .each((i, elm) => {
        ip_addresses[i] = elm.data;
      });

    $("div.fpl-list td:nth-child(2)")
      .contents()
      .each((i, elm) => {
        port_numbers[i] = elm.data;
      });

    options.proxy = ip_addresses[randomNumber];
    options.port = port_numbers[randomNumber];
    console.log(`completed proxy generator ip[${options.proxy} port[${options.port}] useAgent[${options.useAgent}]`);
    next();
  } catch (e) {
    console.log("Error in proxy generator" + e);
  }
};

module.exports.proxyGenerator = randomProxyGenerator;
module.exports.options = options;
