var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */

// get /top_cities
const topCities = async function(req, res) {
  const limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit < 1) {
    return res.status(400).send('Invalid limit parameter');
  }
  connection.query(`
  SELECT c.city
  FROM Concert c
  INNER JOIN Chart ch ON c.title LIKE CONCAT('%', ch.artist, '%')
  GROUP BY c.city
  ORDER BY COUNT(*) DESC
  LIMIT ${limit}
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
}

// The exported functions, which can be accessed in index.js.
module.exports = {
  topCities
}