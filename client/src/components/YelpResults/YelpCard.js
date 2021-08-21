// Yelp card to hold restaurant + event data 

import React, { useEffect } from 'react';
import M from 'materialize-css/dist/js/materialize.min.js';
import { useQuery, useMutation } from '@apollo/client';
import { GET_MY_ITINERARIES } from '../../utils/queries';
import { ADD_SAVED_ITEM } from '../../utils/mutations';
import Auth from '../../utils/auth';
import CreateModal from '../Modal/CreateModal';
import { saveIds } from '../../utils/localStorage';

const YelpCard = ( { item, allItems, savedIds, setSavedIds } ) => {

    // Init all dropdowns
    useEffect(() => {
        M.AutoInit();
    })

    // Saves `savedIds` list to localStorage 
    useEffect(() => {
        saveIds(savedIds);
    });

    // Set up query to retrieve user's itineraries
    const { data, loading } = useQuery(GET_MY_ITINERARIES);
    const userData = data?.myItineraries || {};

    // Set up mutation to add restaurant/event
    const [addItem] = useMutation(ADD_SAVED_ITEM);

    // Saves restaurant/event data to user's choice of itinerary
    const handleSaveItem = async (yelpID, itin) => {
        const item = allItems.find((item => item.yelpID === yelpID));
        
        // Checks for user authentication
        const token = Auth.loggedIn() ? Auth.getToken() : null;
        if (!token) {
            return false;
        }

        try {
            const { data } = await addItem({
                variables: {
                    yelpID: item.yelpID,
                    name: item.name,
                    image: item.image,
                    url: item.url,
                    location: item.location,
                    rating: item.rating,
                    categories: item.categories,
                    price: item.price,
                    itinName: itin
                }
            })
            setSavedIds([...savedIds, item.yelpID]);
            console.log(data);
            M.toast({html: 'Saved!'});
        } catch (error) {
            console.log(error);
        }
    }

    if (loading) {
        return <h6>LOADING...</h6>;
    }
    
    return (
        <div className="col s12 my-card">
            <div className="card">
                <div className="card-image">
                    <img src={item.image} alt="yelp restaurant/event"/>
                    <p className="my-tag">Rating: {item.rating}<br></br><em>{item.price ? `Price: ${item.price}` : ''}</em></p>
                </div>
                <div className="right-content">
                    <span className="card-title">{item.name}</span>
                    <div className="card-content my-card-text">
                    <p>{item.categories.join(", ")}
                    </p>
                    </div>
                    <div className="card-action">
                    <a id="my-link" href={item.url}>Website</a>
                    <p className="location">{item.location}</p>

                    {/* Trigger for drop down menu */}
                    {/* If item is already saved, disable the button */}
                    {Auth.loggedIn() && savedIds?.some((savedID) => savedID === item.yelpID) ? (<a className='dropdown-trigger my-drop-btn no-click' href='#!' data-target={'dropdown1' + item.yelpID}><i className="material-icons my-gray-icon">favorite</i></a>) 
                    : (<a className='dropdown-trigger my-drop-btn' href='#!' data-target={'dropdown1' + item.yelpID}><i className="material-icons my-heart-icon">favorite</i></a>)}
                    <ul id={'dropdown1' + item.yelpID} className='dropdown-content'>
                    {Auth.loggedIn() ? (
                    <>
                        <li><i className="material-icons my-heart-icon">add</i><a className="center-align modal-trigger black-text" href="#modal1">Create New Itinerary</a></li>
                        <li className="divider" tabIndex="-1"></li>
                        <p className="center-align">
                            {!userData.length ? 'You have no itineraries.' : ''}
                        </p>
                        {/* Displays each of the user's itineraries. Clicking will save the target restaurant/event to itin that was clicked on */}
                        {userData.map((itin) => {
                        return <li key={itin._id} onClick={() => {handleSaveItem(item.yelpID, itin.name)}}><p className="black-text center-align">{itin.name}</p></li>
                        })}
                    </>) 
                    : (<p>Please log in to save this.<i className="material-icons my-heart-icon">favorite</i></p>)}
                    </ul>
                    </div>
                    <CreateModal/> {/* Modal for creating new itineraries */}
                </div>
            </div>
        </div>
    )
}

export default YelpCard;
