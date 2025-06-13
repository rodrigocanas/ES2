import React from "react";
import { FaGithub, FaLinkedin, FaDiscord, FaTwitter } from "react-icons/fa";

const teamMembers = [
  {
    name: "TOMÁS ROCHA",
    role: "Melhor developer do bs",
    image: "/images/fotoH1.jpg",
  },
  {
    name: "GUILHERME FIDALGO",
    role: "Melhor team leader do bs",
    image: "/images/fotoH2.jpg",
  },
  {
    name: "RODRIGO CANAS",
    role: "Melhor developer do bs",
    image: "/images/fotoH3.jpg",
  },
  {
    name: "MARIA LUIZ",
    role: "Melhor designer do bs",
    image: "/images/fotoM.jpg",
  },
];

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 to-black text-white px-4">
      <header className="text-center py-10">
        <h1 className="text-5xl font-extrabold">ABOUT US</h1>
      </header>

      <main className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto pb-20">
        {teamMembers.map((member, index) => (
          <div
            key={index}
            className="bg-gray-900 rounded-lg p-6 text-center shadow-lg"
          >
            <img
              src={member.image}
              alt={member.name}
              className="w-24 h-24 mx-auto rounded-full object-cover mb-4 border-2 border-white"
            />
            <h2 className="text-2xl font-bold mb-2">{member.name}</h2>
            <p className="text-gray-300 mb-4">{member.role}</p>
            <div className="flex justify-center space-x-4 text-xl text-gray-400">
              <FaGithub className="hover:text-white" />
              <FaLinkedin className="hover:text-white" />
              <FaDiscord className="hover:text-white" />
              <FaTwitter className="hover:text-white" />
            </div>
          </div>
        ))}
      </main>

      <footer className="text-center py-6 border-t border-gray-700 text-sm">
        <p className="text-gray-400">Copyright © 2025 - All right reserved</p>
      </footer>
    </div>
  );
}
