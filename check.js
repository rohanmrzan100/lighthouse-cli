import fs from "fs";

fs.readFile("output/result.txt", "utf8", (err, data) => {
  if (err) {
    console.error("Error reading the file: " + err);
    return;
  }

  // Split the file content into lines
  const lines = data.split("\n");

  let result = [];

  lines.forEach((line) => {
    const keyValue = line.split("=");
    const obj = {
      parameter: [keyValue[0]],
      score: keyValue[1],
    };
    result.push(obj);
  });
  result.shift();
  result.forEach((res) => {
    if (res.score < 50) {
      console.log(`Lighthouse check failed ${res.parameter}:${res.score}`);
    } else {
      console.log(`Lighthouse check passed ${res.parameter}:${res.score}`);
    }
  });
});
