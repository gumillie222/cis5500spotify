var config = require('./db-config.js');
var mysql = require('mysql');
const { Pool } = require('pg');


process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0

const pool = new Pool(config);

config.poolLimit = 10;
//var pool = mysql.createPool(config);

const { searchSpotifyForArtistByTitle } = require('./spotify-auth');

// First, create the index
/*pool.query('CREATE INDEX idx_chart_rank ON Chart_small(chart_rank);', (err, result) => {
  if (err) {
    console.error('Error creating index:', err);
    return;
  }
  console.log('Index created successfully')});*/

// Create a new column on concert to contain the artist name
// pool.query('ALTER TABLE Concert ADD COLUMN artist VARCHAR(255);')
// pool.query(`SELECT title FROM Concert 
//                 WHERE artist IS NULL AND event_category = "MUSIC"`, async (err, results) => {
//   if (err) {
//     console.error('Error fetching titles:', err);
//     return;
//   }
//   for (let result of results) {
//     const artistName = await searchSpotifyForArtistByTitle(result.title);
//     if (artistName) {
//       pool.query(`
//         UPDATE Concert SET artist = ? WHERE title = ?
//         `, [artistName, result.title], (err, updateResults) => {
//         if (err) {
//           console.error('Error updating artist:', err);
//         } else {
//           console.log(`Updated artist for title ${result.title}: ${artistName}`);
//         }
//       });
//     }
//   }
// });

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */


// pool.query('CREATE INDEX chart_rank_idx ON Chart_small(chart_rank);', (err, result) => {
//   if (err) {
//     console.error('Error creating index:', err);
//     return;
//   }
// console.log('Index created successfully')});


//get /hello
const hello = async function (req, res) {
  return res.status(200).json({ message: 'pool is successful!' });
}

// get latitude

const getLatitudeLongitude = async function (req, res) {

  const query = `
    SELECT latitude, longitude, name
FROM airbnblatlong a1 JOIN airbnbmain a ON a1.id = a.id
LIMIT 1000;
  `
  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.rows.length === 0) {
      return res.status(200).json({ message: "No data found for the given parameters." });
    }
    res.status(200).json(data.rows);
  });

}

// get /top_cities - WORKS
const topCities = async function (req, res) {
  var limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }
  pool.query(`
    SELECT c.city
    FROM (SELECT city, artist
      FROM ConcertMain cm
      JOIN ConcertAddr ca
      ON ca.formatted_address = cm.formatted_address) c
    INNER JOIN (SELECT cu.artist
      FROM ChartMain chm
      JOIN charturl cu ON chm.url = cu.url) ch
    ON c.artist = ch.artist
    GROUP BY c.city
    ORDER BY COUNT(*) DESC
    LIMIT ${limit}
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.status(200).json({ message: "Query did not return any results." });
    } else {
      res.json(data.rows);
    }
  });
}

// get /top_artists - WORKS
const topArtists = async function (req, res) {
  var limit = parseInt(req.query.limit);
  var position = parseInt(req.query.position);
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }

  if (isNaN(position) || position < 1) {
    position = 100;
  }
  pool.query(`
    SELECT ch.artist
    FROM (SELECT cu.artist, chart_rank, streams
      FROM ChartMain chm
      JOIN charturl cu ON chm.url = cu.url) ch
    WHERE ch.chart_rank <= ${position}
    GROUP BY ch.artist
    ORDER BY SUM(ch.streams) DESC
    LIMIT ${limit}
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.status(200).json({ message: "Query did not return any results." });
    } else {
      res.status(200).json(data.rows);
    }
  });
}


