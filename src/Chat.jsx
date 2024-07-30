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

    //Pour la couleur de fond de l'avatar


    const hashStringToNumber = (str) => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        return hash;
    };

    // Fonction pour générer une couleur de fond basée sur le hash de l'id utilisateur
    const getColorFromHash = (str) => {
        const hash = hashStringToNumber(str);
        const colorIndex = Math.abs(hash) % colors.length;
        return colors[colorIndex];
    };

    // Couleurs prédéfinies
    const colors = ['#FFB6C1', '#FF8C00', '#FFD700', '#ADFF2F', '#00CED1', '#1E90FF', '#9370DB'];

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
                                    <Avatar style={{ backgroundColor: getColorFromHash(user.id) }}>
                                        {user.lastName.charAt(0).toUpperCase()}
                                    </Avatar>
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
                                        <Message
                                            key={index}
                                            isCurrentUser={message.senderId === currentUserId}
                                        >
                                            <MessageContent isCurrentUser={message.senderId === currentUserId}>
                                                <p>{message.content}</p>

                                            </MessageContent>
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
    
    .username {
        font-size: 1rem;
        font-weight: bold;
        color: #fff;
    }
`;


const Avatar = styled.div`
    width: 30px;
    height: 30px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 15px;
    font-size: 1rem;
    color: white;
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
    justify-content: ${({ isCurrentUser }) => (isCurrentUser ? 'flex-end' : 'flex-start')};
    margin: 10px 0;
`;

const MessageContent = styled.div`
    display: flex;
    align-items: center;
    max-width: 60%;
    background: ${({ isCurrentUser }) => (isCurrentUser ? '#DCF8C6' : '#FFFFFF')};
    padding: 10px;
    border-radius: 15px;
    position: relative;
    &:before {
        content: '';
        position: absolute;
        top: 50%;
        ${({ isCurrentUser }) => (isCurrentUser ? 'right' : 'left')}: -10px;
        margin-top: -10px;
        border-width: 10px;
        border-style: solid;
        border-color: transparent;
        border-top-color: ${({ isCurrentUser }) => (isCurrentUser ? '#DCF8C6' : '#FFFFFF')};
        ${({ isCurrentUser }) => (isCurrentUser ? 'border-right-color' : 'border-left-color')}: transparent;
    }
    p {
        margin: 0;
        color: #333;
    }
    img {
        width: 30px;
        height: 30px;
        border-radius: 50%;
        margin-left: 10px;
    }
`;

const MessageInput = styled.div`
    display: flex;
    border-top: 1px solid #ddd;
    padding: 10px 0 0;
    input {
        flex: 1;
        border: none;
        border-radius: 20px;
        padding: 10px;
        outline: none;
        font-size: 1rem;
        background: #f1f1f1;
        margin-right: 10px;
    }
    button {
        background: #2EC4B6;
        border: none;
        border-radius: 20px;
        color: white;
        padding: 10px 20px;
        cursor: pointer;
        font-size: 1rem;
        transition: background 0.3s ease;
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
    color: #2EC4B6;
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
        color: #2EC4B6;
    }
`;

const EmptyState = styled.div`
    text-align: center;
    color: #888;
    margin-top: 20px;
`;

export default Chat;
