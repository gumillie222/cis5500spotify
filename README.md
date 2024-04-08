# cis5500spotify

## Motivation & Vision 
When finding concerts, oftentimes finding accommodation nearby can be time-consuming. We thus seek to ease this process in our application by showing the concerts and Airbnbs in the same city specifically in 2020. Our users can then search up these concerts + Airbnbs either by city through an interactive map or by searching up the artist’s name and city.

When a user clicks a city on a provided interactive map of the United States, our application will be able to provide concerts performed by artists that have ranked on a Spotify Top 200 Chart in 2020 as well as nearby Airbnb listings and some information about these. Furthermore, each concert will include a short description of the artist based on their highest-ranking songs (e.g. “You may know this artist from their song <insert song here>”). Similarly, if the user chooses to search up an artist as well as a city, then if there is a concert by that artist in the provided city, a list of Airbnbs will be given (else, a message will appear.)

## Dataset Description
#### Spotify Charts
This dataset consists of all the songs from “Top 200” and “Viral 50” charts of spotify since January 1, 2017. After cleaning, we only consider the charts in regions 'U.S.' considering the scope of Ticketmaster dataset and the Airbnb dataset. Attributes include title, rank, date, artist, url, region, chart, trend, and streams.

#### Ticketmaster
This dataset provides comprehensive information on ticketmaster.com events along with their ticket listings and prices across the United States and Canada (but we are only using the US section of the data). Attributes include event_url, event_id, event_category, event_subcategory, title, datetime_utc, datetime_local, name, address, city, state, country, postal_code, formatted_address

#### Airbnb
This dataset provides data on Airbnb information in the US, compiled in 2023. Its attributes include host id, hostname, listing id, listing name, latitude and longitude of listing, the neighborhood, price, room type, minimum number of nights, number of reviews, last review date, reviews per month, availability, host listings and city.


## Directory
#### home
To be updated as we develop

#### map
To be updated as we develop