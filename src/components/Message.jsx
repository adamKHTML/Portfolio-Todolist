import React from 'react';
import styled from 'styled-components';

const Message = ({ daysRemaining, visible }) => {
    console.log(`Days Remaining: ${daysRemaining}, Visible: ${visible}`);

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

