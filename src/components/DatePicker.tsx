import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { CalendarDays } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, placeholder }) => {
  return (
    <div className="relative w-full">
      <ReactDatePicker
        selected={value ? new Date(value) : null}
        onChange={(date: Date) => onChange(date.toISOString().split('T')[0])}
        dateFormat="MMMM d, yyyy"
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        maxDate={new Date()}
        placeholderText={placeholder}
        calendarClassName="date-picker-calendar"
        customInput={
          <div className="relative flex items-center w-full">
            <input
              type="text"
              className="w-full bg-transparent px-3 py-3 sm:px-4 sm:py-4 text-base sm:text-2xl text-gray-900 
                        placeholder-gray-400 focus:outline-none border-b-2 border-gray-200 
                        focus:border-[#b4854b] transition-colors duration-200 pr-12"
              value={value ? new Date(value).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric'
              }) : ''}
              placeholder={placeholder}
              readOnly
            />
            <CalendarDays className="absolute right-3 sm:right-4 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        }
        className="w-full"
      />
    </div>
  );
};