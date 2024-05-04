import React from 'react';

export default class Concert extends React.Component {
    constructor(props) {
        super();
        this.state = {
            concertName: "",
        }
    }

    componentDidMount = () => {
        let concertId = window.location.href.split("/").pop()
        let selectedConcert = concertData.filter(g => g.id === concertId)[0]
        this.setState({concertName: selectedConcert.name})
        
    }

    render() {
        return (
            <div>
                <h1>
                    Airbnb: {this.state.concertName}
                </h1>
            </div>
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