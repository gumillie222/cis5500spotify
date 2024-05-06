import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';
import TopCities from './Components/TopCities';
import TopArtists from './Components/TopArtists';
import GetavgPrice from './Components/GetavgPrice';
import GetavgAirbnbPrice from './Components/GetavgAirbnbPrice';
import GetAirbnb from './Components/GetAirbnb';
import Subcategories from './Components/GetSubcategories';
import ArtistsStateInitial from './Components/GetArtistsInitial';
import ConcertsAirbnbCount from './Components/GetConcertsAirbnbCount';
import CitiesConcerts from './Components/GetCitiesConcerts';
import MonthPopularity from './Components/GetMonthPopularity';
import EventsAccomodations from './Components/GetEventsAccomodations';
import MostImproved from './Components/GetMostImproved';
import { useNavigate } from "react-router-dom";

const SearchAndAutoFetch = () => {

    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/');
    }

    return (
        <div>
            <h1>SPOTBNB Queries</h1>
            <Button onClick={handleClick} >Map</Button>

            {/* Manual search fields */}
            <div>
                <TopArtists />
                <TopCities />
                <CitiesConcerts />
                <GetAirbnb />
                <Subcategories />
                <ArtistsStateInitial />
                <ConcertsAirbnbCount />
                <GetavgAirbnbPrice />
                <MonthPopularity />
                <EventsAccomodations />
                <MostImproved />
                <GetavgPrice />



            </div>

        </div>
    );
};

export default SearchAndAutoFetch;
