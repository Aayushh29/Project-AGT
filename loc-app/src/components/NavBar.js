import React, { useState } from "react";
import logo from "../logo.svg"; // Replace with actual path
import menu from "../logo.svg"; // Replace with actual path
import close from "../logo.svg"; // Replace with actual path
import { navLinks } from "../index"; // Replace with your nav links array

const Navbar = () => {
  const [active, setActive] = useState("Home");
  const [toggle, setToggle] = useState(false);

  return (
    <nav className="w-full flex py-6 justify-between items-center bg-black px-4 md:px-8">
      {/* Logo */}
      <img src={logo} alt="App Logo" className="w-[124px] h-[32px]" />

      {/* Desktop Nav */}
      <ul className="list-none sm:flex hidden justify-end items-center flex-1">
        {navLinks.map((nav, index) => (
          <li
            key={nav.id}
            className={`font-medium cursor-pointer text-[16px] transition-colors ${
              active === nav.title ? "text-white" : "text-gray-400"
            } ${index !== navLinks.length - 1 ? "mr-10" : ""}`}
            onClick={() => setActive(nav.title)}
          >
            <a href={`#${nav.id}`}>{nav.title}</a>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Toggle */}
      <div className="sm:hidden flex flex-1 justify-end items-center">
        <img
          src={toggle ? close : menu}
          alt="menu"
          className="w-[28px] h-[28px] object-contain cursor-pointer"
          onClick={() => setToggle((prev) => !prev)}
        />

        {/* Mobile Dropdown */}
        <div
          className={`${
            toggle ? "flex" : "hidden"
          } p-6 bg-gradient-to-br from-zinc-800 to-zinc-900 absolute top-20 right-4 min-w-[160px] rounded-xl shadow-lg z-50`}
        >
          <ul className="list-none flex flex-col gap-4">
            {navLinks.map((nav) => (
              <li
                key={nav.id}
                className={`font-medium cursor-pointer text-[16px] ${
                  active === nav.title ? "text-white" : "text-gray-400"
                }`}
                onClick={() => {
                  setActive(nav.title);
                  setToggle(false); // Close menu on click
                }}
              >
                <a href={`#${nav.id}`}>{nav.title}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
