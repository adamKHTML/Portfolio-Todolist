import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, addDoc, query, where, Timestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, FIREBASE_AUTH } from './firebaseConfig';
import styled from 'styled-components';
import DashNav from './components/DashNav';

const Chat = () => {
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState(null);

    useEffect(() => {
        const fetchUsers = async () => {
            if (!currentUserId) return;

            setLoading(true);
            try {
                const usersCollection = await getDocs(collection(db, 'users'));
                const usersList = usersCollection.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.id !== currentUserId);
                setUsers(usersList);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, user => {
            if (user) {
                setCurrentUserId(user.uid);
                fetchUsers();
            }
        });

        return () => unsubscribe();
    }, [currentUserId]);

    const fetchMessages = async (userId) => {
        if (!currentUserId || !userId) return;

        try {
            const commentsCollection = collection(db, 'comments');
            const q = query(commentsCollection,
                where('senderId', 'in', [currentUserId, userId]),
                where('recipientId', 'in', [currentUserId, userId])
            );
            const commentsSnapshot = await getDocs(q);
            const messagesList = commentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            messagesList.sort((a, b) => a.timestamp.toMillis() - b.timestamp.toMillis());
            setMessages(messagesList);
        } catch (error) {
            console.error("Erreur lors de la récupération des messages : ", error);
        }
    };

    const selectUser = async (userId) => {
        setLoading(true);
        try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
                setSelectedUser({ id: userId, ...userDoc.data() });
                fetchMessages(userId);
            } else {
                console.error("Utilisateur non trouvé");
            }
        } catch (error) {
            console.error("Erreur lors de la sélection de l'utilisateur : ", error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async () => {
        if (newMessage.trim() === '' || !selectedUser || !currentUserId) return;

        setLoading(true);
        try {
            const newMessageData = {
                senderId: currentUserId,
                recipientId: selectedUser.id,
                content: newMessage,
                timestamp: Timestamp.now()
            };
            await addDoc(collection(db, 'comments'), newMessageData);
            setMessages(prevMessages => [...prevMessages, newMessageData]);
            setNewMessage('');
        } catch (error) {
            console.error("Erreur lors de l'envoi du message : ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <FixedNav>
                <DashNav />
            </FixedNav>

            <Container>
                <Sidebar>
                    {loading ? (
                        <Loader>
                            <p>Loading</p>
                        </Loader>
                    ) : (
                        <ul>
                            {users.map(user => (
                                <li key={user.id} onClick={() => selectUser(user.id)}>
                                    <img src={user.avatar || 'default-avatar.png'} alt={user.firstName} className="avatar" />
                                    <p className="username">{user.firstName} {user.lastName}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                </Sidebar>
                <Main>
                    {selectedUser ? (
                        <>
                            <h3>Conversation avec {selectedUser.firstName} {selectedUser.lastName}</h3>
                            <Messages>
                                {messages.length > 0 ? (
                                    messages.map((message, index) => (
                                        <Message key={index}>
                                            <p>{message.content}</p>
                                            <img src={message.senderAvatar || 'default-avatar.png'} alt="Sender Avatar" />
                                        </Message>
                                    ))
                                ) : (
                                    <EmptyState>Aucun message trouvé pour cet utilisateur.</EmptyState>
                                )}
                            </Messages>
                            <MessageInput>
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    placeholder="Écrivez un message..."
                                />
                                <button onClick={sendMessage}>Envoyer</button>
                            </MessageInput>
                        </>
                    ) : (
                        <Init>
                            <i className="fa fa-inbox"></i>
                            <h4>Sélectionnez une conversation à gauche</h4>
                        </Init>
                    )}
                </Main>
            </Container>
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

const Container = styled.div`
    display: flex;
    height: 100vh;
    background: linear-gradient(180deg, #2EC4B6, #9EB1E9);
    font-family: 'Montserrat', sans-serif;
`;

const Sidebar = styled.aside`
    width: 300px;
    background: #2EC4B6;
    border-right: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
        width: 100%;
    }
    li {
        width: 100%;
        display: flex;
        align-items: center;
        padding: 1em 2em;
        cursor: pointer;
        border-bottom: 1px solid #ccc;
        transition: background 0.3s ease;
        &:hover {
            transform: scale(1.05);
        background: linear-gradient(45deg, #51fbdc 33%, #a8fdee 33%, #a8fdee 66%, #d4fef7 66%);
        }
    }
    .avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-right: 15px;
    }
    .username {
        font-size: 1rem;
        font-weight: bold;
        color: #fff;
    }
`;

const Main = styled.main`
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
    background: #FFFFFF;
    border-top-right-radius: 8px;
    border-bottom-right-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    transform: scale(1.035);
`;

const Messages = styled.div`
    flex: 1;
    overflow-y: auto;
    margin-bottom: 10px;
    padding: 10px;
    border-radius: 8px;
    background: #F9F9F9;
`;

const Message = styled.div`
    display: flex;
    align-items: flex-start;
    background: #E1F5FE;
    margin: 10px 0;
    padding: 10px;
    border-radius: 8px;
    transition: opacity 0.45s ease-in-out;
    opacity: 1;
    p {
        font-size: 0.9em;
        color: #333;
        margin: 0;
        flex: 1;
    }
    img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-left: 10px;
    }
    &:nth-of-type(even) {
        background: #B2EBF2;
    }
`;

const MessageInput = styled.div`
    display: flex;
    align-items: center;
    border-top: 1px solid #ccc;
    padding: 10px;
    input {
        flex: 1;
        padding: 10px;
        border: none;
        outline: none;
        font-size: 1rem;
        color: #555;
        background: transparent;
    }
    button {
        padding: 10px 20px;
        font-size: 1rem;
        border: none;
        border-radius: 8px;
        background: #2EC4B6;
        color: white;
        cursor: pointer;
        transition: transform 0.3s ease, background 0.3s ease;
        &:hover {
            transform: scale(1.05);
        background: linear-gradient(45deg, #51fbdc 33%, #a8fdee 33%, #a8fdee 66%, #d4fef7 66%);
        }
    }
`;

const Init = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #888;
    i {
        font-size: 3rem;
    }
    h4 {
        margin-top: 1rem;
        font-size: 1.5rem;
    }
`;

const Loader = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    p {
        font-size: 1.2rem;
        color: #555;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    color: #888;
    margin-top: 20px;
`;

export default Chat;
