import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Navbar, Container } from 'react-bootstrap';



//Il s'agit de la navbar - Header de mes pages 

const HomeNav = () => {
  const [scrolled, setScrolled] = useState(false);

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

  return (

    <CustomNavbar scrolled={scrolled ? 'true' : undefined} expand="lg" fixed="top">
      <CustomContainer>
        <CustomNavbarBrand scrolled={scrolled ? 'true' : undefined}>
          {scrolled ? (
            <Link to="/">Home</Link>
          ) : (
            <Link to="/"><span>Home</span></Link>
          )}
        </CustomNavbarBrand>
        <CustomLogo src="#" alt="Dev Logo SVG" />

      </CustomContainer>
    </CustomNavbar>

  );

};



const CustomNavbar = styled(Navbar)`
  &&& {
    background-color: ${({ scrolled }) => (scrolled ? '#201d30' : 'transparent')};
    transition: background-color 0.3s ease-in-out; 
    color :  ${({ scrolled }) => (scrolled ? ' white' : '#201d30')};
    
  }
`;

const CustomLogo = styled.img`
   width: 100px;  
  height: auto;
  margin: auto;   
  display: block; 
`;

const CustomContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
`;


const CustomNavbarBrand = styled(Navbar.Brand)`
 
  display: inline-block;
  position: relative;
  transition: color 0.3s ease-in-out;

  &:after {
    content: '';
    position: absolute;
    width: 100%;
    transform: scaleX(0);
    height: 2px;
    bottom: 0;
    left: 0;
    background-color: #EF476F;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  }

  &:hover {
    color: #EF476F;
  }

  &:hover::after {
    transform: scaleX(1);
    transform-origin: bottom left;
  }

  
  a {
    color: inherit;
    text-decoration: none;
  }
`;



export default HomeNav;
