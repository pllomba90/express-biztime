/** Database setup for BizTime. */
const { Client } = require("pg");

const client = new Client({
  connectionString: "postgresql://pllomba:29890@5432/biztime"
});

client.connect();


module.exports = client;