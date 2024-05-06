import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField, Button, Container, Typography, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';

const GetEventsAccommodations = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState();

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/events_and_accommodations`, {
            params: { limit },
        });
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get a Popular Event's Category and the Number of Events and Accomodations Based on City
                </Typography>

                <Box display="flex" flexDirection="row" gap={2} my={2} flexWrap="nowrap">
                    <TextField
                        label="Set Limit"
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
                                <TableCell>City</TableCell>
                                <TableCell>Event Category</TableCell>
                                <TableCell>Number of Events</TableCell>
                                <TableCell>Number of Accommodations</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.length > 0 ? (
                                results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.city}</TableCell>
                                        <TableCell>{result.event_subcategory}</TableCell>
                                        <TableCell>{result.event_count}</TableCell>
                                        <TableCell>{result.numairbnb}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3}>
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

export default GetEventsAccommodations;

