
import React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';
import SearchIcon from '@mui/icons-material/Search';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import GoogleMapReact from 'google-map-react';
import PushPinIcon from '@mui/icons-material/PushPin';
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
        this.state = {
            latitude: 39.952305,
            longitude: -75.193703,
            concerts: concertData,
            selectedConcertId: null,
            markerClicked: false,
            searchText: "",
        }
    }

    

    componentDidMount = () => {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log(position.coords)
                this.setState({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    concerts: concertData,
                })
            },
            (error) => {
                console.log("Error Getting Location " + error.message)
            }
        )
    }
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
            let filteredConcerts = concertData.filter(
                g => 
                g.name.toLowerCase().includes(this.state.searchText.toLowerCase())
            &&
            (
                getDistanceFromLatLonInKm(this.state.latitude, this.state.longitude, g.latitude, g.longitude) < this.state.distance 
            )
        )
            this.setState({
                concerts: filteredConcerts
            })
        }

        const resetAll = () => {
            this.setState({
                concerts: concertData,
                distance: 40,
                searchText: ""
            })
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
                                Most Popular Cities (1)
                        </Button>
                        <Button variant="contained"
                        onClick={handleSearch}
                            style={{ backgroundColor: "#E9D6D7", width: "50%"}}>
                                Popular Airbnb's (3)
                        </Button>

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
        const handleConcertClick = (concert) => {
            window.location.replace("/concert/" + concert.id)
        }

        return (
            <div style={{ height: '100vh', width: '100%' }}>
                <GoogleMapReact
                    bootstrapURLKeys={{ key: "AIzaSyD6r04ZkeNnUTBfktdJgpFR6Y7etnhXCsQ" }}
                    defaultCenter={{ lat: 10.99835602, lng: 77.01502627 }}
                    defaultZoom={14}
                    center={{ lat: this.state.latitude, lng: this.state.longitude }}
                    onClick={() => this.setState({ selectedConcertId: null, markerClicked: false })}
                >
                    {this.state.concerts.map((concert) => (
                        <PushPinIcon 
                            key={concert.id}
                            lat={concert.latitude}
                            lng={concert.longitude}
                            onClick={(e) => {
                                e.stopPropagation(); // Prevent map click event
                                this.setState({ selectedConcertId: concert.id, markerClicked: true });
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
                                    onClick={() => {handleConcertClick(concert)}}
                                    style={{ backgroundColor: "#E9D6D7", width: 100, position: 'absolute', transform: 'translate(-50%, -100%)', padding: 10, borderRadius: 20}}>
                                    <Typography style={{textAlign: "center"}}>{concert.name}</Typography>
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })}
                    <PushPinIcon
                        color={"primary"}
                        lat={this.state.latitude}
                        lng={this.state.longitude}
                    />
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

let concertData = [
    {
        id: "1",
        name: "Nanzhou Noodles",
        latitude: 39.955513688565155,
        longitude: -75.15695542730683
    },
];

