var config = require('./db-config.js');
var mysql = require('mysql');

config.connectionLimit = 10;
var connection = mysql.createPool(config);

const { searchSpotifyForArtistByTitle } = require('./spotify-auth');

// First, create the index
/*connection.query('CREATE INDEX idx_chart_rank ON Chart_small(chart_rank);', (err, result) => {
  if (err) {
    console.error('Error creating index:', err);
    return;
  }
  console.log('Index created successfully')});*/

// Create a new column on concert to contain the artist name
connection.query('ALTER TABLE Concert ADD COLUMN artist VARCHAR(255);')
connection.query(`SELECT title FROM Concert 
                WHERE artist IS NULL AND event_category = "MUSIC"`, async (err, results) => {
  if (err) {
    console.error('Error fetching titles:', err);
    return;
  }
  for (let result of results) {
    const artistName = await searchSpotifyForArtistByTitle(result.title);
    if (artistName) {
      connection.query(`
        UPDATE Concert SET artist = ? WHERE title = ?
        `, [artistName, result.title], (err, updateResults) => {
        if (err) {
          console.error('Error updating artist:', err);
        } else {
          console.log(`Updated artist for title ${result.title}: ${artistName}`);
        }
      });
    }
  }
});

/* -------------------------------------------------- */
/* ------------------- Route Handlers --------------- */
/* -------------------------------------------------- */

//get /hello
const hello = async function (req, res) {
  return res.status(200).json({ message: 'Connection is successful!' });
}

// get /concert_artist
const concertArtist = async function (req, res) {
  connection.query(`
  SELECT c.title, ch.artist
  FROM Concert c
  JOIN Chart_small ch ON c.title LIKE CONCAT('%', ch.artist, '%')
`, (err, data) => {
    if (err || data.length === 0) {
      console.log(err);
      res.json({});
    } else {
      res.json(data);
    }
  });
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
/*
// get /top_cities
const topCities = async function (req, res) {
  const limit = parseInt(req.query.limit);
  if (isNaN(limit) || limit < 1) {
    return res.status(400).send('Invalid limit parameter');
  }

  try {
    // Suppose you have an artist name in query params
    const artist = await searchSpotifyForArtist(req.query.artist);
    if (!artist) {
      return res.status(404).send('Artist not found');
    }

    connection.query(`
      SELECT c.city
      FROM Concert c
      WHERE c.artist_id = ?
      GROUP BY c.city
      ORDER BY COUNT(*) DESC
      LIMIT ?
    `, [artist.id, limit], (err, data) => {
      if (err || data.length === 0) {
        console.error(err);
        res.json({});
      } else {
        res.json(data);
      }
    });

  } catch (error) {
    console.error('Failed to search for artist:', error);
    res.status(500).send('Internal server error');
  }
};
*/

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
  CREATE INDEX idx_chart_rank ON Chart_small(chart_rank);
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




// The exported functions, which can be accessed in index.js.
module.exports = {
  topCities,
  topArtists,
  getAirbnb,
  hello
}