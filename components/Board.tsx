
import React from 'react';
import { TaskCard } from '../types';
import Card from './Card';

interface BoardProps {
  cards: TaskCard[];
  onDelete: (id: string) => void;
  onUpdateStatus: (id: string, status: TaskCard['status']) => void;
  onAddUpdate: (id: string, text: string, mediaUrl?: string, mediaType?: 'image' | 'video') => void;
  currentUserEmail: string;
}

const Board: React.FC<BoardProps> = ({ cards, onDelete, onUpdateStatus, onAddUpdate, currentUserEmail }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500 items-start">
      {cards.map(card => (
        <Card 
          key={card.id} 
          card={card} 
          onDelete={onDelete} 
          onUpdateStatus={onUpdateStatus}
          onAddUpdate={onAddUpdate}
          currentUserEmail={currentUserEmail}
        />
      ))}
    </div>
  );
};

export default Board;
