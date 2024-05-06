import React, { useState } from 'react';
import axios from 'axios';
import {
    TextField, Button, Container, Typography, Box,
    Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper
} from '@mui/material';

const GetArtistsInitial = () => {
    const [results, setResults] = useState([]);
    const [prefix, setPrefix] = useState('');
    const [state, setState] = useState('');

    const search = async () => {
        const res = await axios.get(`http://localhost:8081/artists_by_state_initial?state=${state}&artistPrefix=${prefix}`);
        setResults(res.data);
    };

    return (
        <Container>
            <Box my={4}>
                <Typography variant="h4" component="h2">
                    Get Artists Performing in a State
                </Typography>
                <Typography>
                Takes in an artist’s initial letter(s) as well as a specific state, finds all of the possible names of artists and 
                their songs from the Spotify charts (in alphabetical order), and counts the number of potential Airbnb’s in the 
                cities of the given state.
                </Typography>

                <Box display="flex" flexDirection="row" gap={2} my={2} flexWrap="nowrap">
                    <TextField
                        label="Artist Prefix"
                        value={prefix}
                        onChange={(e) => setPrefix(e.target.value)}
                        fullWidth
                    />
                    <TextField
                        label="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
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
                                <TableCell>Artist Name</TableCell>
                                <TableCell>Title</TableCell>
                                <TableCell>Count</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {results.length > 0 ? (
                                results.map((result, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{result.artist}</TableCell>
                                        <TableCell>{result.title}</TableCell>
                                        <TableCell>{result.count}</TableCell>
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

export default GetArtistsInitial;
