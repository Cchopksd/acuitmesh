"use client";
import React, { useState } from "react";
import {
  Users,
  Settings,
  Calendar,
  MoreHorizontal,
  Plus,
  AlertCircle,
} from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import AddNewModal from "./AddNewModal";
import { AddNewUserCollaboration } from "../action";
import Swal from "sweetalert2";

interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
}

interface TaskBoard {
  id: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

interface Collaborator {
  user_id: string;
  task_board_id: string;
  role: "owner" | "editor" | "viewer";
  created_at: string;
  updated_at: string;
  user: User;
  task_board: TaskBoard;
}

interface CollaborationBoardProps {
  data: Collaborator[];
}

interface AddNewCollaborator {
  email: string;
  role: "owner" | "editor" | "viewer";
  task_board_id: string;
}

export default function CollaborationBoard({ data }: CollaborationBoardProps) {
  const [activeCollaborators, setActiveCollaborators] = useState(data || []);
  const [activeTab, setActiveTab] = useState("collaborators");
  const taskBoard = data.length > 0 ? data[0].task_board : null;

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddCollaborator = async (
    collaboratorData: AddNewCollaborator
  ) => {
    const newUser = await AddNewUserCollaboration(collaboratorData);
    if (!newUser) {
      Swal.fire({
        icon: "error",
        title: "Failed to add new collaborator.",
        text: "Please check the email address and try again.",
        confirmButtonText: "OK",
      });
      return;
    }
    setActiveCollaborators((prev) => [...prev, newUser]);
    setIsModalOpen(false);
  };
  const collaboratorsByRole = activeCollaborators.reduce<{
    [key: string]: Collaborator[];
  }>((acc, collab) => {
    const role = collab.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(collab);
    return acc;
  }, {});

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  const roleColors = {
    owner: "bg-purple-100 text-purple-800",
    editor: "bg-blue-100 text-blue-800",
    viewer: "bg-green-100 text-green-800",
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {taskBoard ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">{taskBoard.title}</h1>
              <p className="text-gray-500">{taskBoard.description}</p>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("collaborators")}
                className={`px-4 py-2 font-medium text-sm ${
                  activeTab === "collaborators"
                    ? "border-b-2 border-blue-500 text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}>
                Collaborators
              </button>
            </div>

            {activeTab === "collaborators" && (
              <div className="mt-4 bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <Users
                        size={20}
                        className="mr-2 text-gray-500"
                      />
                      <h2 className="text-xl font-semibold">Team Members</h2>
                    </div>
                    <button
                      onClick={() => {
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1">
                      <Plus size={16} />
                      Invite
                    </button>
                  </div>
                  <p className="text-gray-500 text-sm mt-1">
                    Manage who has access to "{taskBoard.title}" and their
                    permissions.
                  </p>
                </div>
                <div className="p-4">
                  {Object.keys(collaboratorsByRole).map((role) => (
                    <div
                      key={role}
                      className="mb-6">
                      <h3 className="font-medium mb-3 text-gray-700 flex items-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            roleColors[role as keyof typeof roleColors] ||
                            "bg-gray-100"
                          }`}>
                          {role}
                        </span>
                        <span className="ml-2">
                          ({collaboratorsByRole[role].length})
                        </span>
                      </h3>
                      <div className="space-y-4">
                        {collaboratorsByRole[role].map(
                          (collab: Collaborator) => (
                            <div
                              key={collab.user_id}
                              className="flex justify-between p-3 rounded-lg border hover:bg-gray-50">
                              <div className="flex w-full flex-col md:flex-row gap-2 justify-between md:pr-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium">
                                    {getInitials(collab.user.name)}
                                  </div>
                                  <div>
                                    <p className="font-medium">
                                      {collab.user.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      {collab.user.email}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-gray-500">
                                    Joined{" "}
                                    {format(
                                      new Date(collab.created_at),
                                      "d/MM/yyyy HH:mm:ss",
                                      { locale: th }
                                    )}
                                  </span>
                                </div>
                              </div>
                              <button className="p-1 rounded-full hover:bg-gray-100">
                                <MoreHorizontal size={16} />
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {isModalOpen && (
            <AddNewModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSubmit={handleAddCollaborator}
              task_board_id={taskBoard.id}
            />
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">
            No Task board Data Available
          </h2>
          <p className="text-gray-500">
            The requested task board couldn't be loaded.
          </p>
        </div>
      )}
    </div>
  );
}
