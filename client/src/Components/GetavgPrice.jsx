import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const AvgPrice = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/average_prices?limit=${limit}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get avg prices:</h2>
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
                    <p>Waiting for query result...</p>
                )}
            </div>
        </div>


    );

}

export default AvgPrice;