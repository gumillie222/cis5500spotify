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
    AND ch.chart_rank <= ${chartRank}
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

// get artists_by_state_and_initial
const getArtistsStateInitial = async function(req, res) {
  const state = req.query.state || 'California';
  const initial = req.query.initial || 'a';

  if (typeof state !== 'string' || state.trim() === '') {
      return res.status(400).send('Invalid state parameter');
  }
  if (typeof initial !== 'string' || initial.trim() === '') {
      return res.status(400).send('Invalid initial parameter');
  }

  initial = `${initial}%`;

  connection.query(`
  WITH temp AS (
      SELECT ch.artist AS artist, ch.title AS title, SUM(ch.streams) AS streams
      FROM Chart_small ch
      WHERE ch.artist ILIKE ${initial}
      GROUP BY ch.artist, ch.title
  ),
  temp2 AS (
      SELECT c.title AS title, c.city AS city
      FROM Concert c
      WHERE c.state= ${state}
  )
  SELECT t.artist, t.title, COUNT(a.name) AS airbnb_count
  FROM Airbnb a
  JOIN temp2 t2 ON t2.city = a.city
  LEFT JOIN temp t ON t2.title LIKE CONCAT('%', t.artist, '%')
  GROUP BY t.artist, t.title
  ORDER BY t.artist DESC, t.streams DESC;
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
};

// get all_concerts_airbnb_count
const getConcertsAirbnbCount = async function (req, res) {
  connection.query(`
  WITH numAirbnb AS (
    SELECT a.city AS city, COUNT(a.name) AS num
    FROM Airbnb a
    GROUP BY a.city
  )
  SELECT DISTINCT c.title, c.datetime_utc, n.num
  FROM Concert c
  JOIN numAirbnb n ON c.city = n.city
  ORDER BY c.datetime_utc ASC;
  `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.status(200).json(data);
      }
    });
}

// get avg_airbnb_price
const getAvgAirbnbPrice = async function (req, res) {
  connection.query(`
  SELECT a.city, a.room_type, AVG(a.price) AS price
    FROM Airbnb a
    GROUP BY a.city, a.room_type
    HAVING AVG(a.price) > 0
    ORDER BY AVG(a.price) ASC;
  `, (err, data) => {
      if (err || data.length === 0) {
        console.log(err);
        res.json({});
      } else {
        res.status(200).json(data);
      }
    });
}

// get top_cities_based_on_concerts
const getTopCitiesConcerts = async function (req, res) {
  connection.query(`
  SELECT c.city, COUNT(c.event_id) AS concert_count
  FROM Concert c
  JOIN Chart_small ch ON c.title LIKE CONCAT('%', ch.artist, '%')
  GROUP BY c.city
  ORDER BY COUNT(c.event_id) DESC;
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
  hello
}