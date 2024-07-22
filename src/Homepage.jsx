import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import Carrousel from './components/Carroussel';

const Homepage = () => {
    return (
        <>
            <Header>
                <h1>Pronote</h1>
                <p>Gérez vos tâches, suivez vos progrès</p>



                <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <Link to="/Login" style={{ textDecoration: 'none' }}>
                        <StyledButton>
                            Connexion
                        </StyledButton>
                    </Link>
                    <Link to="/register" style={{ textDecoration: 'none' }}>
                        <StyledButton>
                            Inscription
                        </StyledButton>
                    </Link>
                </div>

            </Header>
            <div className='Section' style={{ marginRight: '330px' }}>
                <Explanation>
                    <h2>Mais qu'est donc Pronote ? </h2>
                    <p>Pronote est une application dédiée à la gestion de tâches, conçue pour vous aider à organiser votre travail, suivre vos progrès et rester productif. Grâce à des fonctionnalités intuitives et une interface utilisateur conviviale, Pronote facilite la gestion quotidienne de vos tâches et projets.</p>
                </Explanation>
            </div>


            <Carrousel />
        </>

    )
}

export default Homepage

const Header = styled.div`

text-align: center;

`

const StyledButton = styled.button`
  padding: 10px 20px;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  background: #4b548a;
  cursor: pointer;
  transition: transform 0.3s ease, background 0.3s ease;
  margin: 0 10px;

  &:hover {
    transform: scale(1.1);
    background: linear-gradient(45deg, #51fbdc 33%, #a8fdee 33%, #a8fdee 66%, #d4fef7 66%);
  }
`;

const Explanation = styled.div`
  max-width: 800px;
  margin: 50px auto;
  padding: 20px;
  background-color : #fff; 
  border: 1px solid #ddd;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

  h2 {
    margin-bottom: 20px;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
  }

`