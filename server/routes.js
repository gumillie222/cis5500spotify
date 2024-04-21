var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */

//get /hello
const hello = async function (req, res) {
  return res.status(200).json({ message: 'Connection is successful!' });
}

// get /top_cities
const topCities = async function (req, res) {
  const limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit < 1) {
    return res.status(400).send('Invalid limit parameter');
  }
  connection.query(`
  SELECT c.city
  FROM Concert c
  INNER JOIN Chart_small ch ON c.title LIKE CONCAT('%', ch.artist, '%')
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


// get /top_artists
const topArtists = async function (req, res) {
  const limit = parseInt(req.query.limit);
  const position = parseInt(req.query.position);
  if (isNaN(limit) || limit < 1) {
    return res.status(400).send('Invalid limit parameter');
  }

  if (isNaN(position) || position < 1) {
    return res.status(400).send('Invalid position parameter');
  }

  connection.query(`
                   
SELECT ch.artist
FROM Chart ch
WHERE ch.chart_rank <= ${position}
GROUP BY ch.artist
ORDER BY SUM(ch.streams) DESC
LIMIT ${limit}
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.status(200).json(data);
    }
  });
}


// get /airbnb
const getAirbnb = async function (req, res) {
  const priceMin = parseInt(req.query.price_min) ?? 0;
  const priceMax = parseInt(req.query.price_max);
  const numReviews = parseInt(req.query.num_reviews) ?? 0;
  const chartRank = parseInt(req.query.chart_rank);
  if (isNaN(priceMax) || isNaN(chartRank)) {
    return res.status(400).send('Invalid limit parameter');
  }
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

// get /subcategories
const getSubcategories = async function (req, res) {
  const rank = parseInt(req.query.rank) || 5;
  const times = parseInt(req.query.times) || 4;
  const streams = parseInt(req.query.streams) || 800000;
  const num_airbnb = parseInt(req.query.num_airbnb) || 10;
  const min_price = parseInt(req.query.min_price) || 100;
  const max_price = parseInt(req.query.max_price) || 300;
  const min_nights = parseInt(req.query.min_nights) || 3;


  connection.query(`
  WITH temp AS (
(SELECT ch.artist
FROM Chart ch
WHERE ch.chart_rank <= ${rank}
		AND ch.year >= 2017
GROUP BY ch.artist
HAVING COUNT(*) > ${times}
	OR SUM(ch.streams) > ${streams})
UNION
(SELECT ch2.artist
FROM Chart ch2
WHERE ch2.trend = 'NEW_ENTRY'
	AND ch2.chart_rank <= 50
GROUP BY ch2.artist
HAVING COUNT(*) > 3)
),
temp2 AS (
	SELECT a.city
	FROM Airbnb a
	WHERE a.minimum_nights < ${min_nights}
		AND a.price < ${max_price} AND a.price > ${min_price}
	GROUP BY a.city
	HAVING COUNT(*) > ${num_airbnb}
)
SELECT c.event_subcategory, COUNT(*) AS count
FROM Concert c
JOIN temp t
	ON c.title LIKE CONCAT('%', t.artist, '%')
JOIN temp2 t2
	ON t2.city = c.city
WHERE c.event_category = 'MUSIC'
GROUP BY c.event_subcategory
ORDER BY COUNT(*) DESC;
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.status(200).json(data);
    }
  });
}





// The exported functions, which can be accessed in index.js.
module.exports = {
  topCities,
  topArtists,
  getAirbnb,
  getSubcategories,
  hello
}