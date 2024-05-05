import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField, Button, Container, Typography, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';

const GetAirbnb = () => {
    const [results, setResults] = useState([]);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [numReviews, setNumReviews] = useState('');
    const [chartRank, setChartRank] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/airbnb`, {
            params: {
                price_min: priceMin,
                price_max: priceMax,
                num_reviews: numReviews,
                chart_rank: chartRank,
            }
        });
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get Airbnbs in Cities Where Top Artists Have Performed
                </Typography>

                <Box display="flex" flexDirection="row" gap={2} my={2}>
                    <TextField
                        label="Minimum Price"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Maximum Price"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Number of Reviews"
                        value={numReviews}
                        onChange={(e) => setNumReviews(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Chart Rank"
                        value={chartRank}
                        onChange={(e) => setChartRank(e.target.value)}
                        fullWidth
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
                                <TableCell>Airbnb Listing Name</TableCell>
                                <TableCell>City</TableCell>
                                <TableCell>Price</TableCell>
                                <TableCell>Concert Title</TableCell>
                                <TableCell>Concert Artist</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.length > 0 ? (
                                results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.name}</TableCell>
                                        <TableCell>{result.city}</TableCell>
                                        <TableCell>{result.price}</TableCell>
                                        <TableCell>{result.title}</TableCell>
                                        <TableCell>{result.artist}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4}>
                                        <Typography>waiting for query results…</Typography>
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

export default GetAirbnb;
