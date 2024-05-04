import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const GetSubcaategories = () => {
    const [results, setResults] = useState([]);
    const [rank, setRank] = useState('');
    const [times, setTimes] = useState('');
    const [streams, setStreams] = useState('');
    const [airbnb, setAirbnb] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [nightsMin, setnightsMin] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/subcategories?rank=${rank}&times=${times}&streams=${streams}&num_airbnb=${airbnb}&min_price=${priceMin}&max_price=${priceMax}&min_nights=${nightsMin}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Gets the number of events: </h2>
            <TextField
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="set lowest rank"
            />
            <TextField
                value={times}
                onChange={(e) => setTimes(e.target.value)}
                placeholder="set times"
            />
            <TextField
                value={streams}
                onChange={(e) => setStreams(e.target.value)}
                placeholder="set number of streams"
            />
            <TextField
                value={airbnb}
                onChange={(e) => setAirbnb(e.target.value)}
                placeholder="set min airbnbs"
            />
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
                value={nightsMin}
                onChange={(e) => setnightsMin(e.target.value)}
                placeholder="set min nights"
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

export default GetSubcaategories;