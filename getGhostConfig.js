'use strict';

const fs = require('fs');

let databaseConfig;
try {
  databaseConfig = fs.readFileSync('database.config.json', 'utf8');
} catch(err) {
  if (err.code === "ENOENT") {
    console.error("ERROR: You have to copy and fill out the database.config.example.json file to database.config.json first. Currently no file database.config.json exists");
    process.exit();
  }
  else {
    throw err;
  }
}

// Remove the comments for JSON parsing
let stringArray = databaseConfig.split('\n');
stringArray = stringArray.map((string) => {
  return string.trim();
});
stringArray = stringArray.filter((string) => {
  return string.substr(0, 2) !== "//";
});
// Parse the JSON
databaseConfig = JSON.parse(stringArray.join(''));

const database = require('knex')({
  client: 'mysql',
  connection: databaseConfig,
});

fs.stat('ghost.config.json', (err, stats) => {
  if (!err) {
    // File exists
    let ghostConfig = fs.readFileSync('ghost.config.json', 'utf8');
    // Remove comments for easy parsing
    let stringArray = ghostConfig.split('\n');
    stringArray = stringArray.map((string) => {
      return string.trim();
    });
    stringArray = stringArray.filter((string) => {
      return string.substr(0, 2) !== "//";
    });
    // Parse JSON
    ghostConfig = JSON.parse(stringArray.join(''));
    database.select('slug', 'secret').from('clients').where('slug', '=', 'ghost-admin')
    .then((rows) => {
      if (rows.length !== 1) {
        database.destroy();
        throw new Error("database query returned more than 1 ghost-admin");
      }
      ghostConfig.client_id = rows[0].slug;
      ghostConfig.client_secret = rows[0].secret;
      fs.writeFileSync("ghost.config.json", JSON.stringify(ghostConfig, null, 2));
      database.destroy();
    });
  }
  else if (err.code === 'ENOENT') {
    database.destroy();
    throw new Error("You have to first copy ghost.config.example.json into ghost.config.json. No ghost.config.json file exists at this time");
  }
  else {
    database.destroy();
    throw new Error("Unexpected error code: " + err.code);
  }
});
