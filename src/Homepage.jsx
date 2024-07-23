import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import BackgroundImg from '/img/BackgroundImg.jpeg';
import Carrousel from './components/Carroussel';
import HomeNav from './components/HomeNav';

const Homepage = () => {
    return (
        <>
            <Header>
                <HomeNav />
                <HeaderContent>
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
                </HeaderContent>
            </Header>

            <MainContent>
                <div className='Section' style={{ marginRight: '330px' }}>
                    <Explanation>
                        <h2>Mais qu'est donc Pronote ?</h2>
                        <p>Pronote est une application dédiée à la gestion de tâches, conçue pour vous aider à organiser votre travail, suivre vos progrès et rester productif. Grâce à des fonctionnalités intuitives et une interface utilisateur conviviale, Pronote facilite la gestion quotidienne de vos tâches et projets.</p>
                    </Explanation>
                </div>

                <Carrousel />
            </MainContent>
        </>
    );
}

export default Homepage;

const Header = styled.div`
    position: absolute; /* Positionne le Header par rapport à la fenêtre */
    top: 0;
    left: 0;
    width: 100vw; /* Prend toute la largeur de la fenêtre */
    height: 700px; /* Hauteur fixe ou ajustable */
    background-image: url(${BackgroundImg});
    background-size: cover; 
    background-position: center;
    background-repeat: no-repeat; 
    color: #fff;
    overflow: hidden; /* Cache le contenu qui dépasse */
    z-index: 1; /* Assure que le Header est au-dessus des autres éléments */
`;

const HeaderContent = styled.div`
    position: relative; /* Contenu du Header positionné relativement */
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0 20px; /* Padding pour éviter le chevauchement du texte avec les bords */
    box-sizing: border-box;
`;

const MainContent = styled.div`
    position: relative; /* Positionne le MainContent par rapport au flux normal */
    padding-top: 700px; /* Pousse le contenu en dessous du Header, ajusté selon la hauteur du Header */
`;

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
`;
