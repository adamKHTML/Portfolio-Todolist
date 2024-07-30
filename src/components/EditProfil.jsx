import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, FIREBASE_AUTH } from '../firebaseConfig';
import styled from 'styled-components';
import DashNav from './DashNav';
import { Modal, Button } from 'react-bootstrap';

const EditProfile = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        job: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async (uid) => {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            }
        };

        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchUserData(user.uid);
            } else {
                navigate('/login');
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (!userData.firstName || !userData.lastName || !userData.job || !userData.email) {
            setShowModal(true);
            return;
        }

        try {
            await updateDoc(doc(db, 'users', userId), userData);
            alert('Profil mis à jour avec succès!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Erreur lors de la mise à jour du profil: ', error);
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
                <DashNav />
            </FixedNav>
            <h2>Modifier le Profil</h2>
            <StyledForm  >
                <StyledInput
                    type='text'
                    name='firstName'
                    placeholder='Prénom'
                    value={userData.firstName}
                    onChange={handleChange}
                />
                <StyledInput
                    type='text'
                    name='lastName'
                    placeholder='Nom'
                    value={userData.lastName}
                    onChange={handleChange}
                />
                <StyledInput
                    type='text'
                    name='job'
                    placeholder='Job'
                    value={userData.job}
                    onChange={handleChange}
                />
                <StyledInput
                    type='email'
                    name='email'
                    placeholder='Email'
                    value={userData.email}
                    onChange={handleChange}
                    readOnly
                />
                {loading ? (
                    <div>Loading...</div>
                ) : (
                    <StyledButton type='submit' onClick={handleSubmit}>Mettre à jour</StyledButton>
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
    top: 35px;
    left: 115px;
    width: 100%;
    z-index: 10;
   
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

export default EditProfile;
