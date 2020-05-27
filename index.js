const yargs = require("yargs");
const fs = require("fs");
const readline = require("readline");
const { invalidMessages, invalidWords } = require("./config");

const options = yargs
  .usage('Usage: -f <filename> --user1="<user1_name>" --user2="<user2_name>"')
  .option("f", {
    alias: "file",
    describe: "Filename contains your messages",
    type: "string",
    demandOption: true,
  })
  .option("user1", {
    alias: "user1",
    describe: "User 1 name in the messages file",
    type: "string",
    demandOption: true,
  })
  .option("user2", {
    alias: "user2",
    describe: "User 2 name in the messages file",
    type: "string",
    demandOption: true,
  }).argv;

const { file, user1, user2 } = options;

async function processLineByLine(filename) {
  const fileStream = fs.createReadStream(filename);

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity,
  });

  let u1Id = 0;
  let u2Id = 0;
  const perDay = {};
  let perHour = {};
  const messages = {};

  for await (let line of rl) {
    if (line.indexOf(user1) === -1 && line.indexOf(user2) === -1) continue;

    line = line.replace(",", "");

    let split, sender;

    if (line.indexOf(" - " + user1 + ":") !== -1) {
      split = " - " + user1 + ":";
      sender = user1;
      id = ++u1Id;
    } else {
      split = " - " + user2 + ":";
      sender = user2;
      id = ++u2Id;
    }

    const parts = line.split(split);

    if (parts.length !== 2) continue;

    const datetime = parts[0].split(" ");

    const date = datetime[0];
    let time = datetime[1].split(":")[0];

    if (datetime.length > 2 && datetime[2].indexOf("PM") !== -1) {
      time = Number(time) + 12 + "";
    }

    const message = parts[1].trim().toLowerCase();

    const words = message.split(" ");

    if (invalidMessages.includes(message)) continue;

    if (perDay.hasOwnProperty(date)) {
      perDay[date] = perDay[date] + 1;
    } else {
      perDay[date] = 1;
    }
    if (perHour.hasOwnProperty(time)) {
      perHour[time] = perHour[time] + 1;
    } else {
      perHour[time] = 1;
    }

    if (!messages.hasOwnProperty(sender)) {
      messages[sender] = {};
    }

    for (const word of words) {
      if (!invalidWords.includes(word)) {
        if (messages[sender].hasOwnProperty(word)) {
          messages[sender][word] = messages[sender][word] + 1;
        } else {
          messages[sender][word] = 1;
        }
      }
    }
  }

  const u1Sorted = sortFromObjByValue(messages[user1]);
  const u2Sorted = sortFromObjByValue(messages[user2]);

  const data = {};

  data.total = {
    messages: u1Id + u2Id,
    days: Object.keys(perDay).length,
  };

  data[user1] = {
    words: u1Sorted.length,
    messages: u1Id,
  };

  data[user2] = {
    words: u2Sorted.length,
    messages: u2Id,
  };

  const topWords = {};

  topWords[user1] = u1Sorted.slice(0, 30);
  topWords[user2] = u2Sorted.slice(0, 30);

  perHour = arrayToObject(sortFromObjByKey(perHour));
  return {
    data,
    perDay,
    perHour,
    topWords,
  };
}

function sortFromObjByValue(obj) {
  var sortable = [];
  for (var key in obj) {
    sortable.push([key, obj[key]]);
  }

  sortable.sort(function (a, b) {
    return b[1] - a[1];
  });
  return sortable;
}

function sortFromObjByKey(obj) {
  var sortable = [];
  for (var key in obj) {
    sortable.push([key, obj[key]]);
  }

  sortable.sort(function (a, b) {
    return a[0] - b[0];
  });
  return sortable;
}

function arrayToObject(arr) {
  const obj = {};
  for (const item of arr) {
    obj[item[0]] = item[1];
  }
  return obj;
}

/**
 * - Read and analyze messages data
 * - Write it to statistics.json
 * * Data can be visualized
 */

async function run() {
  console.log("Preparing statistics..");

  const data = await processLineByLine(file);

  console.log("Statistics are ready. Writing to statistics.json..");

  fs.writeFileSync("statistics.json", JSON.stringify(data));

  console.log("Your statistics are done.");
}

run();
