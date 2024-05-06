var config = require('./db-config.js');
var mysql = require('mysql');
const { Pool } = require('pg');


process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0

const pool = new Pool(config);
config.poolLimit = 10;


// Use Spotify API, create a new column on concert to contain the artist name
// In case there are any updates in the concert database, this needs to be run again
// const { searchSpotifyForArtistByTitle } = require('./spotify-auth');
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
    return res.status(200).json(data.rows);
  });

}

// get /top_cities 
const topCities = async function (req, res) {
  var limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit < 1) {
    limit = 10;
  }
  /* commented out because these only need to be executed once in database
  CREATE INDEX idx_cm_fa ON ConcertMain(formatted_address);
  CREATE INDEX idx_ca_fa ON ConcertAddr(formatted_address);
  CREATE INDEX idx_cm_artist ON ConcertMain(artist);
  CREATE INDEX idx_chm_artist ON ChartMain(artist);
  CREATE MATERIALIZED VIEW TopCityByArtist AS (
      SELECT c.city
      FROM (SELECT city, artist
        FROM ConcertMain cm JOIN ConcertAddr ca
        ON ca.formatted_address = cm.formatted_address) c
      INNER JOIN ChartMain chm
      ON c.artist = chm.artist
      GROUP BY c.city
      ORDER BY COUNT(DISTINCT chm.artist) DESC
      );
  */
  pool.query(`
    SELECT *
    FROM TopCityByArtist
    LIMIT ${limit};
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      return res.status(200).json({ message: "Query did not return any results." });
    } else {
      return res.status(200).json(data.rows);
    }
  });
}

// get /top_artists
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
      return res.status(200).json({ message: "Query did not return any results." });
    } else {
      return res.status(200).json(data.rows);
    }
  });
}


//get /airbnb 
const getAirbnb = async function (req, res) {
  var priceMin = parseInt(req.query.price_min) || 0;
  var priceMax = parseInt(req.query.price_max) || 2000;
  var numReviews = parseInt(req.query.num_reviews) || 0;
  var chartRank = parseInt(req.query.chart_rank) || 10;

  pool.query(`
    SELECT DISTINCT a.name, concertaddr.city, a.price, c.title, c.artist
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
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}



// get /subcategories 
const getSubcategories = async function (req, res) {
  const rank = parseInt(req.query.rank) || 10;
  const times = parseInt(req.query.times) || 2;
  const streams = parseInt(req.query.streams) || 800000;
  const numAirbnb = parseInt(req.query.num_airbnb) || 10;
  const minPrice = parseInt(req.query.min_price) || 100;
  const maxPrice = parseInt(req.query.max_price) || 300;
  const minNights = parseInt(req.query.min_nights) || 3;

  /* commented out because these only need to be executed once in database
  CREATE INDEX idx_airbnbmain_host_id ON airbnbmain(host_id);
  CREATE INDEX idx_airbnbhost_host_id ON airbnbhost(host_id);
  CREATE INDEX idx_concertaddr_city ON concertaddr(city);
  CREATE INDEX idx_airbnbmain_city ON airbnbmain(city);
  CREATE INDEX idx_concertaddr_formatted_address ON concertaddr(formatted_address);
  CREATE INDEX idx_concertmain_formatted_address ON concertmain(formatted_address);
  CREATE INDEX idx_chartmain_url ON chartmain(url);
  CREATE INDEX idx_charturl_url ON charturl(url);
  CREATE INDEX idx_chartmain_chart_rank ON chartmain(chart_rank);
  CREATE INDEX idx_airbnbmain_price_numreviews ON airbnbmain(price, number_of_reviews);
   */
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
    WHERE cm.trend = 'NEW_ENTRY' AND cm.chart_rank <= 50)
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
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}

// get /artists_by_state_initial
const getArtistsStateInitial = async function (req, res) {

  const state = req.query.state || 'CA';
  const artistPrefix = req.query.artistPrefix || 'Taylor';

  const query = `
    SELECT cc.artist, cc.title, COUNT(a.name)
    FROM airbnbmain a
    JOIN airbnbhost ON a.host_id = airbnbhost.host_id
    JOIN chart_concert cc ON cc.city = a.city
    WHERE cc.artist <> ''
        AND cc.state iLIKE '${state}'
        AND cc.artist iLIKE CONCAT('${artistPrefix}', '%')
    GROUP BY cc.artist, cc.title
    ORDER BY cc.artist DESC;
    `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}

