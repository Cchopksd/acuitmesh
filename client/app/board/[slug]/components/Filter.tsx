import { ChevronDownIcon, ChevronDownSquareIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";

type FilterOption = {
  value: string;
  label: string;
};

export default function Filter() {
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);

  const [statusDropdownOpen, setStatusDropdownOpen] = useState<boolean>(false);
  const [priorityDropdownOpen, setPriorityDropdownOpen] =
    useState<boolean>(false);

  const statusDropdownRef = useRef<HTMLDivElement | null>(null);
  const priorityDropdownRef = useRef<HTMLDivElement | null>(null);

  const statusOptions: FilterOption[] = [
    { value: "todo", label: "To Do" },
    { value: "doing", label: "Doing" },
    { value: "done", label: "Done" },
  ];

  const priorityOptions: FilterOption[] = [
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setPriorityDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSelection = (
    value: string,
    selected: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const applyFilters = (): void => {
    const params = new URLSearchParams();

    selectedStatuses.forEach((status) => {
      params.append("status", status);
    });

    selectedPriorities.forEach((priority) => {
      params.append("priority", priority);
    });

    window.location.search = params.toString();
  };

  const clearFilters = (): void => {
    setSelectedStatuses([]);
    setSelectedPriorities([]);
    setStatusDropdownOpen(false);
    setPriorityDropdownOpen(false);
  };

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div
        className="relative"
        ref={statusDropdownRef}>
        <button
          onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
          className="bg-gray-100 text-gray-800 rounded-md px-4 py-2 flex items-center justify-between min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={statusDropdownOpen}>
          <span>
            {selectedStatuses.length === 0
              ? "All Statuses"
              : `${selectedStatuses.length} selected`}
          </span>
          <ChevronDownIcon />
        </button>

        {statusDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
            <ul
              className="py-1"
              role="listbox">
              {statusOptions.map((option) => (
                <li
                  key={option.value}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() =>
                    toggleSelection(
                      option.value,
                      selectedStatuses,
                      setSelectedStatuses
                    )
                  }
                  role="option"
                  aria-selected={selectedStatuses.includes(option.value)}>
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(option.value)}
                    onChange={() => {}}
                    className="mr-2"
                    aria-label={`Select ${option.label}`}
                  />
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div
        className="relative"
        ref={priorityDropdownRef}>
        <button
          onClick={() => setPriorityDropdownOpen(!priorityDropdownOpen)}
          className="bg-gray-100 text-gray-800 rounded-md px-4 py-2 flex items-center justify-between min-w-40 focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="button"
          aria-haspopup="listbox"
          aria-expanded={priorityDropdownOpen}>
          <span>
            {selectedPriorities.length === 0
              ? "All Priorities"
              : `${selectedPriorities.length} selected`}
          </span>
          <ChevronDownIcon />
        </button>

        {priorityDropdownOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
            <ul
              className="py-1"
              role="listbox">
              {priorityOptions.map((option) => (
                <li
                  key={option.value}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() =>
                    toggleSelection(
                      option.value,
                      selectedPriorities,
                      setSelectedPriorities
                    )
                  }
                  role="option"
                  aria-selected={selectedPriorities.includes(option.value)}>
                  <input
                    type="checkbox"
                    checked={selectedPriorities.includes(option.value)}
                    onChange={() => {}}
                    className="mr-2"
                    aria-label={`Select ${option.label}`}
                  />
                  {option.label}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          onClick={applyFilters}
          type="button">
          Apply Filters
        </button>

        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          onClick={clearFilters}
          type="button">
          Clear
        </button>
      </div>
    </div>
  );
}

