import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const FloatingInput = ({ id, label, type = "text", value, onChange, error, isPassword = false }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={isPassword ? (show ? "text" : "password") : type}
        id={id}
        placeholder=" "
        value={value}
        onChange={onChange}
        className="block w-full px-0 py-3 text-lg text-slate-700 font-medium bg-transparent border-0 border-b-2 border-slate-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer transition-all duration-300"
      />
      <label
        htmlFor={id}
        className="absolute text-sm font-semibold tracking-wider text-slate-400 uppercase duration-300 transform -translate-y-7 scale-90 top-3 left-0 origin-left pointer-events-none 
        peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 
        peer-focus:scale-90 peer-focus:-translate-y-7 peer-focus:text-blue-600"
      >
        {label}
      </label>
      {error && <p className="text-red-500 text-xs font-bold mt-1 uppercase tracking-tighter">{error}</p>}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
        >
          {show ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      )}
    </div>
  );
};

export default FloatingInput;