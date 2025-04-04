"use client";
import React, { useState } from "react";
import {
  format,
  addMonths,
  getDate,
  getMonth,
  getYear,
  isSameDay,
  startOfMonth,
  getDay,
  getDaysInMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Task } from "../../components/interfaces/types";

export default function TaskScheduler({
  boardDetail,
}: {
  boardDetail: Task[];
}) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [tasks, setTasks] = useState<Task[]>(boardDetail);

  // Get days in month
  const getDaysInMonthArray = (date: Date): (Date | null)[] => {
    const year = getYear(date);
    const month = getMonth(date);
    const firstDayOfMonth = getDay(startOfMonth(date));
    const totalDays = getDaysInMonth(date);

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const changeMonth = (increment: number): void => {
    setCurrentDate(addMonths(currentDate, increment));
  };

  // Format date as readable string with Thai locale
  const formatDateThai = (date: Date): string => {
    return format(date, "MMMM yyyy");
  };

  // Format time for display
  const formatTime = (date: Date): string => {
    return format(date, "HH:mm");
  };

  // Check if a date has tasks
  const hasTasksOnDate = (date: Date | null): boolean => {
    if (!date) return false;
    return tasks.some((task) => isSameDay(new Date(task.start_date), date));
  };

  // Get tasks for selected date
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter((task) => isSameDay(new Date(task.start_date), date));
  };

  // Handle date selection
  const selectDate = (date: Date | null): void => {
    if (!date) return;
    setSelectedDate(date);
  };

  const timelineStart = 8;
  const timelineEnd = 19;
  const timeSlots = Array.from(
    { length: timelineEnd - timelineStart },
    (_, i) => timelineStart + i
  );

  const getTaskPosition = (task: Task): { left: string; width: string } => {
    const taskStart =
      new Date(task.start_date).getHours() +
      new Date(task.start_date).getMinutes() / 60;
    const taskEnd =
      new Date(task.end_date).getHours() +
      new Date(task.end_date).getMinutes() / 60;

    const startPercent =
      ((taskStart - timelineStart) / (timelineEnd - timelineStart)) * 100;
    const widthPercent =
      ((taskEnd - taskStart) / (timelineEnd - timelineStart)) * 100;

    return { left: `${startPercent}%`, width: `${widthPercent}%` };
  };

  const daysOfWeek = ["sun", "mon", "tues", "weds", "thu", "fri", "sat"];

  return (
    <div className="w-full p-4 bg-gray-50 rounded-lg shadow">
      {/* Calendar Section */}
      <div className="mb-8 bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => changeMonth(-1)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            <ChevronLeft />
          </button>
          <h3 className="text-xl font-semibold">
            {formatDateThai(currentDate)}
          </h3>
          <button
            onClick={() => changeMonth(1)}
            className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            <ChevronRight />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map((day) => (
            <div
              key={day}
              className="text-center font-medium py-2 bg-gray-100">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {getDaysInMonthArray(currentDate).map((day, index) => (
            <div
              key={index}
              className={`h-24 border p-1 ${!day ? "bg-gray-100" : ""} ${
                day && isSameDay(day, selectedDate)
                  ? "border-blue-500 border-2"
                  : ""
              }`}
              onClick={() => day && selectDate(day)}>
              {day && (
                <>
                  <div
                    className={`text-right mb-1 ${
                      hasTasksOnDate(day) ? "font-bold" : ""
                    }`}>
                    {getDate(day)}
                  </div>
                  <div className="overflow-y-auto max-h-16">
                    {getTasksForDate(day).length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{getTasksForDate(day).length - 2} รายการ
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Selected Date and Tasks */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <h3 className="text-lg font-semibold mb-4">
          {format(selectedDate, "EEEE d MMMM yyyy")}
        </h3>

        {/* Timeline View */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">Timeline</h4>
          <div className="relative h-20 bg-gray-100 rounded overflow-x-auto">
            {/* Time markers */}
            <div className="flex justify-between text-xs text-gray-500 border-t border-gray-300 absolute w-full">
              {timeSlots.map((hour) => (
                <div
                  key={hour}
                  className="relative"
                  style={{
                    left: `${
                      ((hour - timelineStart) / (timelineEnd - timelineStart)) *
                      100
                    }%`,
                  }}>
                  {hour}:00
                </div>
              ))}
            </div>

            {/* Tasks */}
            <div className="absolute inset-0 mt-4">
              {getTasksForDate(selectedDate).map((task) => {
                const position = getTaskPosition(task);
                return (
                  <div
                    key={task.id}
                    className="absolute h-8 rounded text-white text-xs flex items-center px-2 truncate"
                    style={{
                      left: position.left,
                      width: position.width,
                    }}>
                    {task.title}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Task List */}
        <div className="mt-6">
          <h4 className="text-md font-medium mb-2">รายการงาน</h4>
          {getTasksForDate(selectedDate).length > 0 ? (
            <div className="space-y-2">
              {getTasksForDate(selectedDate).map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded shadow-sm border-l-4 bg-gray-50 flex justify-between">
                  <div className="font-medium">{task.title}</div>
                  <div className="text-gray-500 text-sm">
                    {formatTime(new Date(task.start_date))} -{" "}
                    {formatTime(new Date(task.end_date))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">ไม่มีงานในวันนี้</p>
          )}
        </div>
      </div>
    </div>
  );
}

