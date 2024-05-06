import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField, Button, Container, Typography, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';

const GetConcertsAirbnbCount = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/concerts_airbnb_count?limit=${limit}`);
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get Concerts and Number of Surrounding Airbnbs
                </Typography>
                <Typography>
                    Find all concerts sorted by earliest to latest date and the number of airbnb’s in the same city.
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
                                <TableCell>Title</TableCell>
                                <TableCell>Day</TableCell>
                                <TableCell>Month</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell>Number of Airbnbs</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.length > 0 ? (
                                results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.title}</TableCell>
                                        <TableCell>{result.day}</TableCell>
                                        <TableCell>{result.month}</TableCell>
                                        <TableCell>{result.year}</TableCell>
                                        <TableCell>{result.num}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6}>
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

export default GetConcertsAirbnbCount;
