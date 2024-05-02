var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */


// connection.query('CREATE INDEX chart_rank_idx ON Chart_small(chart_rank);', (err, result) => {
//   if (err) {
//     console.error('Error creating index:', err);
//     return;
//   }
// console.log('Index created successfully')});


//get /hello
const hello = async function (req, res) {
  return res.status(200).json({ message: 'Connection is successful!' });
}

// get /top_cities - WORKS
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


// get /top_artists - WORKS
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


// get /airbnb -- NEED TO CHECK AGAIN, COULDN'T RUN
const getAirbnb = async function (req, res) {
  const priceMin = parseInt(req.query.price_min) || 0;
  const priceMax = parseInt(req.query.price_max);
  const numReviews = parseInt(req.query.num_reviews) || 0;
  const chartRank = parseInt(req.query.chart_rank);
  if (isNaN(priceMax) || isNaN(chartRank)) {
    return res.status(400).send('Invalid max or rank parameter');
  }
  connection.query(`
  SELECT DISTINCT *
  FROM Airbnb a
  JOIN Concert c
    ON a.city = c.city
  JOIN Chart_small ch
    ON c.title LIKE CONCAT('%', ch.artist,'%')
  WHERE a.price <= 10000 AND a.price >= 0
    AND a.number_of_reviews >= 0
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

// get /subcategories - WORKS
// {"event_subcategory":"HIP-HOP/RAP","count":91}
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

// get /artists_by_state_and_initial -- NEED TO CHECK, COULDN'T RUN
const getArtistsStateInitial = async function (req, res) {

  const state = req.query.state || 'CA';
  const artistPrefix = req.query.artistPrefix || 'Taylor';

  const query = `
    WITH temp AS (
      SELECT ch.artist AS artist, ch.title AS title, SUM(ch.streams) AS streams
      FROM Chart_small ch
      WHERE ch.artist LIKE ?
      GROUP BY ch.artist, ch.title
    ),
    temp2 AS (
      SELECT c.title AS title, c.city AS city
      FROM Concert c
      WHERE c.state= ?
    )
    SELECT t.artist, t.title, COUNT(a.name) AS airbnb_count
    FROM Airbnb a
    JOIN temp2 t2 ON t2.city = a.city
    LEFT JOIN temp t ON t2.title LIKE CONCAT('%', t.artist, '%')
    GROUP BY t.artist, t.title
    ORDER BY t.artist DESC, t.streams DESC;
  `;

  connection.query(query, [`${artistPrefix}%`, state], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data);
  });
}

// get /all_concerts_airbnb_count
// {"title":"Coors Field Event Parking","datetime_utc":"2023-08-02T04:00:00.000Z","num":5362}
const getConcertsAirbnbCount = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    WITH numAirbnb AS (
      SELECT a.city AS city, COUNT(a.name) AS num
      FROM Airbnb a
      GROUP BY a.city
    )
    SELECT DISTINCT c.title, c.datetime_utc, n.num
    FROM Concert c
    JOIN numAirbnb n ON c.city = n.city
    ORDER BY c.datetime_utc ASC
    LIMIT ?
  `;

  connection.query(query, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data);
  });
}

// get /avg_airbnb_price
// {"city":"Oakland","room_type":"Shared room","price":33.5625}
const getAvgAirbnbPrice = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT a.city, a.room_type, AVG(a.price) AS price
    FROM Airbnb a
    GROUP BY a.city, a.room_type
    HAVING AVG(a.price) > 0
    ORDER BY AVG(a.price) ASC
    LIMIT ?
  `;

  connection.query(query, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data);
  });
}

// get /top_cities_on_concerts -- WORKS, TOOK A WHILE
// {"city":"Inglewood","concert_count":5590}
const getCitiesBasedOnConcerts = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT c.city, COUNT(c.event_id) AS concert_count
    FROM Concert c
    JOIN Chart_small ch ON c.title LIKE CONCAT('%', ch.artist, '%')
    GROUP BY c.city
    ORDER BY COUNT(c.event_id) DESC
    LIMIT ?
  `;

  connection.query(query, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data);
  });
}

