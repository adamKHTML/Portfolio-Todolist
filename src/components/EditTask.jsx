import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../firebaseConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, FormControl } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import styled from 'styled-components';

const EditTask = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [deadline, setDeadline] = useState(new Date());
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState({ id: '', name: '', statut: 0 });
    const [status, setStatus] = useState(0);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const taskDoc = await getDoc(doc(db, 'tasks', id));
                if (taskDoc.exists()) {
                    const taskData = taskDoc.data();
                    setName(taskData.name);
                    setDescription(taskData.description);
                    setAssignedTo(taskData.assignedTo);
                    setDeadline(new Date(taskData.deadline));
                    setTasks(taskData.tasks || []);
                    setStatus(taskData.status || 0);
                }
            } catch (error) {
                console.error('Error fetching task:', error);
            }
        };

        const fetchUsers = async () => {
            try {
                const usersSnapshot = await getDocs(collection(db, 'users'));
                setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchTask();
        fetchUsers();

        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            if (user) {
                setCurrentUser(user);
            } else {
                navigate('/login'); // Redirect to login if user is not authenticated
            }
        });

        return () => unsubscribe();
    }, [id, navigate]);

    const handleAddTask = () => {
        if (currentTask.name.trim() !== '') {
            setTasks([...tasks, { id: Date.now().toString(), name: currentTask.name, statut: 0 }]);
            setCurrentTask({ id: '', name: '', statut: 0 });
        }
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const handleSaveTask = () => {
        setTasks(tasks.map(task => task.id === currentTask.id ? currentTask : task));
        setCurrentTask({ id: '', name: '', statut: 0 });
    };

    const handleCheckboxChange = (taskId) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                task.statut = task.statut === 0 ? 1 : 0;
            }
            return task;
        });
        setTasks(updatedTasks);
        const newStatus = updateTaskStatus(updatedTasks);
        setStatus(newStatus);
    };

    const updateTaskStatus = (updatedTasks) => {
        const completedTasks = updatedTasks.filter(task => task.statut === 1).length;
        const newStatus = completedTasks === 0 ? 0 : (completedTasks === updatedTasks.length ? 2 : 1);
        try {
            updateDoc(doc(db, 'tasks', id), { status: newStatus });
        } catch (error) {
            console.error('Error updating task status:', error);
        }
        return newStatus;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            console.error('No user is logged in');
            return;
        }

        try {
            await updateDoc(doc(db, 'tasks', id), {
                name,
                description,
                assignedTo,
                deadline: deadline.toISOString(),
                tasks,
                status
            });
            navigate('/dashboard');
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Status status={status}>
                Status: {status === 0 ? 'To do' : status === 1 ? 'In progress' : 'Completed'}
            </Status>
            <input
                type="text"
                placeholder="Task Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
            />

            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
            />
            <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                required
            >
                <option value="">Select a user</option>
                {users.map(user => (
                    <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                    </option>
                ))}
            </select>
            <DatePicker
                selected={deadline}
                onChange={(date) => setDeadline(date)}
                showTimeSelect
                dateFormat="Pp"
            />

            {/* Task list */}
            <ul>
                {tasks.map((task, index) => (
                    <TaskItem key={index} statut={task.statut}>
                        {currentTask.id === task.id ? (
                            <FormControl
                                type="text"
                                value={currentTask.name}
                                onChange={(e) =>
                                    setCurrentTask({ ...currentTask, name: e.target.value })
                                }
                            />
                        ) : (
                            <span>{task.name}</span>
                        )}
                        <input
                            type="checkbox"
                            checked={task.statut === 1}
                            onChange={() => handleCheckboxChange(task.id)}
                        />
                        <div>
                            <Button variant="danger" onClick={() => handleDeleteTask(task.id)}>
                                Delete
                            </Button>
                            {currentTask.id === task.id ? (
                                <Button variant="success" onClick={handleSaveTask}>
                                    Save
                                </Button>
                            ) : (
                                <Button
                                    variant="secondary"
                                    onClick={() => setCurrentTask(task)}
                                >
                                    Edit
                                </Button>
                            )}
                        </div>
                    </TaskItem>
                ))}
            </ul>
            <div>
                <FormControl
                    type="text"
                    placeholder="New Task"
                    value={currentTask.name}
                    onChange={(e) =>
                        setCurrentTask({ id: currentTask.id || Date.now().toString(), name: e.target.value, statut: 0 })
                    }
                />
                <Button variant="primary" onClick={handleAddTask}>
                    Add Task
                </Button>
            </div>

            <button type="submit">Update Task</button>
        </form>
    );
};

const Status = styled.div`
    margin: 0 0 10px;
    color: ${props => (props.status === 0 ? 'red' : props.status === 1 ? 'orange' : 'green')};
`;

const TaskItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${props => (props.statut === 1 ? '#4caf50' : '#f0f0f0')};
    margin: 5px 0;
    padding: 5px;
    border-radius: 4px;

    span {
        flex-grow: 1;
        margin-right: 10px;
    }
`;

export default EditTask;
