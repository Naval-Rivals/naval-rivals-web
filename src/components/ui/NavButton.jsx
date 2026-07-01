import { NavLink } from "react-router";

function NavButton({ children, router, className }) {
  return (
    <NavLink to={router} className="hover:opacity-80 flex items-center">
      {({ isActive }) => (
        <span
          className={`${isActive ? "text-orange-300" : "text-blue-300"} ${className}`}
        >
          {children}
        </span>
      )}
    </NavLink>
  );
}

export default NavButton;