// get /month_popularity -- WORKS, but suspicious answer
// {"month":"8","concert_count":3580}
const getMonthPopularity = async function (req, res) {

  const artist = req.query.artist || 'Taylor';

  const query = `
    SELECT c.month, COUNT(c.event_id) AS concert_count
    FROM Concert c
    JOIN Chart_small ch ON c.title LIKE CONCAT('%', ch.artist, '%')
    WHERE ch.artist LIKE ?
    GROUP BY c.month
    ORDER BY concert_count DESC;
  `;

  connection.query(query, [`${artist}%`], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data);
  });
}

// get /events_and_accommodations -- WORKS
// {"city":"New York City","event_category":"MUSIC","numAirbnb":42919}
const getEventsAccomodations = async function (req, res) {

  const city = req.query.city || 'Los Angeles';

  const query = `
  WITH AirbnbCount AS (
      SELECT a.city AS city, COUNT(a.id) AS numAirbnb
      FROM Airbnb a
      GROUP BY a.city
  ),
  EventCounts AS (
      SELECT c.city, c.event_category, COUNT(c.event_id) AS event_count
      FROM Concert c
      GROUP BY c.city, c.event_category
  ),
  MaxEventCounts AS (
      SELECT city, MAX(event_count) AS max_event_count
      FROM EventCounts
      GROUP BY city
  ),
  MostPopularEventCategory AS (
      SELECT ec.city, ec.event_category
      FROM EventCounts ec
      INNER JOIN MaxEventCounts mex ON ec.city=mex.city AND ec.event_count=mex.max_event_count
  )
  SELECT mpec.city, mpec.event_category, ac.numAirbnb
  FROM MostPopularEventCategory mpec
  JOIN AirbnbCount ac ON mpec.city=ac.city
  WHERE ac.city = ?
  `;

  connection.query(query, [`${city}`], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data);
  });
}

// get /most_improved_songs -- WORKS
// {"title":"'Till I Collapse","improved":39}
const getMostImprovedSongs = async function (req, res) {

  const year = req.query.year || '2017'; 
  const limit = parseInt(req.query.limit) || 100;

  const query = `
  WITH temp AS (
      SELECT ch.title, COUNT(ch.title) AS down
      FROM Chart_small ch
      WHERE ch.year = ? AND ch.trend = 'MOVE_DOWN'
      GROUP BY ch.title
  ),
  temp1 AS (
      SELECT ch.title, COUNT(ch.title) AS up
      FROM Chart_small ch
      WHERE ch.year = ? AND ch.trend = 'MOVE_UP'
      GROUP BY ch.title
  )
  SELECT ch.title, (COALESCE(t1.up, 0) - COALESCE(t.down, 0)) AS improved
  FROM Chart_small ch
  LEFT JOIN temp t ON ch.title = t.title
  LEFT JOIN temp1 t1 ON ch.title = t1.title
  WHERE ch.year = ?
  GROUP BY ch.title
  ORDER BY improved DESC
  LIMIT ?;
  `;

  connection.query(query, [year, year, year, limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data);
  });
}

// get /average_prices - WORKS
// {"neighborhood":"Lauderdale By The Sea","average_price":364.21}
const getAveragePrice = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT a.neighborhood, AVG(a.price) AS price
    FROM Airbnb a
    GROUP BY a.neighborhood
    ORDER BY AVG(a.price) DESC, a.neighborhood
    LIMIT ?
  `;

  connection.query(query, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(404).json({ message: "No data found for the given parameters." });
    }
    const formattedData = data.map(row => ({
      neighborhood: row.neighborhood,
      average_price: parseFloat(row.price.toFixed(2)) // Formatting the price to two decimal places
    }));
    res.status(200).json(formattedData);
  });
}


// The exported functions, which can be accessed in index.js.
module.exports = {
  topCities,
  topArtists,
  getAirbnb,
  getSubcategories,
  getArtistsStateInitial,
  getConcertsAirbnbCount,
  getAvgAirbnbPrice,
  getCitiesBasedOnConcerts,
  getMonthPopularity,
  getEventsAccomodations,
  getMostImprovedSongs,
  getAveragePrice,
  hello
}