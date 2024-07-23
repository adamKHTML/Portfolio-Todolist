import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

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

            <PageContainer>
                <h2>Historique des Tâches</h2>
                {loading ? (
                    <p>Loading tasks...</p>
                ) : error ? (
                    <p>{error}</p>
                ) : (
                    <>
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
                    </>
                )}
            </PageContainer>
        </GlobalStyles>
    );
};

const TaskTable = ({ tasks }) => (
    <Table>
        <thead>
            <tr>
                <th>Nom</th>
                <th>Sous-tâches</th>
                <th>Date Limite</th>
            </tr>
        </thead>
        <tbody>
            {tasks.length > 0 ? (
                tasks.map(task => (
                    <tr key={task.id}>
                        <td>{task.name}</td>
                        <td>
                            {task.tasks && task.tasks.length > 0 ? (
                                <ul>
                                    {task.tasks.map((subTask, index) => (
                                        <li key={index}>{subTask.name}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p>Aucune sous-tâche disponible</p>
                            )}
                        </td>
                        <td>{new Date(task.deadline).toLocaleDateString()}</td>
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan="3">Aucune tâche disponible.</td>
                </tr>
            )}
        </tbody>
    </Table>
);

const GlobalStyles = styled.div`
    font-size: 100%;
    font-family: 'Roboto', sans-serif;
    margin: 0;
    padding: 0;
    width: 100%;
    box-sizing: border-box;
    overflow-x: hidden;
`;

const PageContainer = styled.div`
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;

    h2 {
        margin-bottom: 1.5rem;
    }
`;

const CategorySection = styled.div`
    margin-bottom: 2rem;
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;

    th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
    }

    th {
        background-color: #f2f2f2;
    }

    tr:nth-child(even) {
        background-color: #f9f9f9;
    }
`;

export default HistoryPage;
