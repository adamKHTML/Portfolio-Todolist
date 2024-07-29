import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, FormControl, Form, InputGroup, FormSelect } from 'react-bootstrap';
import styled from 'styled-components';
import { fr } from 'date-fns/locale';
import DashNav from './DashNav';

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

        if (!name || !description || !assignedTo || !deadline || tasks.length === 0) {
            console.error('All fields must be filled out');
            return;
        }

        try {
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
        } catch (error) {
            console.error('Error adding task: ', error);
        }
    };

    return (
        <>
            <FixedNav>
                <DashNav />
            </FixedNav>
            <StyledForm >
                <StyledInput
                    type="text"
                    placeholder="Task Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Form>
                    <InputGroup>
                        <StyledTextarea
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </InputGroup>
                </Form>
                <StyledSelect
                    aria-label="Default select example"
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
                </StyledSelect>
                <DatePicker
                    selected={deadline}
                    onChange={(date) => setDeadline(date)}
                    showTimeSelect
                    timeFormat="p"
                    timeIntervals={15}
                    dateFormat="Pp"
                    locale={fr}
                    placeholderText="Select date and time"
                    className="form-control"
                    customInput={<StyledDateInput />}
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
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <StyledInput
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

                <StyledButton type="submit" onClick={handleSubmit}>Create Task</StyledButton>
            </StyledForm>
        </>
    );
};

export default TaskForm;

// Styles pour le composant

const FixedNav = styled.div`
    position: fixed;
    top: 35px;
    left: 115px;
    width: 100%;
    z-index: 10;
`;

const StyledForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    padding: 60px 40px;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid #201d30;
    margin: 170px auto;
    width: 80%;
    max-width: 800px;

    h2 {
        margin-bottom: 20px;
    }

    a {
        margin-top: 15px;
        color: #4b548a;
        text-decoration: none;

        &:hover {
            text-decoration: underline;
        }
    }

    
    ul {
        list-style: none;
        padding: 0;
    }

    li {
        background-color: #ffffff;
        border-radius: 10px;
        margin-bottom: 10px;
        padding: 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    }

    li div {
        display: flex;
        align-items: center;
        gap: 10px; /* Espacement entre les boutons */
    }

    input,
    span,
    textarea,
    button {
        margin-bottom: 10px;
    }
`;

const StyledInput = styled.input`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    box-sizing: border-box;
    font-size: 1rem;

    &:focus {
        border-color: #4b548a;
        outline: none;
    }

    &::placeholder {
        color: #bbb;
    }
`;

const StyledTextarea = styled.textarea`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    box-sizing: border-box;
    font-size: 1rem;

    &:focus {
        border-color: #4b548a;
        outline: none;
    }

    &::placeholder {
        color: #bbb;
    }
`;
const StyledSelect = styled.select`
    width: 100%;
    padding: 10px;
    margin: 10px 0;
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    box-sizing: border-box;
    font-size: 1rem;

    &:focus {
        border-color: #4b548a;
        outline: none;
    }

    &::placeholder {
        color: #bbb;
    }
`;



const StyledButton = styled.button`
    padding: 10px 20px;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    background: #4b548a;
    color: white;
    cursor: pointer;
    transition: transform 0.3s ease, background 0.3s ease;
    margin: 10px 0;

    &:hover {
        transform: scale(1.05);
        background: linear-gradient(45deg, #51fbdc 33%, #a8fdee 33%, #a8fdee 66%, #d4fef7 66%);
    }
`;

const StyledDateInput = styled.input`
    width: 100%;
    padding: 10px;
    background: transparent;
    border: none;
    border-bottom: 1px solid #000000;
    box-sizing: border-box;
    margin-top: 10px;
    font-size: 1rem;

    &:focus {
        outline: none;
        border-color: #4b548a;
    }

    &::placeholder {
        color: #bbb;
    }
`;
