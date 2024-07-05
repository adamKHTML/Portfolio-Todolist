import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH, db } from './firebaseConfig';
import { collection, doc, setDoc } from 'firebase/firestore';

const Register = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [job, setJob] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const auth = FIREBASE_AUTH;

    const signUp = async () => {
        setLoading(true);

        try {
            // Crée l'utilisateur dans Firebase Authentication
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user; // Utilisation de userCredential.user pour obtenir l'utilisateur créé

            // Ajoute les informations supplémentaires à Firestore avec l'UID de l'utilisateur
            await setDoc(doc(db, 'users', user.uid), {
                email: email,
                firstName: firstName,
                lastName: lastName,
                job: job
                // Ajoutez d'autres champs au besoin
            });

            console.log('Utilisateur enregistré avec succès !', user.uid);
            navigate('/Login'); // Redirige vers la page de connexion après l'inscription

        } catch (error) {
            console.error('Erreur lors de l\'inscription : ', error.message); // Affiche l'erreur spécifique
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Inscription</h2>
            <input
                type='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type='password'
                placeholder='Mot de passe'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type='text'
                placeholder='Prénom'
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                type='text'
                placeholder='Nom'
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            <input
                type='text'
                placeholder='Job'
                value={job}
                onChange={(e) => setJob(e.target.value)}
            />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <button onClick={signUp}>S'inscrire</button>
                    <Link to="/Login">Déjà inscrit ? Connectez-vous ici.</Link>
                </>
            )}
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
    }
};

export default Register;
