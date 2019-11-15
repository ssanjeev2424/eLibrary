import React from 'react';
import classes from './user.css';

const user  = (props) => {
    return (
        <div className={classes.User}>
            <p>Name: {props.name}</p>
            <p>Email: {props.email}</p>
        </div>
    );
};

export default user;