import React, { useState, useEffect } from 'react';
import { createGlobalStyle, styled } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Message from './components/Message';
import 'primeicons/primeicons.css';


const Dashboard = () => {
    const [tasks, setTasks] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user) {
                console.log("User logged in:", user.uid);
                setCurrentUser(user);
                fetchTasks(user.uid);
            } else {
                console.log("No user logged in");
                setCurrentUser(null);
                setTasks([]);
                navigate('/login'); // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
            }
        });

        return () => unsubscribe();
    }, [navigate]);

    const handleLogout = () => {
        FIREBASE_AUTH.signOut()
            .then(() => {
                navigate('/');
                console.log('Déconnexion réussie');
            })
            .catch((error) => {
                console.error('Erreur lors de la déconnexion:', error);
            });
    };

    const fetchTasks = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching tasks for user:", userId);
            const q = query(collection(db, 'tasks'), where('assignedTo', '==', userId));
            const querySnapshot = await getDocs(q);
            const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched tasks:", tasksData);
            // Filtrer les tâches pour exclure celles dont la date limite est passée
            const now = new Date();
            const filteredTasks = tasksData.filter(task => new Date(task.deadline) > now);

            setTasks(filteredTasks);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Failed to load tasks. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <GlobalStyle />
            <Sidebar>
                <SidebarLink to="/Edit">
                    <SidebarBrand>
                        <i className="pi pi-user-edit" style={{ color: '#708090' }}></i>
                        Modifier profil
                    </SidebarBrand>
                </SidebarLink>
                <SidebarLink to="/Formulaire">
                    <SidebarBrand>
                        <i className="pi pi-pencil" style={{ color: '#708090' }}></i>
                        Créer une tâche
                    </SidebarBrand>
                </SidebarLink>
                <SidebarLink to="/history">
                    <SidebarBrand>
                        <i className="pi pi-history" style={{ color: '#708090' }}></i>
                        Historique des Tâches
                    </SidebarBrand>
                </SidebarLink>
                <SidebarLink to="/#">
                    <SidebarBrand>
                        <i className="pi pi-comments" style={{ color: '#708090' }}></i>
                        Discussions / Chats
                    </SidebarBrand>
                </SidebarLink>
                <Logout onClick={handleLogout} className="logout-button">Logout</Logout>
            </Sidebar>

            <MainSection>
                <Title>
                    <h2>Bienvenue, {currentUser ? currentUser.email : 'Cher utilisateur'}</h2>
                </Title>

                <ChecklistContainer>
                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : tasks.length > 0 ? (
                        tasks.map((task) => {
                            const deadlineDate = new Date(task.deadline);
                            const daysRemaining = Math.ceil((deadlineDate - new Date()) / (1000 * 60 * 60 * 24));
                            const showMessage = task.status !== 2;
                            console.log(`Task ID: ${task.id}, Days Remaining: ${daysRemaining}, Show Message: ${showMessage}`); // Debugging line

                            return (
                                <div key={task.id}>
                                    <Link to={`/Task/${task.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <Card border="primary" className="task-card">
                                            <CardHeader>{task.name}</CardHeader>
                                            <CardBody>
                                                <CardText>{task.description}</CardText>
                                                <StatusTextSpan status={task.status}>
                                                    Status: {task.status === 0 ? 'To do' : task.status === 1 ? 'In progress' : 'Completed'}
                                                </StatusTextSpan>
                                                <Deadline>
                                                    Deadline: {deadlineDate.toLocaleString()}
                                                    <Message daysRemaining={daysRemaining} visible={showMessage} />
                                                </Deadline>
                                                {task.tasks && Array.isArray(task.tasks) && task.tasks.length > 0 ? (
                                                    <SubTaskList>
                                                        {task.tasks.map((subTask, index) => (
                                                            <SubTaskItem
                                                                key={index}
                                                                statut={subTask.statut}
                                                            >
                                                                <div className="ms-2 me-auto">
                                                                    <div className={`fw-bold ${subTask.statut === 1 ? 'done-task' : ''}`}>{subTask.name}</div>
                                                                </div>
                                                            </SubTaskItem>
                                                        ))}
                                                    </SubTaskList>
                                                ) : (
                                                    <p>No sub-tasks available for this task.</p>
                                                )}
                                            </CardBody>
                                        </Card>
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <p>No tasks available.</p>
                    )}
                </ChecklistContainer>
            </MainSection>

        </>
    );
};



const GlobalStyle = createGlobalStyle`
    #root {
        margin: 0 0 310px 0;
    }
`;

const ChecklistContainer = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: center;

    .task-card:hover {
        transform: scale(1.1); 
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
`;

const Card = styled.div`
    
    border-radius: 0.45rem;
    margin: 10px;
    width: 18rem;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
`;

const CardHeader = styled.div`
    background-color: #9895e1;
    color: white;
    padding: 10px;
    margin-bottom: 10px;
   border-radius: 0.55rem;

   
`;

const CardBody = styled.div`
    padding: 20px;
    margin-top: 20px;
    background: #fff;
    border-radius: 0.75rem;
    
`;

const CardText = styled.p`
    margin: 0 0 10px;
`;



const Deadline = styled.div`
    margin: 0;
    color: gray;
`;

const SubTaskList = styled.ul`
    list-style-type: none;
    padding: 0;
`;

const SubTaskItem = styled.li`
    background-color: ${props => (props.statut === 1 ? '#4caf50' : '#f0f0f0')};
    margin: 5px 0;
    padding: 5px;
    border-radius: 4px;

    .done-task {
        color: #fff;
    }
`;

const Logout = styled.div`
    color: black;
    border: none;
    cursor: pointer;
`;

const Sidebar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 250px;
    background-color: #cdd5eb;
    overflow-y: auto;
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    padding: 20px;
    box-sizing: border-box;
`;

const SidebarLink = styled(Link)`
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    text-decoration: none;
    color: inherit;
    padding: 10px;
    border-radius: 8px;
    transition: background-color 0.3s;

    &:hover {
        background-color: #211d31;
        
    }

    i {
        margin-right: 10px;
    }
`;

const SidebarBrand = styled.div`
    display: flex;
    align-items: center;
    font-size: 18px;
    color: #708090;
    &:hover {
        color: white;
        
    }


`;

const Title = styled.div`
    color: #282e51;
`;

const MainSection = styled.div`
    position: relative;
    margin-left: 270px;
    margin-bottom: 90px;
    padding: 20px;
    

`;



const StatusTextSpan = styled.span`
    ${(props) => {
        switch (props.status) {
            case 0:
                return `
                    background-color: #f0f0f0;
                    color: #888383;
                    border-radius: 18px;
                `;
            case 1:
                return `
                    background-color: #ffd166;
                    color: #664c10;
                    border-radius: 18px;
                `;
            case 2:
                return `
                    background-color: #8FED8F;
                    color: #314031;
                    border-radius: 18px;
                `;
            default:
                return '';
        }
    }};
    font-size: 16px;
    padding: 6px;
   
`;

export default Dashboard;
