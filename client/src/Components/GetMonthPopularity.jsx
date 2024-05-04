import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const GetMonthPopularity = () => {
    const [results, setResults] = useState([]);
    const [artist, setArtist] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/month_popularity?artist=${artist}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get the Number of Concerts per Month for an Artist:</h2>
            <TextField
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                placeholder="set artist name"
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

export default GetMonthPopularity;