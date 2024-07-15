// src/components/TaskManager.js
import React, { useState, useEffect } from 'react';
import { firestore } from '../firebaseConfig';
import { collection, getDocs, addDoc } from "firebase/firestore";

const TaskManager = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    const fetchTasks = async () => {
      const tasksCollection = await getDocs(collection(firestore, 'tasks'));
      setTasks(tasksCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchTasks();
  }, []);

  const addTask = async () => {
    if (newTask.trim()) {
      await addDoc(collection(firestore, 'tasks'), { title: newTask, completed: false });
      setNewTask('');
      // Re-fetch tasks after adding a new one
      const tasksCollection = await getDocs(collection(firestore, 'tasks'));
      setTasks(tasksCollection.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }
  };

  return (
    <div>
      <h2>Task Manager</h2>
      <input
        type="text"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="New Task"
      />
      <button onClick={addTask}>Add Task</button>
      <ul>
        {tasks.map(task => (
          <li key={task.id}>{task.title}</li>
        ))}
      </ul>
    </div>
  );
};

export default TaskManager;