"use client";
import React, { useState } from "react";
import { AddNewBoardCollaboration } from "../action";
import { useRouter } from "next/navigation";

export default function TaskBoardForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await AddNewBoardCollaboration(formData);
      router.push(`/board/${response.task_board_id}`);
    } catch (err) {
      console.error("Error creating taskboard:", err);
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
      setSuccess(true);
    }
  };

  return (
    <div className='w-full  max-w-md mx-auto p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-xl font-bold mb-4'>Create New Taskboard</h2>

      {success && (
        <div className='mb-4 p-3 bg-green-100 text-green-800 rounded'>
          Task Board created successfully!
        </div>
      )}

      {error && (
        <div className='mb-4 p-3 bg-red-100 text-red-800 rounded'>{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className='mb-4'>
          <label
            htmlFor='title'
            className='block mb-1 font-medium'>
            Title
          </label>
          <input
            type='text'
            id='title'
            name='title'
            value={formData.title}
            onChange={handleChange}
            required
            className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <div className='mb-4'>
          <label
            htmlFor='description'
            className='block mb-1 font-medium'>
            Description
          </label>
          <textarea
            id='description'
            name='description'
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className='w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500'
          />
        </div>

        <button
          type='submit'
          disabled={isSubmitting}
          className='w-full py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400'>
          {isSubmitting ? "Creating..." : "Create Taskboard"}
        </button>
      </form>
    </div>
  );
}
