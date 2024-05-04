import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const GetMostImproved = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/most_improved_songs?limit=${limit}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get the Most Improved Songs:</h2>
            <TextField
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="set number of results"
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

export default GetMostImproved;