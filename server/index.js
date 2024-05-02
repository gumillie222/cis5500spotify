const bodyParser = require('body-parser');
const express = require('express');
var routes = require("./routes.js");
const cors = require('cors');

const app = express();

app.use(cors({ credentials: true, origin: 'http://localhost:3000' }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

/* ---------------------------------------------------------------- */
/* ------------------- Route handler registration ----------------- */
/* ---------------------------------------------------------------- */

app.get('/hello', routes.hello);

/* ---- (top cities) ---- */
// takes in req.query.limit (int)
app.get('/top_cities', routes.topCities);

// takes in req.query.limit (int), .position (int)
app.get('/top_artists', routes.topArtists);

// takes in req.query.price_min, .price_max, .num_reviews, .chart_rank
app.get('/airbnb', routes.getAirbnb);

// get subcategories
// takes in req.query.rank, .times, .streams, .num_airbnb, .min_price, .max_price, .min_nights
app.get('/subcategories', routes.getSubcategories);

app.get('/artists_by_state_initial', routes.getArtistsStateInitial);

app.get('/concerts_airbnb_count', routes.getConcertsAirbnbCount);

app.get('/avg_airbnb_price', routes.getAvgAirbnbPrice);

app.get('/top_cities_on_concerts', routes.getCitiesBasedOnConcerts);

app.get('/month_popularity', routes.getMonthPopularity);

app.get('/events_and_accomodations', routes.getEventsAccomodations);

app.get('/most_improved_songs', routes.getMostImprovedSongs);

app.get('/average_prices', routes.getAveragePrice);


/* ---- Part 2 (FindFriends) ---- */
// TODO: (2) - Add route '/friends/:login' for the functionality of FindFriends page 
app.get('/friends/:login', () => { }); // Hint: Replace () => {} with the appropriate route handler in routes.js.


app.listen(8081, () => {
	console.log(`Server listening on PORT 8081`);
});