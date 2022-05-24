const cheerio = require("cheerio");
const fs = require("fs");
const csvStringify = require("csv-stringify/sync");

const rawHtml = fs.readFileSync("./schedule.html", { encoding: "utf-8" });

const $ = cheerio.load(rawHtml);

let content = $(".col-xs-12.col-lg-9.offset-lg-3.content");

$(".page-title", content).remove();

const rows = [];
const sections = [];

content.children("div").each((i, el) => {
  const time = $(".row.schedule-title", el).text();

  const talks = [];

  const cards = $(".scheduleCard.card", el);

  if (cards.length === 0) {
    rows.push({
      order: i * 1000,
      slot: time,
      title: time,
    });
  }

  cards.each((k, el2) => {
    const order = i * 1000 + k * 10;
    const title = $(".col-md-7", el2).text().trim();
    const speakers = $(".col-md-3", el2).text().trim();
    const location = $(".col-md-2", el2).text().trim();

    let extra = $(".collapse .card-body .content-area", el2);

    const desc = $(extra.get(0)).text();

    $(extra.get(0), el2).remove();

    extra = $(".collapse .card-body .content-area", el2);

    let profileParts = [];

    extra.each((q, el3) => {
      profileParts.push($(el3).text());
    });

    let profile = profileParts.join("\n");

    const talk = {
      order,
      slot: time,
      title,
      location,
      speakers,
      desc,
      profile,
    };
    talks.push(talk);
    rows.push(talk);
  });

  const section = {
    time,
    talks,
  };

  sections.push(section);
});

console.log(rows);

const csvOutput = csvStringify.stringify(rows, {
  header: true,
  columns: [
    { key: "order" },
    { key: "slot" },
    { key: "title" },
    { key: "location" },
    { key: "speakers" },
    { key: "desc" },
    { key: "profile" },
  ],
});

fs.writeFileSync("./schedule.csv", csvOutput, { encoding: "utf-8" });

console.log("all done 😺");
