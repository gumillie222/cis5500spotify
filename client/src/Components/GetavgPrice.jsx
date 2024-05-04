import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const AvgPrice = () => {
    const [results, setResults] = useState([]);
    const [param1, setParam1] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/average_prices?limit=${param1}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get avg prices:</h2>
            <TextField
                value={param1}
                onChange={(e) => setParam1(e.target.value)}
                placeholder="Search One"
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

export default AvgPrice;