//get /airbnb - WORK
const getAirbnb = async function (req, res) {
  var priceMin = parseInt(req.query.price_min) || 0;
  var priceMax = parseInt(req.query.price_max) || 2000;
  var numReviews = parseInt(req.query.num_reviews) || 0;
  var chartRank = parseInt(req.query.chart_rank) || 10;

  pool.query(`
    SELECT DISTINCT *
    FROM airbnbmain a
    JOIN airbnbhost ON a.host_id = airbnbhost.host_id
    JOIN concertaddr ON a.city = concertaddr.city
    JOIN concertmain c
      ON c.formatted_address = concertaddr.formatted_address
    JOIN charturl ON c.artist = charturl.artist
    JOIN chartmain ON charturl.url = chartmain.url
    WHERE a.price > ${priceMin} AND a.price < ${priceMax}
      AND a.number_of_reviews > ${numReviews}
      AND chartmain.chart_rank <= ${chartRank}
    ORDER BY a.price DESC, concertaddr.city
    LIMIT 10;
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}



// get /subcategories - WORKS
// {"event_subcategory":"HIP-HOP/RAP","count":91} 
const getSubcategories = async function (req, res) {
  const rank = parseInt(req.query.rank) || 10;
  const times = parseInt(req.query.times) || 2;
  const streams = parseInt(req.query.streams) || 800000;
  const numAirbnb = parseInt(req.query.num_airbnb) || 10;
  const minPrice = parseInt(req.query.min_price) || 100;
  const maxPrice = parseInt(req.query.max_price) || 300;
  const minNights = parseInt(req.query.min_nights) || 3;

  pool.query(`
  WITH temp AS (
    (SELECT ch.artist
    FROM charturl ch
    JOIN chartmain cm ON ch.url = cm.url
    WHERE cm.chart_rank <= ${rank}
    GROUP BY ch.artist
    HAVING COUNT(*) > ${times} OR SUM(cm.streams) > ${streams})
      UNION
    (SELECT ch2.artist
    FROM charturl ch2
    JOIN chartmain cm ON ch2.url = cm.url
    WHERE cm.trend = 'NEW_ENTRY')
  ),
  temp2 AS (
      SELECT a.city
      FROM airbnbmain a
      WHERE a.minimum_nights <= ${minNights}
          AND a.price <= ${maxPrice} AND a.price >= ${minPrice}
      GROUP BY a.city
      HAVING COUNT(*) > ${numAirbnb}
  )
  SELECT c.event_subcategory, COUNT(*) AS count
  FROM concertmain c
  JOIN concertaddr ON c.formatted_address = concertaddr.formatted_address
  JOIN temp t
      ON c.artist = t.artist
  JOIN temp2 t2
      ON t2.city = concertaddr.city
  GROUP BY c.event_subcategory
  ORDER BY COUNT(*) DESC
  `, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}

// get /artists_by_state_initial -- WORK
const getArtistsStateInitial = async function (req, res) {

  const state = req.query.state || 'CA';
  const artistPrefix = req.query.artistPrefix || 'Taylor';

  const query = `
    WITH temp AS (
      SELECT ch.artist AS artist, ch.title AS title, SUM(chartmain.streams) AS streams
      FROM charturl ch
      JOIN chartmain ON ch.url = chartmain.url
      WHERE ch.artist LIKE CONCAT('${artistPrefix}', '%')
      GROUP BY ch.artist, ch.title
    ),
    temp2 AS (
        SELECT c.artist AS artist, concertaddr.city AS city
        FROM concertmain c
        JOIN concertaddr ON c.formatted_address = concertaddr.formatted_address
        WHERE concertaddr.state = '${state}'
    )
    SELECT t.artist, t.title, COUNT(a.name)
    FROM airbnbmain a
    JOIN airbnbhost ON a.host_id = airbnbhost.host_id
    JOIN temp2 t2 ON t2.city = a.city
    INNER JOIN temp t ON t2.artist = t.artist
    WHERE t.artist <> ''
    GROUP BY t.artist, t.title
    ORDER BY t.artist DESC
    `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}

// get /concerts_airbnb_count
// {"title":"Coors Field Event Parking","datetime_utc":"2023-08-02T04:00:00.000Z","num":5362}
const getConcertsAirbnbCount = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    WITH numAirbnb AS (
      SELECT a.city AS city, COUNT(a.name) AS num
      FROM airbnbmain a
      GROUP BY a.city
    )
    SELECT DISTINCT c.title, c.day, c.month, c.year, c.time, n.num
    FROM concertmain c
    JOIN concertaddr ca ON c.formatted_address = ca.formatted_address
    JOIN numAirbnb n ON ca.city = n.city
    ORDER BY c.year, c.month, c.day, c.time
    LIMIT ${limit}
  `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}

// get /avg_airbnb_price
// {"city":"Oakland","room_type":"Shared room","price":33.5625}
const getAvgAirbnbPrice = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT a.city, a.room_type, AVG(a.price) AS price
    FROM airbnbmain a
    GROUP BY a.city, a.room_type
    HAVING AVG(a.price) > 0
    ORDER BY AVG(a.price)
    LIMIT ${limit}

  `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}

// get /top_cities_on_concerts -- WORKS, TOOK A WHILE
// {"city":"Inglewood","concert_count":5590}
const getCitiesBasedOnConcerts = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT ca.city, COUNT(c.event_id) AS concert_count
    FROM concertmain c
    JOIN concertaddr ca ON c.formatted_address = ca.formatted_address
    JOIN charturl ch ON c.artist  = ch.artist
    GROUP BY ca.city
    ORDER BY COUNT(c.event_id) DESC
    LIMIT ${limit}
  `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.rows.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}

