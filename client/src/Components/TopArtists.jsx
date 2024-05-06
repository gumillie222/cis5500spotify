import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, List, ListItem } from '@mui/material';

const TopArtists = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');
    const [pos, setPos] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/top_artists?limit=${limit}&position=${pos}`);
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get Top Artists
                </Typography>
                <Typography>
                Rank the top artists who have been in top specified ranks of Spotify’s “Top 200” chart with the highest cumulative streams.
                </Typography>

                <Box display="flex" flexDirection="row" gap={2} my={2}>
                    <TextField
                        label="Set Number of Results"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="Set Maximum Ranking"
                        value={pos}
                        onChange={(e) => setPos(e.target.value)}
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
                                    {result.artist}
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

export default TopArtists;
