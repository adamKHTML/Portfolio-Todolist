import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import DashNav from './components/DashNav';

const HistoryPage = () => {
    const [tasks, setTasks] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user) {
                setCurrentUser(user);
                fetchTasks(user.uid);
            } else {
                setCurrentUser(null);
                setTasks([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const fetchTasks = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const q = query(collection(db, 'tasks'), where('assignedTo', '==', userId));
            const querySnapshot = await getDocs(q);
            const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(tasksData);
        } catch (error) {
            setError("Failed to load tasks. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    const categorizeTasks = (tasks) => {
        const now = new Date();
        const categories = {
            notDone: [],
            inProgress: [],
            completed: [],
            failedToDo: []
        };

        tasks.forEach(task => {
            const deadlineDate = new Date(task.deadline);
            const isPastDeadline = now > deadlineDate;
            if (task.status === 0) {
                categories.notDone.push(task);
            } else if (task.status === 1) {
                categories.inProgress.push(task);
            } else if (task.status === 2) {
                categories.completed.push(task);
            }
            if (isPastDeadline && task.status !== 2) {
                categories.failedToDo.push(task);
            }
        });

        return categories;
    };

    const { notDone, inProgress, completed, failedToDo } = categorizeTasks(tasks);

    return (
        <GlobalStyles>
            <FixedNav>
                <DashNav />
            </FixedNav>
            <PageContainer>

                <h2>Historique des Tâches</h2>

                {loading ? (
                    <p>Loading tasks...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <CategoryWrapper>
                        <CategorySection>
                            <h3>Non Fait</h3>
                            <TaskTable tasks={notDone} />
                        </CategorySection>
                        <CategorySection>
                            <h3>En Cours</h3>
                            <TaskTable tasks={inProgress} />
                        </CategorySection>
                        <CategorySection>
                            <h3>Complètes</h3>
                            <TaskTable tasks={completed} />
                        </CategorySection>
                        <CategorySection>
                            <h3>Non Réalisé à Temps</h3>
                            <TaskTable tasks={failedToDo} />
                        </CategorySection>
                    </CategoryWrapper>
                )}
            </PageContainer>
        </GlobalStyles>
    );
};

const TaskTable = ({ tasks }) => (
    <Table>
        <TableHeader>
            <div>Nom</div>
            <div>Sous-tâches</div>
            <div>Date Limite</div>
        </TableHeader>
        <TableBody>
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <TableRow key={task.id}>
                        <div>{task.name}</div>
                        <div>
                            {task.tasks && task.tasks.length > 0 ? (
                                <SubTaskList>
                                    {task.tasks.map((subTask, index) => (
                                        <li key={index}>{subTask.name}</li>
                                    ))}
                                </SubTaskList>
                            ) : (
                                <p>Aucune sous-tâche disponible</p>
                            )}
                        </div>
                        <div>{new Date(task.deadline).toLocaleDateString()}</div>
                    </TableRow>
                ))
            ) : (
                <TableRow>
                    <div colSpan="3">Aucune tâche.</div>
                </TableRow>
            )}
        </TableBody>
    </Table>
);

const GlobalStyles = styled.div`
    font-size: 100%;
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
    display: flex;
    align-items: center;
`;


const FixedNav = styled.div`
    position: fixed;
    top: 35px;
    left: 115px;
    width: 100%;
    z-index: 10;
`;

const PageContainer = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    h2 {
        font-size: 26px;
        margin: 20px 0;
        text-align: center;
        color: #282e51;
    }
`;

const CategoryWrapper = styled.div`
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    max-width: 100%; /* Ensure the wrapper doesn't exceed the container width */
`;

const CategorySection = styled.div`
    flex: 1 1 250px; /* Flex grow, shrink, and basis */
    max-width: 100%; /* Ensure sections don't exceed the wrapper's width */
    margin-bottom: 2rem;
    
    h3 {
        text-align: center;
        margin-bottom: 1rem;
        font-size: 18px;
        color: #282e51;

    }
`;

const Table = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
    max-width: 1280px; /* Set maximum width for tables */
    overflow-x: auto; /* Allow horizontal scrolling if necessary */
`;

const TableHeader = styled.div`
    display: flex;
    background-color: #6020f0;
    color: white;
    font-size: 14px;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.03em;
    padding: 10px;
    margin-bottom: 10px;

    div {
        flex: 1;
        padding: 0 10px;
    }
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
    gap: 10px;
`;

const TableRow = styled.div`
    display: flex;
    background-color: #ffffff;
    box-shadow: 0px 0px 9px 0px rgba(0, 0, 0, 0.1);
    padding: 10px;
    border-radius: 3px;
    transition: background-color 0.3s ease;

    &:hover {
        background-color: #f0f0f0;
    }

    div {
        flex: 1;
        padding: 0 10px;
    }
`;

const SubTaskList = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;

    li {
        padding: 5px 0;
    }
`;

export default HistoryPage;
