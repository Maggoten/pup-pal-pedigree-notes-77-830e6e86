
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { MessageSquare, Trash2, Edit2, Check, X } from 'lucide-react';
import { SymptomRecord } from './types';

interface SymptomItemProps {
  record: SymptomRecord;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<SymptomRecord, 'id'>>) => void;
}

const SymptomItem: React.FC<SymptomItemProps> = ({ record, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(record.title);
  const [editDescription, setEditDescription] = useState(record.description);

  const handleSave = () => {
    onUpdate(record.id, { 
      title: editTitle, 
      description: editDescription 
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(record.title);
    setEditDescription(record.description);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleCancel();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      handleSave();
    }
  };

  return (
    <div className="rounded-lg border p-4 bg-white">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5">
            <MessageSquare className="h-5 w-5 text-purple-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mb-1">
              {isEditing ? (
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="font-medium h-8 text-base"
                  autoFocus
                />
              ) : (
                <span className="font-medium">{record.title}</span>
              )}
              <span className="text-sm text-muted-foreground">
                {format(record.date, 'PPP')}
              </span>
            </div>
            {isEditing ? (
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onKeyDown={handleKeyDown}
                className="text-muted-foreground mt-1 min-h-[60px]"
                placeholder="Description..."
              />
            ) : (
              <p className="text-muted-foreground mt-1 w-full pr-2">
                {record.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 ml-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                className="h-8 w-8"
              >
                <Check className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="h-8 w-8"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8"
              >
                <Edit2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(record.id)}
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SymptomItem;
