import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box, List, ListItem } from '@mui/material';



const GetavgAirbnbPrice = () => {
    const [results, setResults] = useState([]);
    const [limit, setLimit] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/avg_airbnb_price?limit=${limit}`);
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get Average Airbnb Price
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
                                    {JSON.stringify(result)}
                                </ListItem>
                            ))}
                        </List>
                    ) : (
                        <Typography>No results found</Typography>
                    )}
                </Box>
            </Box>
        </Container>
    );
};

export default GetavgAirbnbPrice;