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
        return (
            <div style={{ }}>
                <Typography variant='h4' style={{ textAlign: "center"}}>
                    S P O T B N B
                </Typography>
                <TextField label="Search for a concert..." 
                    variant="outlined" 
                    style={{ width: "100%"}}
                />
                <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", alignItem: "center"}}>
                    <Typography>
                        Distance: 
                    </Typography>
                    <Slider style={{ width: "75%" }} />
                </div>
                
                <div>
                        <Button variant="outlined"
                            style={{ width: "50%" }}>
                                <RestartAltIcon />
                            Reset
                        </Button>
                        <Button variant="contained"
                            style={{ width: "50%"}}>
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
                                    style={{ backgroundColor: "white", width: 100, position: 'absolute', transform: 'translate(-50%, -100%)' }}>
                                    <Typography>{concert.name}</Typography>
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
             <div style={{backgroundColor: "beige"}}>
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
]