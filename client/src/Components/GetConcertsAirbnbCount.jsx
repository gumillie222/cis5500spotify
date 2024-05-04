import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const GetConcertsAirbnbCount = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/concerts_airbnb_count?limit=${limit}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get Concerts and Num of Surrounding Airbnbs:</h2>
            <TextField
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="set limit"
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

export default GetConcertsAirbnbCount;