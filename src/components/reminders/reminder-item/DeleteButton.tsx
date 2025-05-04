
import React from 'react';
import { X, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeleteButtonProps {
  isDeleting: boolean;
  onClick: () => void;
}

const DeleteButton: React.FC<DeleteButtonProps> = ({
  isDeleting,
  onClick
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-6 w-6 flex items-center justify-center rounded-full",
        isDeleting ? "bg-red-500 text-white" : "text-gray-400 hover:text-red-500"
      )}
    >
      {isDeleting ? <X className="h-3 w-3" /> : <Trash2 className="h-3 w-3" />}
    </button>
  );
};

export default DeleteButton;
