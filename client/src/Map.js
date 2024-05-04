import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import GoogleMapReact from 'google-map-react';
import PushPinIcon from '@mui/icons-material/PushPin';
import axios from "axios"
import {
    setKey,
    setDefaults,
    setLanguage,
    setRegion,
    fromAddress,
    fromLatLng,
    fromPlaceId,
    setLocationType,
    geocode,
    RequestType,
  } from "react-geocode";

  

  setDefaults({
    key: "AIzaSyD6r04ZkeNnUTBfktdJgpFR6Y7etnhXCsQ", // Your API key here.
    language: "en", // Default language for responses.
    region: "es", // Default region for responses.
  });

  fromAddress("Eiffel Tower")
  .then(({ results }) => {
    const { lat, lng } = results[0].geometry.location;
    console.log(lat, lng);
  })
  .catch(console.error);


export default class Map extends React.Component {


    constructor(props) {
        super();
        const res = axios.get("http://localhost:8081/latitudelongitude")
        this.state = {
            latitude: 39.952305,
            longitude: -75.193703,
            concerts: [],
            selectedConcertId: null,
            markerClicked: false,
            searchText: "",
        }
    }

   handlePinClick = (concert) => {
        // Toggle: if the same concert is clicked again, close its details; otherwise, open the clicked concert's details.
        const selectedId = this.state.selectedConcertId === concert.id ? null : concert.id;
        this.setState({ selectedConcertId: selectedId });
    }
      

    

    componentDidMount = async () => {
        try {
            const response = await axios.get("http://localhost:8081/latitudelongitude");
            this.setState({
                concerts: response.data
            });
        } catch (error) {
            console.error('Failed to fetch concerts:', error);
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => {
                console.error("Geolocation error:", error);
            }
        );
    };
    
    header = () => {
        const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
            const deg2rad = (deg) => { return deg * (Math.PI / 180) }
            var R = 6371; // Radius of the earth in km
            var dLat = deg2rad(lat2 - lat1);
            var dLon = deg2rad(lon2 - lon1);
            var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d;
        }
        
        const handleSearch = () => {
            axios.get("http://localhost:8081/latitudelongitude")
                .then(response => {
                    const filteredConcerts = response.data.filter(
                        g => g.name.toLowerCase().includes(this.state.searchText.toLowerCase())
                            && this.getDistanceFromLatLonInKm(this.state.latitude, this.state.longitude, g.latitude, g.longitude) < this.state.distance
                    );
                    this.setState({ concerts: filteredConcerts });
                })
                .catch(error => console.log("Error filtering concerts: " + error.message));
            
        }

        

        const resetAll = () => {
            axios.get("http://localhost:8081/latitudelongitude")
                .then(response => {
                    this.setState({
                        concerts: response.data,
                        distance: 40,
                        searchText: ""
                    });
                })
                .catch(error => console.log("Error resetting data: " + error.message));
        }

        
        return (
            <div style={{ marginBottom: 10 }}>
                <Typography variant='h4' style={{ textAlign: "center"}}>
                    S P O T B N B
                </Typography>
                <TextField label="Search for a AirBnb..." 
                    variant="outlined" 
                    value={this.state.searchText}
                    style={{ width: "100%"}}
                    onChange={(event) => {this.setState({ searchText: event.target.value })}}
                />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItem: "center"}}>
                    <Typography>
                        Distance: 
                    </Typography>
                    <Slider style={{ width: "75%" }} 
                        value={this.state.distance}
                        valueLabelDisplay='auto'
                        step={10}
                        marks
                        min={0}
                        max={50}
                        onChange={(event, value) => this.setState({distance: value})}
                    
                    
                    />
                </div>

                
                <div>
                        <Button variant="contained"
                                onClick={resetAll}
                            style={{ backgroundColor: "#E9D6D7", width: "50%" }}>
                                <RestartAltIcon />
                            Reset
                        </Button>
                        <Button variant="contained"
                        onClick={handleSearch}
                            style={{ backgroundColor: "#E9D6D7", width: "50%"}}>
                                <SearchIcon />
                            Search
                        </Button>

                </div>
            </div>
        )
    }

    map = () => {
        
        
        return (
            <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyD6r04ZkeNnUTBfktdJgpFR6Y7etnhXCsQ" }}
                    defaultCenter={{ lat: 10.99835602, lng: 77.01502627 }}
                    defaultZoom={14}
                    center={{ lat: this.state.latitude, lng: this.state.longitude }}
                    onClick={() => this.setState({ selectedConcertId: null })}
                >
                    {this.state.concerts.map((concert) => (
                        <PushPinIcon 
                            key={concert.id}
                            lat={concert.latitude}
                            lng={concert.longitude}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent map click event from propagating
                                this.handlePinClick(concert);
                            }}
                        />
                    ))}
                    {this.state.concerts.map((concert) => {
                        if (this.state.selectedConcertId === concert.id) {
                            return (
                                <div 
                                    key={"info-" + concert.id}
                                    lat={concert.latitude}
                                    lng={concert.longitude}
                                    style={{ backgroundColor: "#E9D6D7", width: 100, position: 'absolute', transform: 'translate(-50%, -100%)', padding: 10, borderRadius: 20}}>
                                    <Typography style={{textAlign: "center"}}>{concert.name}</Typography>
                                </div>
                            );
                        }
                        return null;
                    })}
                </GoogleMapReact>
            </div>
        );
    }
    

    render() {
        return (
            <>
             <div style={{backgroundColor: "#F5C3C2"}}>
                {this.header()}
                {this.map()}
                
            </div>
            </>
           
        )
    }
}

