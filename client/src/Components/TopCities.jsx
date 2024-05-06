import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, List, ListItem } from '@mui/material';

const TopCities = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/top_cities?limit=${limit}`);
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Top Cities By Artist
                </Typography>
                <Typography>
                    Rank the cities on the number of popular artists it has hosted and list the top ones. Here, popular artists is defined as any artist that has appeared on Spotify “Top 200” charts since January 1, 2017.
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
                    Search Results:
                </Typography>

                <Box sx={{ height: 300, overflow: 'auto' }}>
                    {results.length > 0 ? (
                        <List>
                            {results.map((result, index) => (
                                <ListItem key={index}>
                                    {result.city}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>waiting for query results…</Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default TopCities;
