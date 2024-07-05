// src/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_AUTH } from './firebaseConfig';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();


    const auth = FIREBASE_AUTH;

    const signIn = async () => {
        setLoading(true);

        try {
            const response = await signInWithEmailAndPassword(auth, email, password);
            console.log(response);
            navigate('/Dashboard'); // Rediriger vers la page d'accueil après la connexion réussie
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <h2>Connexion</h2>
            <input
                type='email'
                placeholder='Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type='password'
                placeholder='Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            {loading ? (
                <div>Loading...</div>
            ) : (
                <>
                    <button onClick={signIn}>Connexion</button>
                    <Link to="/register">S'inscrire</Link>
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

export default Login;