// get /month_popularity -- WORKS, but suspicious answer (not suspicious but just because not enough data)
// {"month":"8","concert_count":3580}
const getMonthPopularity = async function (req, res) {
  const artist = req.query.artist || 'Taylor Swift';

  const query = `
    SELECT ch.artist, c.month, COUNT(c.event_id) AS concert_count
    FROM concertmain c
    JOIN charturl ch ON c.artist  = ch.artist
    WHERE ch.artist LIKE $1
    GROUP BY c.month, ch.artist
    ORDER BY concert_count DESC;
  `;

  pool.query(query, [`%${artist}%`], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.rows.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}

// get /events_and_accommodations -- WORKS
// {"city":"New York City","event_category":"MUSIC","numAirbnb":42919}
const getEventsAccomodations = async function (req, res) {

  const city = req.query.city || 'Los Angeles';

  const query = `
  WITH AirbnbCount AS (
   SELECT a.city AS city, COUNT(a.id) AS numAirbnb
   FROM airbnbmain a
   GROUP BY a.city
),
EventCounts AS (
   SELECT ca.city, c.event_category, COUNT(c.event_id) AS event_count
   FROM concertmain c JOIN concertaddr ca ON c.formatted_address = ca.formatted_address
   GROUP BY ca.city, c.event_category
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
WHERE ac.city = $1;
  `;

  pool.query(query, [`${city}`], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.rows.length === 0) {
      return res.status(200).json({ message: "No data found." });
    }
    return res.status(200).json(data.rows);
  });

}

// get /most_improved_songs -- WORKS
// {"title":"'Till I Collapse","improved":39}
const getMostImprovedSongs = async function (req, res) {

  //  const year = req.query.year || '2017';
  const limit = parseInt(req.query.limit) || 100;

  const query = `
  WITH temp AS (
   SELECT ch.title, COUNT(*) AS down
   FROM charturl ch
   JOIN chartmain c ON ch.url = c.url
   WHERE c.trend = 'MOVE_DOWN'
   GROUP BY ch.title
),
temp1 AS (
   SELECT ch.title, COUNT(*) AS up
   FROM charturl ch
   JOIN chartmain c ON ch.url = c.url
   WHERE c.trend = 'MOVE_UP'
   GROUP BY ch.title
)
SELECT ch.title, (COALESCE(t1.up, 0) - COALESCE(t.down, 0)) AS improved
FROM charturl ch
JOIN chartmain c ON ch.url = c.url
LEFT JOIN temp t ON ch.title = t.title
LEFT JOIN temp1 t1 ON ch.title = t1.title
GROUP BY ch.title, t1.up, t.down
ORDER BY improved DESC
LIMIT $1;
;
  `;

  pool.query(query, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.rows.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    res.status(200).json(data.rows);
  });
}

// get /average_prices - WORKS
// {"neighborhood":"Lauderdale By The Sea","average_price":364.21}
const getAveragePrice = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT a.neighborhood, AVG(a.price) AS price
FROM airbnbmain a
GROUP BY a.neighborhood
ORDER BY AVG(a.price) DESC, a.neighborhood
LIMIT $1;
  `;

  pool.query(query, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      res.status(200).json({ message: "Query did not return any results." });
    }
    const formattedData = data.rows.map(row => ({
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
  hello,
  getLatitudeLongitude
}