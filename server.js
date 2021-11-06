const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 8000;

const middlewares = require("./middlewares");

app.use(cors());
app.use(express.json());

app.use(function (req, res, next) {
  res.setHeader("Content-Type", "application/JSON; charset=utf-8");
  next();
});

app.use(middlewares.proxyGenerator);
app.use("/", require("./routes"));

app.listen(port, () => {
  console.log(`server up and runing on port : ${port}`);
});
