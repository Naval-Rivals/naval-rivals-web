import { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      type = "text",
      className = "",
      placeholder = "",
      id,
      autoComplete = "off",
      error = false,
      ...props
    },
    ref,
  ) => {
    return (
      <input
        ref={ref}
        className={`bg-blue-dark-900 text-white border-3 rounded-lg w-full p-2 placeholder:opacity-100 placeholder:text-[#858385] focus:outline-1 focus:outline-white/40 ${error ? `border-red-500` : `border-blue-300`} ${className}`}
        type={type}
        placeholder={placeholder}
        id={id}
        autoComplete={autoComplete}
        {...props}
      />
    );
  },
);

export default Input;
