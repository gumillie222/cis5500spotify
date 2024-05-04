import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button } from '@mui/material';


const GetArtistsInitial = () => {
    const [results, setResults] = useState([]);
    const [prefix, setPrefix] = useState('');
    const [state, setState] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/artists_by_state_initial?state=${state}&prefix=${prefix}`);
        setResults(res.data);
    };

    return (
        <div>
            <h2>Get Artists Performing in a State:</h2>
            <TextField
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="set prefix of artist"
            />
            <TextField
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="set state"
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

export default GetArtistsInitial;