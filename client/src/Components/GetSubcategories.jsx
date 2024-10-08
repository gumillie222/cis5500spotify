import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField, Button, Container, Typography, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';

const GetSubcategories = () => {
    const [results, setResults] = useState([]);
    const [rank, setRank] = useState('');
    const [times, setTimes] = useState('');
    const [streams, setStreams] = useState('');
    const [airbnb, setAirbnb] = useState('');
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [nightsMin, setNightsMin] = useState('');
    const [message, setMessage] = useState('Waiting for query results…');

    const search = async () => {
        try {
            const res = await axios.get(`http://localhost:8081/subcategories`, {
                params: {
                    rank,
                    times,
                    streams,
                    num_airbnb: airbnb,
                    min_price: priceMin,
                    max_price: priceMax,
                    min_nights: nightsMin,
                }
            });
            if (res.data.message) {
                setMessage(res.data.message);
                setResults([]);
            } else {
                setResults(res.data);
                setMessage('');
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            setMessage('Failed to fetch data');
            setResults([]);
        }
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get the Number of Events
                </Typography>
                <Typography>
                    Get the subcategories and count of songs fulfilling a set of criteria in this subcategory in descending order.
                </Typography>

                <Box display="flex" flexDirection="row" gap={2} my={2} flexWrap="nowrap">
                    <TextField
                        label="Lowest Rank"
                        value={rank}
                        onChange={(e) => setRank(e.target.value)}
                    />
                    <TextField
                        label="Times"
                        value={times}
                        onChange={(e) => setTimes(e.target.value)}
                    />
                    <TextField
                        label="Number of Streams"
                        value={streams}
                        onChange={(e) => setStreams(e.target.value)}
                    />
                    <TextField
                        label="Minimum Airbnbs"
                        value={airbnb}
                        onChange={(e) => setAirbnb(e.target.value)}
                    />
                    <TextField
                        label="Minimum Price"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                    />
                    <TextField
                        label="Maximum Price"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                    />
                    <TextField
                        label="Minimum Nights"
                        value={nightsMin}
                        onChange={(e) => setNightsMin(e.target.value)}
                    />
                </Box>

                <Box my={2}>
                    <Button variant="contained" color="primary" onClick={search} fullWidth>
                        Search
                    </Button>
                </Box>

                <Typography variant="h5" component="h3">
                    Search Results
                </Typography>

                <TableContainer component={Paper} sx={{ height: 400, overflow: 'auto' }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Event Subcategory</TableCell>
                                <TableCell>Count</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.length > 0 ? (
                                results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.event_subcategory}</TableCell>
                                        <TableCell>{result.count}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2}>
                                        <Typography>{message}</Typography>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};

export default GetSubcategories;
