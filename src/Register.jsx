import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, db } from './firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import styled from 'styled-components';
import HomeNav from './components/HomeNav';
import { Modal, Button } from 'react-bootstrap';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [job, setJob] = useState('');
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    const auth = FIREBASE_AUTH;


    // Création Utilisateurs - Ajoute les informations supplémentaires à Firestore avec l'UID de l'utilisateur
    const signUp = async () => {
        setLoading(true);

        if (!firstName || !lastName || !job || !email) {
            setShowModal(true);
            return;
        }

        try {

            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;


            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                firstName: firstName,
                lastName: lastName,
                job: job

            });

            console.log('Utilisateur enregistré avec succès !', user.uid);
            navigate('/Login');

        } catch (error) {
            console.error('Erreur lors de l\'inscription : ', error.message);
        } finally {
            setLoading(false);
        }
    };
    const handleClose = () => {
        setShowModal(false);
        window.location.reload();
    };
    return (
        <>
            <FixedNav>
                <HomeNav />
            </FixedNav>
            <StyledForm>
                <h2>Inscription</h2>
                <StyledInput
                    type='email'
                    placeholder='Email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <StyledInput
                    type='password'
                    placeholder='Mot de passe'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <StyledInput
                    type='text'
                    placeholder='Prénom'
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                />
                <StyledInput
                    type='text'
                    placeholder='Nom'
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                />
                <StyledInput
                    type='text'
                    placeholder='Job'
                    value={job}
                    onChange={(e) => setJob(e.target.value)}
                />
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <>
                        <StyledButton onClick={signUp}>S'inscrire</StyledButton>
                        <Link to="/Login">Déjà inscrit ? Connectez-vous ici.</Link>
                    </>
                )}
                <Modal show={showModal} onHide={handleClose}>
                    <Modal.Header closeButton>
                        <Modal.Title>Incomplete Form</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        Veuillez remplir tous les champs avant de soumettre le formulaire.
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                    </Modal.Footer>
                </Modal>
            </StyledForm>

        </>
    );
};

const FixedNav = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 10;
    transition: transform 0.3s ease, background 0.3s ease;
    &:hover {
       
        background: #201d30 ;
        color : white !important;
    }

`;


const StyledForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    padding: 60px 40px 40px 40px ;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid #201d30;
    position: relative;
    margin: 170px;


    h2 {
        margin-bottom: 20px;
    }

    a {
        margin-top: 15px;
        color: #4b548a;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    &::before,
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 20px;
        right: 20px;
        height: 2px;
        background: #201d30;
    }

    &::after {
        top: auto;
        bottom: 0;
    }
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    box-sizing: border-box;
    font-size: 1rem;
    

    &:focus {
        border-color: #4b548a;
        outline: none;
    }

    &::placeholder {
        color: #bbb;
    }

   
`;

const StyledButton = styled.button`
    padding: 10px 20px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    background: #4b548a;
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease, background 0.3s ease;
    margin: 10px 0;

    &:hover {
        transform: scale(1.05);
        background: linear-gradient(45deg, #51fbdc 33%, #a8fdee 33%, #a8fdee 66%, #d4fef7 66%);
    }
`;

export default Register;
