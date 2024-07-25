import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Navbar, Container } from 'react-bootstrap';

const DashNav = () => {
  return (
    <CustomNavbar expand="lg" fixed="top">
      <CustomContainer>
        <Link to="/Dashboard">
          <SidebarBrand>
            <i className="pi pi-angle-double-left"></i>
          </SidebarBrand>
        </Link>
        <CustomLogo>
          Pronote
        </CustomLogo>
      </CustomContainer>
    </CustomNavbar>
  );
};

const CustomNavbar = styled(Navbar)`
  &&& {
    background-color: transparent;
    color: white;
  }
`;

const CustomLogo = styled.div`
  width: 100px;
  height: auto;
  margin: auto;
  display: block;
  font-size: 2em;
  margin-left: 86%; /* Augmenter la valeur pour plus d'espace */
`;

const CustomContainer = styled(Container)`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const SidebarBrand = styled(Navbar.Brand)`
  display: flex;
  align-items: center;
  font-size: 18px;
  color: #708090;
  

  &:hover {
    color: #EF476F;
   
  }

  i {
    transition: transform 0.3s ease-in-out;
  }

  &:hover i {
    transform: scale(2); 
  }

  a {
    color: inherit;
    text-decoration: none;
  }
`;

export default DashNav;
