import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const GetEventsAccomodations = () => {
    const [results, setResults] = useState([]);
    const [city, setCity] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/events_and_accommodations?city=${city}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get a Popular Event's Category and the Number of Events Based on City:</h2>
            <TextField
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="set city"
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

export default GetEventsAccomodations;