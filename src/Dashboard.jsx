import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import NavBar from './components/Navbar';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Message from './components/Message';

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

    const fetchTasks = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching tasks for user:", userId);
            const q = query(collection(db, 'tasks'), where('assignedTo', '==', userId));
            const querySnapshot = await getDocs(q);
            const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            console.log("Fetched tasks:", tasksData);
            setTasks(tasksData);
        } catch (error) {
            console.error("Error fetching tasks:", error);
            setError("Failed to load tasks. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <GlobalStyles>
            <NavBar />
            <Headreview>
                <div className="col-title banner-info-bg">
                    <h5>Bienvenue, {currentUser ? currentUser.email : 'Cher utilisateur'}</h5>
                    <img src="/images/Checklist.png" alt="Dev Logo SVG" className="img-fluid radius-image-curve" />
                </div>
            </Headreview>
            <TopContainer>
                <Link to="/Formulaire" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <button type="button" className="btn btn-dark">
                        Créer une tâche
                    </button>
                </Link>
                <Link to="/Edit" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <button type="button" className="btn btn-dark">
                        Modifier profil
                    </button>
                </Link>
            </TopContainer>
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
                                            <Status status={task.status}>
                                                Status: {task.status === 0 ? 'To do' : task.status === 1 ? 'In progress' : 'Completed'}
                                            </Status>
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
        </GlobalStyles>
    );
};


const GlobalStyles = styled.div`
    font-size: 100%;
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
`;

const Headreview = styled.div`
    min-height: calc(100vh - 20px);
    position: relative;
    z-index: 0;
    display: grid;
    align-items: center;
    padding: 3em 0;
    background: #614da7;
    justify-items: center;
    width: 100%;
    margin: 0;

    .col-title {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-evenly;

        h5 {
            color: #fff;
            font-size: 52px;
            line-height: 1.1;
            font-weight: 400;
            margin-right: 20px;
        }

        .img-fluid {
            max-width: 100%;
            height: auto;
            margin-left: auto;
            margin-right: auto;
            width: 200px;
        }
    }
`;

const TopContainer = styled.div`
    display: flex;
    flex-direction: row-reverse;

    .btn-dark {
        margin: 2.35em 8em 0 5.60em;
        height: 59px;
        width: 179px;
    }

    .btn-dark:hover {
        background-color: #ffd166;
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
    border: 1px solid #007bff;
    border-radius: 0.25rem;
    margin: 10px;
    width: 18rem;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
`;

const CardHeader = styled.div`
    background-color: #007bff;
    color: white;
    padding: 10px;
    border-bottom: 1px solid #007bff;
    border-top-left-radius: 0.25rem;
    border-top-right-radius: 0.25rem;
`;

const CardBody = styled.div`
    padding: 10px;
`;

const CardText = styled.p`
    margin: 0 0 10px;
`;

const Status = styled.div`
    margin: 0 0 10px;
    color: ${props => (props.status === 0 ? 'red' : props.status === 1 ? 'orange' : 'green')};
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

export default Dashboard;
