import React from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import styled from 'styled-components';
import 'primeicons/primeicons.css';

const DeleteTask = ({ taskId, status, onDeleteSuccess, onDeleteError }) => {
    const handleDelete = async () => {
        const confirmation = window.confirm("Are you sure you want to delete this task?");
        if (!confirmation) return;

        try {
            await deleteDoc(doc(db, 'tasks', taskId));
            onDeleteSuccess(taskId);
        } catch (error) {
            console.error('Error deleting task:', error);
            onDeleteError();
        }
    };

    // N'afficher le bouton de suppression que si la tâche est complète (statut = 2)
    if (status !== 2) {
        return null;
    }

    return (
        <DeleteButton onClick={handleDelete}>
            <i className="pi pi-trash"></i>
        </DeleteButton>
    );
};

const DeleteButton = styled.button`
    background-color: #ff4d4f;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
        background-color: #ff7875;
    }
`;

export default DeleteTask;
