import React, { useState } from "react";
import { X } from "lucide-react";

interface AddCollaboratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    email: string;
    role: "owner" | "editor" | "viewer";
    task_board_id: string;
  }) => void;
  task_board_id: string;
}

const AddCollaboratorModal = ({
  isOpen,
  onClose,
  onSubmit,
  task_board_id,
}: AddCollaboratorModalProps) => {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"owner" | "editor" | "viewer">("viewer");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      onSubmit({
        email,
        role,
        task_board_id,
      });
      setIsLoading(false);
      setEmail("");
      setRole("viewer");
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg shadow-lg w-full max-w-md'>
        <div className='flex justify-between items-center p-4 border-b'>
          <h2 className='text-lg font-semibold'>Add New Collaborator</h2>
          <button
            onClick={onClose}
            className='text-gray-500 hover:text-gray-700 focus:outline-none'>
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className='p-4'>
          <div className='mb-4'>
            <label
              htmlFor='email'
              className='block text-sm font-medium text-gray-700 mb-1'>
              Email Address
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='collaborator@example.com'
              required
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
            />
          </div>

          <div className='mb-6'>
            <label
              htmlFor='role'
              className='block text-sm font-medium text-gray-700 mb-1'>
              Collaborator Role
            </label>
            <select
              id='role'
              value={role}
              onChange={(e) =>
                setRole(e.target.value as "owner" | "editor" | "viewer")
              }
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'>
              <option value='viewer'>Viewer</option>
              <option value='editor'>Editor</option>
              <option value='admin'>Admin</option>
            </select>
            <p className='mt-1 text-xs text-gray-500'>
              {role === "viewer" && "Can view tasks but cannot edit"}
              {role === "editor" && "Can create and edit tasks"}
              {role === "owner" && "Full access including user management"}
            </p>
          </div>

          <div className='flex justify-end space-x-3 pt-2 border-t'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md'>
              Cancel
            </button>
            <button
              type='submit'
              disabled={isLoading || !email}
              className='px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed'>
              {isLoading ? "Adding..." : "Add Collaborator"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCollaboratorModal;