// get /concerts_airbnb_count
const getConcertsAirbnbCount = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    WITH numAirbnb AS (
      SELECT a.city AS city, COUNT(a.name) AS num
      FROM airbnbmain a
      GROUP BY a.city
    )
    SELECT DISTINCT c.title, c.day, c.month, c.year, n.num
    FROM concertmain c
    JOIN concertaddr ca ON c.formatted_address = ca.formatted_address
    JOIN numAirbnb n ON ca.city = n.city
    ORDER BY c.year DESC, c.month DESC, c.day DESC
    LIMIT ${limit}
  `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}

// get /avg_airbnb_price
const getAvgAirbnbPrice = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT a.city, a.room_type, AVG(a.price) AS price
    FROM AirbnbMain a
    WHERE EXISTS (
      SELECT am.city
      FROM AirbnbMain am JOIN ConcertAddr ca
      ON am.city = ca.city
      WHERE am.city = a.city
    )
    GROUP BY a.city, a.room_type
    HAVING COUNT(*) > 5
    ORDER BY AVG(a.price)
    LIMIT ${limit};
  `;

  pool.query(query, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.length === 0) {
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}

// get /top_cities_on_concerts
const getCitiesBasedOnConcerts = async function (req, res) {

  const limit = parseInt(req.query.limit) || 100;

  const query = `
    SELECT ca.city, COUNT(DISTINCT c.event_id) AS concert_count
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
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}

// get /month_popularity
const getMonthPopularity = async function (req, res) {
  const artist = req.query.artist || 'Taylor Swift';

  const query = `
    SELECT ch.artist, c.month, COUNT(DISTINCT c.event_id) AS concert_count
    FROM concertmain c
    JOIN charturl ch ON c.artist  = ch.artist
    WHERE ch.artist iLIKE $1
    GROUP BY c.month, ch.artist
    ORDER BY concert_count DESC;
  `;

  pool.query(query, [`%${artist}%`], (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.rows.length === 0) {
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}

// get /events_and_accommodations
const getEventsAccomodations = async function (req, res) {

  const limit = parseInt(req.query.limit) || 10;

  /* commented out because these only need to be executed once in database
  CREATE MATERIALIZED VIEW EventCounts AS
  SELECT
    ca.city,
    c.event_subcategory,
    COUNT(c.event_id) AS event_count,
    ROW_NUMBER() OVER (
        PARTITION BY ca.city
        ORDER BY COUNT(c.event_id) DESC
    ) AS rank
  FROM concertmain c
  JOIN concertaddr ca
  ON c.formatted_address = ca.formatted_address
  GROUP BY ca.city, c.event_subcategory;
  CREATE MATERIALIZED VIEW AirbnbCount AS
  SELECT
    a.city AS city,
    COUNT(a.id) AS numAirbnb
  FROM airbnbmain a
  GROUP BY a.city;
  CREATE MATERIALIZED VIEW MostPopularEventCategory AS
  SELECT city, event_subcategory, event_count
  FROM EventCounts
  WHERE rank <= 5;
  CREATE INDEX idx_mpec_city ON MostPopularEventCategory(city);
  CREATE INDEX idx_ac_city ON AirbnbCount(city);
  */
  const query = `
    SELECT ac.city, mpec.event_subcategory, mpec.event_count, ac.numAirbnb
    FROM MostPopularEventCategory mpec
    JOIN AirbnbCount ac ON mpec.city = ac.city
    ORDER BY event_count DESC, numairbnb DESC
    LIMIT $1;
  `;

  pool.query(query, [`${limit}`], (err, data) => {
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

// get /most_improved_songs
const getMostImprovedSongs = async function (req, res) {

  const limit = parseInt(req.query.limit) || 10;

  /* commented out because these only need to be executed once in database
  CREATE INDEX idx_charturl_title ON charturl(title);
  CREATE INDEX idx_charturl_url ON charturl(url);
  CREATE INDEX idx_chartmain_url ON chartmain(url);
  
  CREATE MATERIALIZED VIEW tc AS (
      WITH TrendCounts AS (
      SELECT
          ch.title,
          COUNT(CASE WHEN c.trend = 'MOVE_UP' THEN 1 END) AS up,
          COUNT(CASE WHEN c.trend = 'MOVE_DOWN' THEN 1 END) AS down
      FROM charturl ch
      JOIN chartmain c ON ch.url = c.url
      GROUP BY ch.title
      )
      SELECT
          title,
          (COALESCE(up, 0) - COALESCE(down, 0)) AS improved
      FROM TrendCounts
      ORDER BY improved DESC
      ); 
  */
  const query = `
  SELECT title, improved FROM tc
  LIMIT $1;
  `;

  pool.query(query, [limit], (err, data) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ error: "Internal server error" });
    }
    if (data.rows.length === 0) {
      return res.status(200).json({ message: "Query did not return any results." });
    }
    return res.status(200).json(data.rows);
  });
}

// get /average_prices - WORKS
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
      return res.status(200).json({ message: "Query did not return any results." });
    }
    const formattedData = data.rows.map(row => ({
      neighborhood: row.neighborhood,
      average_price: parseFloat(row.price.toFixed(2)) // Formatting the price to two decimal places
    }));
    return res.status(200).json(formattedData);
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