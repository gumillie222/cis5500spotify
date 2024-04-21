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



// get /airbnb
const getAirbnb = async function(req, res) {
  const priceMin = parseInt(req.query.price_min);
  const priceMax = parseInt(req.query.price_max);
  const numReviews = parseInt(req.query.num_reviews);
  const chartRank = parseInt(req.query.chart_rank);
  if (isNaN(priceMin) || isNaN(priceMax) || 
  isNaN(numReviews) || isNaN(chartRank)) {
    return res.status(400).send('Invalid limit parameter');
  } // we need to change this later, set default values or smth
  connection.query(`
  SELECT DISTINCT *
  FROM Airbnb a
  JOIN Concert c
    ON a.city = c.city
  JOIN Chart_small ch
    ON c.title LIKE CONCAT('%', ch.artist,'%')
  WHERE a.price <= ${priceMax} AND a.price >= ${priceMin}
    AND a.number_of_reviews >= ${numReviews}
    AND ch.chart_rank <= 5
  ORDER BY a.price DESC, c.city;
  
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
  topCities,
  getAirbnb
}