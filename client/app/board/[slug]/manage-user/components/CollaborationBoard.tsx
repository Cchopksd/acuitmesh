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

type RoleColorMap = {
  [key: string]: string;
};

export default function CollaborationBoard({ data }: CollaborationBoardProps) {
  const [activeCollaborators, setActiveCollaborators] = useState(data || []);
  const [activeTab, setActiveTab] = useState("collaborators");
  const taskBoard = data.length > 0 ? data[0].task_board : null;

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

  // Get initials for avatar
  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  };

  // Role color mapping
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

          {/* Tabs */}
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

            {/* Collaborators Tab */}
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
                    <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm flex items-center gap-1">
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
                              className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50">
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
                                <button className="p-1 rounded-full hover:bg-gray-100">
                                  <MoreHorizontal size={16} />
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === "tasks" && (
              <div className="mt-4 bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">Tasks Panel</h2>
                  <p className="text-gray-500 text-sm">
                    Manage tasks for this board
                  </p>
                </div>
                <div className="flex items-center justify-center p-10">
                  <div className="text-center">
                    <AlertCircle
                      size={40}
                      className="mx-auto mb-4 text-gray-400"
                    />
                    <h3 className="text-lg font-medium">
                      No tasks created yet
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Start by adding your first task to this board
                    </p>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center mx-auto gap-1">
                      <Plus size={16} />
                      Add New Task
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Activity Tab */}
            {activeTab === "activity" && (
              <div className="mt-4 bg-white rounded-lg border shadow-sm">
                <div className="p-4 border-b">
                  <h2 className="text-xl font-semibold">Activity Log</h2>
                  <p className="text-gray-500 text-sm">
                    Recent actions on this board
                  </p>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    {activeCollaborators.map((collab, index) => (
                      <div
                        key={index}
                        className="flex gap-3 pb-3 border-b last:border-0">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs">
                          {getInitials(collab.user.name)}
                        </div>
                        <div>
                          <p>
                            <span className="font-medium">
                              {collab.user.name}
                            </span>{" "}
                            joined as
                            <span
                              className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                                roleColors[
                                  collab.role as keyof typeof roleColors
                                ]
                              }`}>
                              {collab.role}
                            </span>
                          </p>
                          <p className="text-sm text-gray-500">
                            {format(
                              new Date(collab.created_at),
                              "d MM yyyy HH:mm:ss",
                              { locale: th }
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-2">
            No Taskboard Data Available
          </h2>
          <p className="text-gray-500">
            The requested taskboard couldn't be loaded.
          </p>
        </div>
      )}
    </div>
  );
}

