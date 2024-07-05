import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Homepage = () => {
    return (
        <>
            <h1>Homepage</h1>

            <Link to="/Login" style={{ textDecoration: 'none' }}>
                <button>
                    Login
                </button>
            </Link>
        </>

    )
}

export default Homepage
