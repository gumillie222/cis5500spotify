import React, { useState } from 'react';
import PageNavbar from './PageNavbar';
import '../style/FindFriends.css';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function FindFriends(props) {

	// State maintained by this React component is the inputted login,
	// and the list of friends of that login.
	const [login, setLogin] = useState("");
	const [foundFriends, setFoundFriends] = useState([]);

	const submitLogin = async (e) => {
		/* ---- Part 2 (FindFriends) ---- */
		// TODO: (4) - Complete the fetch for this function
		// Hint: Name of login submitted is contained in the state `login`.
		fetch("<TODO>", {
			method: "GET"
		})
			.then(res => res.json())
			.then(friendsList => {
				console.log(friendsList); //displays your JSON object in the console
				let friendsDivs = friendsList.map((friend, i) => 
					/* ---- Part 2 (FindFriends) ---- */
					// TODO: (6) - Complete the HTML for this map function
				  // TODO: (7) - Add the necessary class name to the outer div (look at FindFriends.css - which class name seems to fit the function of element?)
					<div className="">
					</div>
				);

				setFoundFriends(friendsDivs);

			})
			.catch(err => console.log(err));
	}


	return (
		<div className="Recommendations">
			<PageNavbar active="FindFriends" />

			<div className="container recommendations-container">
				<br></br>
				<div className="jumbotron findFriend-headspace">

					<div className="h5">Find Friends</div>

					<div className="input-container">
						<input type='text' placeholder="awest@gmail.com" value={login} onChange={e => setLogin(e.target.value)} id="movieName" className="login-input" />
						{/* ---- Part 2 (FindFriends) ---- */}
						{/* TODO: (5) - Edit button element below */}
						<button id="submitMovieBtn" className="submit-btn">Submit</button>

					</div>

					<div className="header-container">
						<div className="headers">
							<div className="header"><strong>Login</strong></div>
							<div className="header"><strong>Name</strong></div>
						</div>
					</div>

					<div className="results-container" id="results">
						{foundFriends}
					</div>

				</div>
			</div>
		</div>
	);
}
