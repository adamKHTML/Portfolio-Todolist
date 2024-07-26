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
            if (!currentUserId) return; // Only fetch users if currentUserId is available

            setLoading(true);
            try {
                const usersCollection = await getDocs(collection(db, 'users'));
                const usersList = usersCollection.docs
                    .map(doc => ({ id: doc.id, ...doc.data() }))
                    .filter(user => user.id !== currentUserId); // Exclude current user
                setUsers(usersList);
            } catch (error) {
                console.error("Erreur lors de la récupération des utilisateurs : ", error);
            } finally {
                setLoading(false);
            }
        };

        // Set up auth state change listener
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, user => {
            if (user) {
                setCurrentUserId(user.uid);
                fetchUsers(); // Fetch the users once the current user is known
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

            // Log the results of the query
            console.log('Comments Snapshot:', commentsSnapshot.docs.map(doc => doc.data()));

            const messagesList = commentsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Sort messages by timestamp to ensure the conversation is displayed in chronological order
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
                        <div>Chargement...</div>
                    ) : (
                        <ul>
                            {users.map(user => (
                                <li key={user.id} onClick={() => selectUser(user.id)}>
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
    background: #f0f0f0;
`;

const Sidebar = styled.aside`
    width: 300px;
    background: #fff;
    border-right: 1px solid #ccc;
    ul {
        list-style: none;
        padding: 0;
        margin: 0;
    }
    li {
        padding: 1em;
        cursor: pointer;
        border-bottom: 1px solid #eee;
        &:hover {
            background: #f9f9f9;
        }
    }
    .username {
        font-size: 1rem;
        font-weight: bold;
    }
`;

const Main = styled.main`
    flex: 1;
    padding: 20px;
    display: flex;
    flex-direction: column;
`;

const Messages = styled.div`
    flex: 1;
    overflow-y: auto;
    margin-bottom: 10px;
`;

const Message = styled.div`
    background: #e1f5fe;
    margin: 10px 0;
    padding: 10px;
    border-radius: 5px;
    word-wrap: break-word;
`;

const MessageInput = styled.div`
    display: flex;
    input {
        flex: 1;
        padding: 10px;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
        margin-right: 10px;
    }
    button {
        padding: 10px 20px;
        font-size: 1rem;
        border: none;
        border-radius: 5px;
        background: #4b548a;
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
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    h4 {
        color: #888;
    }
`;

const EmptyState = styled.div`
    color: #888;
    font-size: 1.2em;
`;

export default Chat;
