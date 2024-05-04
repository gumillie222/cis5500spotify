import React, { useState } from 'react';
import axios from "axios"
import { TextField} from '@mui/material';

const SearchBar = () => {
    const [results, setResults] = useState([]);
    const [text, setText] = useState('');
    const [one, setOne] = useState('');
    const [two, setTwo] = useState('');
    const [three, setThree] = useState('');

    return (
        <div>
            <h1>
                <input
                    value={text}
                    onChange={(e) => {
                        setText(e.currentTarget.value)
                    }} />
                <button onClick={async () => {
                   const res = await axios.get("(backend stuff)")
                   console.log(res.data)
                   setResults(res.data)
                }}>
                    Search
                </button>
            </h1>
            <div>
            <TextField
                placeholder="One"
                onChange={(event) => {setOne(event.target.value)}}
            />

            <TextField
                placeholder="Two"
                onChange={(event) => {setTwo(event.target.value)}}
            />

            <TextField
                placeholder="Three"
                onChange={(event) => {setThree(event.target.value)}}
            />

                {JSON.stringify(results)}
            </div>
        </div>
    )
}

export default SearchBar