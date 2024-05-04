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
import {useNavigate} from "react-router-dom";

const SearchAndAutoFetch = () => {
    const [autoFetchedData, setAutoFetchedData] = useState(null);
    const [oneResults, setOneResults] = useState([]);
    const [results, setResults] = useState([]);
    const [one, setOne] = useState('');
    const [two, setTwo] = useState('');
    const [three, setThree] = useState('');

    // Automatically fetch data on component load
    useEffect(() => {
        const fetchAutoData = async () => {
            try {
                const response = await axios.get('http://localhost:8081/hello');
                setAutoFetchedData(response.data);
            } catch (error) {
                console.error('Error fetching automatic data:', error);
            }
        };
        fetchAutoData();


    }, []);

    // Manual search functions
    const searchOne = async () => {
        const res = await axios.get(`http://localhost:8081/top_cities?limit=${one}`, { params: { query: one } });
        setOneResults(res.data);
    };

    const searchTwo = async () => {
        const res = await axios.get(`http://localhost:8081/searchTwo`, { params: { query: two } });
        setResults(res.data);
    };

    const searchThree = async () => {
        const res = await axios.get(`http://localhost:8081/searchThree`, { params: { query: three } });
        setResults(res.data);
    };

    const navigate = useNavigate();
    const handleClick = () => {
        navigate('/');
    }

    

    return (
        <div>
            <h1>SPOTBNB Queries</h1>
            <Button onClick={handleClick} >Map</Button>


            {/* Display automatically fetched data */}
            <div>
                <h2>Queries without parameters</h2>
                {autoFetchedData ? (
                    <div>{JSON.stringify(autoFetchedData)}</div>
                ) : (
                    <div>Loading automatic data...</div>
                )}
            </div>

            {/* Manual search fields */}
            <div>
                <TopCities />
                
                <TopArtists />
                <GetAirbnb />
                <Subcategories />
                <ArtistsStateInitial />
                <ConcertsAirbnbCount />
                <GetavgAirbnbPrice />
                <CitiesConcerts />
                <MonthPopularity />
                <EventsAccomodations />
                <MostImproved />
                <GetavgPrice />
                

                <TextField
                    value={two}
                    onChange={(e) => setTwo(e.target.value)}
                    placeholder="Search Two"
                />
                <Button variant="contained" onClick={searchTwo}>
                    Search Two
                </Button>

                <TextField
                    value={three}
                    onChange={(e) => setThree(e.target.value)}
                    placeholder="Search Three"
                />
                <Button variant="contained" onClick={searchThree}>
                    Search Three
                </Button>
            </div>

            {/* Display results from manual searches */}
            <div>
                <h2>Manual Search Results:</h2>
                {results.length > 0 ? (
                    <ul>
                        {results.map((result, index) => (
                            <li key={index}>{JSON.stringify(result)}</li>
                        ))}
                    </ul>
                ) : (
                    <p>No results found</p>
                )}
            </div>
        </div>
    );
};

export default SearchAndAutoFetch;
