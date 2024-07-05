import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, FormControl } from 'react-bootstrap';

const TaskForm = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [assignedTo, setAssignedTo] = useState('');
    const [deadline, setDeadline] = useState(new Date());
    const [users, setUsers] = useState([]);
    const [currentUser, setCurrentUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [currentTask, setCurrentTask] = useState({ id: '', name: '' });

    useEffect(() => {
        const fetchUsers = async () => {
            const usersSnapshot = await getDocs(collection(db, 'users'));
            setUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        };
        fetchUsers();

        const unsubscribe = onAuthStateChanged(FIREBASE_AUTH, (user) => {
            setCurrentUser(user);
        });

        return () => unsubscribe();
    }, []);

    const handleAddTask = () => {
        if (currentTask.name.trim() !== '') {
            setTasks([...tasks, { id: Date.now().toString(), name: currentTask.name }]);
            setCurrentTask({ id: '', name: '' });
        }
    };

    const handleDeleteTask = (taskId) => {
        setTasks(tasks.filter(task => task.id !== taskId));
    };

    const handleSaveTask = () => {
        setTasks(tasks.map(task => task.id === currentTask.id ? currentTask : task));
        setCurrentTask({ id: '', name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!currentUser) {
            console.error('No user is logged in');
            return;
        }

        await addDoc(collection(db, 'tasks'), {
            name,
            description,
            status: 0,
            assignedTo,
            createdBy: currentUser.uid,
            deadline: deadline.toISOString(),
            tasks
        });

        // Reset form
        setName('');
        setDescription('');
        setAssignedTo('');
        setDeadline(new Date());
        setTasks([]);
        setCurrentTask({ id: '', name: '' });
    };

    return (
        <form onSubmit={handleSubmit}>
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

            {/* Liste des tâches */}
            <ul>
                {tasks.map((task, index) => (
                    <li key={index}>
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
                    </li>
                ))}
            </ul>
            <div>
                <FormControl
                    type="text"
                    placeholder="New Task"
                    value={currentTask.name}
                    onChange={(e) =>
                        setCurrentTask({ id: currentTask.id || Date.now().toString(), name: e.target.value })
                    }
                />
                <Button variant="primary" onClick={handleAddTask}>
                    Add Task
                </Button>
            </div>

            <button type="submit">Create Task</button>
        </form>
    );
};

export default TaskForm;
