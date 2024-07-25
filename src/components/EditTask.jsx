import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db, FIREBASE_AUTH } from '../firebaseConfig';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Button, FormControl, Form, InputGroup, FormSelect } from 'react-bootstrap';
import { onAuthStateChanged } from 'firebase/auth';
import styled from 'styled-components';
import DashNav from './DashNav';


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

        <>
            <FixedNav>
                <DashNav />
            </FixedNav>
            <StyledForm >
                <StatusTextSpan status={status}>
                    Status: {status === 0 ? 'To do' : status === 1 ? 'In progress' : 'Completed'}
                </StatusTextSpan>

                <StyledInput
                    type="text"
                    placeholder="Task Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <Form>
                    <InputGroup>
                        <Form.Control
                            as="textarea"
                            aria-label="With textarea"
                            placeholder="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                    </InputGroup>
                </Form>
                <FormSelect
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
                </FormSelect>
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

                <StyledButton type="submit" onClick={handleSubmit}>Update Task</StyledButton>
            </StyledForm>

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

const TaskItem = styled.li`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${props => (props.statut === 1 ? '#4caf50' : '#f0f0f0')};
      
    gap: 10px;
    padding: 5px;
    border-radius: 4px;
    
        border-radius: 10px;
        margin-bottom: 10px;
        padding: 10px;
        
        gap: 10px;
        box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);

    span {
        flex-grow: 1;
        margin-right: 10px;
    }
`;


const StyledForm = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    padding: 60px 40px 40px 40px ;
    border-radius: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border: 2px solid #201d30;
    position: relative;
    margin: 170px auto;



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

    &::before,
    &::after {
        content: '';
        position: absolute;
        top: 0;
        left: 20px;
        right: 20px;
        height: 2px;
        background: #201d30;
    }

    &::after {
        top: auto;
        bottom: 0;
    }

    ul {
        list-style: none;
        padding: 0;
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




export default EditTask;
