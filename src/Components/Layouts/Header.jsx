import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell } from 'react-icons/fa'; // Import icons
import { useNavigate } from 'react-router-dom';
import { ConfHub } from '../../assets/Images';
import RoleSwitcherButton from '../RoleSwitcher'; // Import the new button component
import ChangePasswordModal from '../ChangePasswordModal';
import { LogOut } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('Admin'); // Default role
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null); // To detect click outside dropdown
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

    const toggleDropdown = () => {
        setDropdownVisible((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const links = {
        Admin: [
            { name: 'Dashboard', to: '/admin/dashboard' },
            { name: 'Users', to: '/admin/users' },
            { name: 'Settings', to: '/admin/settings' },
        ],
        Author: [
            { name: 'Submit Paper', to: '/author/submit' },
            { name: 'My Submissions', to: '/author/submissions' },
        ],
        Organizer: [
            { name: 'Schedule Sessions', to: '/organizer/schedule' },
            { name: 'Manage Reviews', to: '/organizer/reviews' },
            { name: 'Create Conference', to: '/CreateConference' }, // Create Conference option
        ],
        SubOrganizer: [ // SubOrganizer should see Organizer options without Create Conference
            { name: 'Schedule Sessions', to: '/organizer/schedule' },
            { name: 'Manage Reviews', to: '/organizer/reviews' },
        ],
        Reviewer: [{ name: 'Assigned Reviews', to: '/reviewer/reviews' }],
        Guest: [{ name: 'Conferences', to: '/conferences' }],
    };

    // Close dropdown if clicking outside of it
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownVisible(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleRoleChange = (newRole) => {
        setRole(newRole);
    };
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const isSubOrganizer = userDetails?.SubOrganizerRole?.length > 0;
    console.log('k',isSubOrganizer);
    

    const usertype = JSON.parse(localStorage.getItem('userDetails'));

let availableRoles = [];

if (usertype?.Type === 'reviewer') {
    availableRoles = ['Reviewer', 'TPC_Chair'];
} else if (usertype?.Type === 'author') {
    availableRoles = ['Author', 'TPC_Chair'];
}
    return (
      <>
        <header className="bg-gray-100 p-4 flex items-center justify-between border-b border-gray-300">
          <div className="flex items-center relative">
            <button
              onClick={toggleDropdown}
              className="bg-inherit text-gray-600 text-2xl mr-5"
            >
              <FaBars />
            </button>
            <span className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-pink-400 bg-clip-text text-transparent">
                  bzchair
                </span>
            {dropdownVisible && (
              <div
                ref={dropdownRef}
                className="absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-lg w-48 z-10"
              >
                {!isSubOrganizer && (
                  <Link
                    to="/CreateConference"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Create New Conference
                  </Link>
                )}
                
                {/* <Link
                  to="/ManageReviewerRequests"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Manage Reviewer Requests
                </Link> */}
                <Link
                  to="/Settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100 cursor-not-allowed"
                >
                  Settings
                </Link>
              
                <button
                  className="block w-full text-left px-4 py-2 bg-white text-black hover:bg-gray-100"
                  onClick={() => { setShowChangePasswordModal(true); setDropdownVisible(false); }}
                >
                  Change Password
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center ml-auto mr-2 text-base">
            <RoleSwitcherButton
              roles={availableRoles}
              onRoleSelect={handleRoleChange}
            />
          </div>

          <div className="flex items-center">
            <span className="text-gray-600 text-xl mr-5">
              <FaBell />
            </span>
          <button
  onClick={handleLogout}
  className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <LogOut className="h-5 w-5" />
  Logout
</button>
          </div>
        </header>
        <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
      </>
    );
};

export default Header;