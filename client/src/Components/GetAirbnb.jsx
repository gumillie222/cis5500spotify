import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const GetAirbnb = () => {
    const [results, setResults] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [numReviews, setNumReviews] = useState('');
    const [chartRank, setChartRank] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/airbnb?price_min=${priceMin}&price_max=${priceMax}&num_reviews=${numReviews}&chart_rank=${chartRank}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get Airbnbs in Cities of Top Artists:</h2>
            <TextField
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder="set minimum price"
            />
            <TextField
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder="set maximum price"
            />
            <TextField
                value={numReviews}
                onChange={(e) => setNumReviews(e.target.value)}
                placeholder="set number of reviews"
            />
            <TextField
                value={chartRank}
                onChange={(e) => setChartRank(e.target.value)}
                placeholder="set chart rank"
            />
            <Button variant="contained" onClick={search}>
                Search
            </Button>

            <div>
                <h2>Search result:</h2>
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

}

export default GetAirbnb;