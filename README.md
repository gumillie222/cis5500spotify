# cis5500spotify

## Motivation & Vision 
SpotBNB is designed to alleviate the complexities often associated with planning travel for concerts. The task of finding accommodations near event locations can be daunting, and the lack of consolidated information about concert venues, nearby lodgings, and artist details only compounds the challenge. SpotBNB addresses these issues head-on by seamlessly integrating information about concerts and accommodations into a single, user-friendly platform, where a user can find Airbnbs on our map or discover information through our search page. Our goal is to streamline the travel planning process for concert-goers, enabling them to easily access and compare concert and lodging options within the same city. This integration not only simplifies logistics but also enhances the overall experience of planning and enjoying a concert trip.

## Architecture
Our application leverages a modern tech stack to ensure robustness, scalability, and ease   of use. Below is an outline of the core technologies and a description of the system architecture:
Frontend: Developed using React, our client-side framework helps build a dynamic and responsive user interface. React's component-based architecture allows for reusable UI components, making the application efficient and consistent. We used css to create an aesthetic and on theme UI.
Backend: We used Node.js with Express for our server-side logic, providing a lightweight yet powerful solution for handling requests and integrating with external databases.
Database: We used Amazon RDS with PostgreSQL for our database.


## Directory
As for our web application, we developed 2 pages: 
#### map
To be updated as we develop
This page showcases all of the Airbnbs that are available to us in the US, as well as another search page, which allows our users to discover useful information about concerts, viral artists and accommodation(Airbnb’s) in a consolidated manner. 
For our map page, we utilized the Google Maps API to visually pinpoint the location of all of the Airbnbs, where if the user desires to see the names of these places, they can simply click on one of the pins and all of the names appear (and if they click off, they disappear). There is also a search feature where if they input a name that corresponds to an Airbnb, then the listings will continue to show as the Airbnb desired is valid. Else, no pins show up. When you click the restart button, the pins restart to its original state, which is appearing on the Google Maps with no name shown.
#### search bar
For our search page, there are numerous sections for people to input specific values into text boxes. After inputting their desired values, the results then show up below in an organized fashion, with the results tailored to their preferred settings. 

## Dataset Description
#### Spotify Charts
This dataset consists of all the songs from “Top 200” and “Viral 50” charts of Spotify since January 1, 2017. We are only looking at the songs from the “Top 200” chart, as we noted that for those in the “Viral 50”, the streams are null values – this would be problematic as streams are crucial to our work.
After pre-processing, there are 437,239 rows. This process mainly consisted of dropping rows that contained null values in “title”, “artist”, and “streams”, as we determined that these attributes were necessary for our work – thus, any null data would interfere. We also dropped unnecessary attributes that we knew we would not be using in our queries. Furthermore, we updated the date attribute to individual columns (day, month, year) for the ease of retrieving them, rather than having to parse a tuple. After that, we narrowed down the region to the US, as this would correspond to our Airbnb dataset that is only based in the US. Ultimately, we split this dataset into two tables for normalization purposes.


#### Ticketmaster
This dataset provides comprehensive information on ticketmaster.com events along with their ticket listings and prices across the United States and Canada (but we are only using the US section of the data). It contains event information, event category, location, datetime, etc.
After pre-processing, there are 20,616 rows. This is mainly due to us really narrowing down on the categories that we wanted – this dataset has information for both Canada and the US, but we only wanted to use the information based on the United States (to maintain the scope of the Airbnb dataset). Furthermore, we only used the categories that were “MUSIC”, as we found that there were then some data that was missing or insufficient if otherwise. Beyond that, we did somewhat standard cleaning through dropping null values, dropping repetitive attributes (as we also once again expanded the date into individual columns, attributes like datetime_utc became unnecessary). We eventually split into two tables for normalization.

#### Airbnb
This dataset consists of information for all of the Airbnb listings in the United States during and after the year 2023.
After pre-processing, there are 183,056 rows. This process also consisted of dropping null values, especially those in the “name” attribute as we determined this attribute to be crucial to our work. For this dataset, we also filled in null values (e.g. null values in host_name were replaced with “Unknown Host”) and dropped unnecessary attributes (such as revews_per_month) as we determined we didn’t need to use them in our queries. Again, we changed the date attribute to individual columns for the ease of retrieving, and eventually split into three tables for normalization purposes.

## Database 
<img width="637" alt="Screenshot 2024-05-06 at 8 18 23 PM" src="https://github.com/gumillie222/cis5500spotify/assets/121700352/8f4d7b57-2e25-4b5b-803a-b9ff53772a6b">

Above is an ER diagram representing our schema. Note that for many of the relationships, while in real life let’s say an Airbnb host doesn’t necessarily need to be hosting an Airbnb, for our tables, since we derived our Airbnb host table from the main Airbnb dataset where each Airbnb listing did have a host, there must then be a mandatory relationship between airbnbhost and airbnbmain since for every Airbnb we have available, it must have a host.
