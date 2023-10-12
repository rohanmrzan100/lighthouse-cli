#!/usr/bin/env node

import { program } from "commander";
import fs from "fs";
import lighthouse from "lighthouse";
import puppeteer from "puppeteer";
import chalk from "chalk";

let check = "";
fs.readFile("check.js", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file: " + err);
    return;
  }
  check = data;
// console.log({ Check: data });

});

//REPORT//
function createBigText(text) {
  const characters = {
    R: ["█████ ", "█   ██", "█████ ", "█   ██", "█    █"],
    E: ["██████", "█     ", "█████ ", "█     ", "██████"],
    P: ["█████ ", "█   ██", "█████ ", "█     ", "█     "],
    O: ["█████", "█   █", "█   █", "█   █", "█████"],
    T: ["██████", "  ██  ", "  ██  ", "  ██  ", "  ██  "],
  };
  const rows = Array.from({ length: 5 }, () => "");

  for (const char of text) {
    const charData = characters[char.toUpperCase()] || characters[" "];

    for (let i = 0; i < 5; i++) {
      rows[i] += charData[i] + "  ";
    }
  }

  const bigText = rows.map((row) => chalk.blue(row)).join("\n");
  return bigText;
}
const reportText = "REPORT";
const bigReportText = createBigText(reportText);

//RUN AUDITS//
const RunAudits = async (url) => {
  let result;

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const browserWSEndpoint = browser.wsEndpoint();
  const { port } = new URL(browserWSEndpoint);
  try {
    result = await GenerateReport(url, port);
  } catch (error) {
    console.error(error.message);
  } finally {
    await browser.close();
    console.log(bigReportText);
    console.log(chalk.bold.blue("Given URL : ") + chalk.bold.green(result.url));
    console.log(
      chalk.bold.yellowBright("performance : ") +
        chalk.magentaBright(result.result.performance)
    );
    console.log(
      chalk.bold.yellowBright("bestpractices : ") +
        chalk.magentaBright(result.result.bestpractices)
    );
    console.log(
      chalk.bold.yellowBright("accessibility : ") +
        chalk.magentaBright(result.result.accessibility)
    );
    console.log(
      chalk.bold.yellowBright("seo : ") + chalk.magentaBright(result.result.seo)
    );

    const finalresult = `URL : ${result.url}\n\performance =${result.result.performance}\nbestpractices =${result.result.bestpractices}\naccessibility =${result.result.accessibility}\n seo =${result.result.seo}`;

    const filePath = "output/result.txt";
    const exists = fs.existsSync(filePath);
    const exist = fs.existsSync("check.js");
    if (!exists) {
      fs.mkdirSync("output");
      fs.writeFile(filePath, finalresult, (err, res) => {
        console.log("Output folder with result.txt created");
      });
      fs.writeFile("output/Check.js", check, (err, res) => {
        console.log("check.js created");
      });
    } else {
      fs.writeFile(filePath, finalresult, (err, res) => {
        console.log("result.txt saved");
      });
    }
    return result;
  }
};
//GENERATE REPORT//
const GenerateReport = async (url, port) => {
  const options = {
    // logLevel: "none",
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    audits: [
      "first-meaningful-paint",
      "first-cpu-idle",
      "byte-efficiency/uses-optimized-images",
    ],
    port: parseInt(port),
    strategy: "desktop",
    timeoutMs: 60000,
  };

  const runnerResult = await lighthouse(url, options);

  const result_object = {
    performance: runnerResult.lhr.categories.performance?.score * 100 || "NA",
    accessibility:
      runnerResult.lhr.categories.accessibility?.score * 100 || "NA",
    bestpractices:
      runnerResult.lhr.categories["best-practices"]?.score * 100 || "NA",
    seo: runnerResult.lhr.categories.seo?.score * 100 || "NA",
  };

  const page = { url, result: result_object };
  return page;
};

program
  .option(
    "-u, --url <url of site to generate lighthouse report>",
    "Please enter a url"
  )
  .action((cmd) => {
    return RunAudits(cmd.url);
  });

program.parse(process.argv);
