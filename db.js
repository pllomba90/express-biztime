/** Database setup for BizTime. */
const { Client } = require("pg");

let connectionString;

if (process.env.NODE_ENV === "test") {
  connectionString = "postgresql://pllomba:29890@localhost:5432/biztime_test";
} else {
  connectionString = "postgresql://pllomba:29890@localhost:5432/biztime";
}

const client = new Client({
  connectionString
});

client.connect();

module.exports = client;
