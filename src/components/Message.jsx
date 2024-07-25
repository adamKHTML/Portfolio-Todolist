import React from 'react';
import styled from 'styled-components';

const Message = ({ daysRemaining, visible }) => {
    console.log(`Days Remaining: ${daysRemaining}, Visible: ${visible}`); // Debugging line

    if (!visible || daysRemaining <= 0) return null;

    let message = '';
    let color = '';

    if (daysRemaining <= 3) {
        message = 'Inconscient, il ne te reste plus beaucoup de temps, finis la tâche demandée !';
        color = 'red';
    } else if (daysRemaining <= 13) {
        message = 'La date limite approche, ne tarde pas trop !';
        color = 'orange';
    }

    return (
        <MessageContainer color={color}>
            {message}
        </MessageContainer>
    );
};

const MessageContainer = styled.div`
    background-color: ${props => props.color};
    color: white;
    padding: 10px;
    border-radius: 4px;
    margin: 10px 0;
`;

export default Message;

//  const getStatusText = (tasks) => {
//         // Si aucune tâche n'est présente, le statut est "Not Done"
//         if (!tasks || tasks.length === 0) {
//             return 'Not Done';
//         }
//         const allTasksNotDone = tasks.every(task => task.statut === 0);

//         if (allTasksNotDone) {
//             return 'Not Done';
//         }

//         // Vérification si toutes les tâches  marquées comme "Done"
//         const allTasksDone = tasks.every(task => task.statut === 1);

//         if (allTasksDone) {
//             return 'Done';
//         }

//         // Vérification d'au moins une tâche  marquée comme "In Progress"
//         const someTasksInProgress = tasks.some(task => task.statut === 0);

//         if (someTasksInProgress) {
//             return 'In Progress';
//         }

//         // Si aucune des conditions précédentes n'est remplie, le statut est "Not Done"
//         return 'Not Done';
//     };

//     const StatusTextSpan = styled.span`
//     ${(props) => {
//         switch (props.status) {
//             case 'Not Done':
//                 return `
//                     background-color: #f0f0f0;
//                     color: #888383;
//                     border-radius: 18px;
//                 `;
//             case 'In Progress':
//                 return `
//                     background-color: #ffd166;
//                     color: #664c10;
//                     border-radius: 18px;
//                 `;
//             case 'Done':
//                 return `
//                     background-color: #8FED8F;
//                     color: #314031;
//                     border-radius: 18px;
//                 `;
//             default:
//                 return '';
//         }
//     }};
//         font-size: 16px;
//         padding: 6px;
// `;
