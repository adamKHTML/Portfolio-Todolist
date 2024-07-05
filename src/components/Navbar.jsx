import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Navbar, Container } from 'react-bootstrap';
import { FIREBASE_AUTH } from '../firebaseConfig'
import { useNavigate } from 'react-router-dom';
import 'primeicons/primeicons.css';


const NavBar = () => {
    const [scrolled, setScrolled] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 0) {
                setScrolled(true);
            } else {
                setScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };

    }, []);

    const handleLogout = () => {
        FIREBASE_AUTH.signOut()
            .then(() => {
                navigate('/');
                console.log('Déconnexion réussie');

            })
            .catch((error) => {
                console.error('Erreur lors de la déconnexion:', error);
            });
    };


    return (
        <CustomNavbar scrolled={scrolled ? 'true' : undefined} expand="lg" fixed="top">
            <Container>
                <Link to="/admin">
                    <Navbar.Brand className={scrolled ? 'scrolled' : ''}>
                        <i className="pi pi-home" style={{ color: 'white' }}></i>



                    </Navbar.Brand>
                </Link>
                <LogoutButton onClick={handleLogout} className="logout-button">Logout</LogoutButton>
            </Container>
        </CustomNavbar>
    );
};

const CustomNavbar = styled(Navbar)`
  &&& {
    background-color: ${({ scrolled }) => (scrolled ? 'white' : '#51438f')};
    transition: background-color 0.3s ease-in-out;
  }

`;




const LogoutButton = styled.button`
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;

  &:hover {
    color: #EF476F;
  }
`;

export default NavBar;
