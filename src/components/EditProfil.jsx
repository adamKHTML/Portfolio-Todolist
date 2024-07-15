import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from './firebaseConfig';

const EditProfile = () => {
    const [userData, setUserData] = useState({
        firstName: '',
        lastName: '',
        job: '',
        email: ''
    });
    const [loading, setLoading] = useState(false);
    const [userId, setUserId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserData = async (uid) => {
            const userDoc = await getDoc(doc(db, 'users', uid));
            if (userDoc.exists()) {
                setUserData(userDoc.data());
            }
        };

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchUserData(user.uid);
            } else {
                navigate('/login'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
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

    return (
        <div style={styles.container}>
            <h2>Modifier le Profil</h2>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input
                    type='text'
                    name='firstName'
                    placeholder='Prénom'
                    value={userData.firstName}
                    onChange={handleChange}
                />
                <input
                    type='text'
                    name='lastName'
                    placeholder='Nom'
                    value={userData.lastName}
                    onChange={handleChange}
                />
                <input
                    type='text'
                    name='job'
                    placeholder='Job'
                    value={userData.job}
                    onChange={handleChange}
                />
                <input
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
                    <button type='submit'>Mettre à jour</button>
                )}
            </form>
        </div>
    );
};

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        width: '300px',
    }
};

export default EditProfile;
