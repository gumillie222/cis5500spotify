import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper } from '@mui/material';

//{"neighborhood":"West Compton","average_price":11354.38}

const AvgPrice = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/average_prices?limit=${limit}`);
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get Average Price by Neighborhood
                </Typography>
                <Typography>
                    Rank all the neighborhoods with descending average prices for airbnbs.
                </Typography>
                <Box my={2}>
                    <TextField
                        label="Set Number of Results"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
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
                                <TableCell>Neighborhood</TableCell>
                                <TableCell>Average Price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.length > 0 ? (
                                results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.neighborhood}</TableCell>
                                        <TableCell>{result.average_price}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={2}>
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

}

export default AvgPrice;