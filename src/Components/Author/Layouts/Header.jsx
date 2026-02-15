import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaBell } from 'react-icons/fa'; // Import icons
import { useNavigate } from 'react-router-dom';
import { ConfHub } from "../../../assets/Images";
import RoleSwitcherButton from '../../RoleSwitcher'; // Import the new button component
import ChangePasswordModal from '../../ChangePasswordModal';
import { LogOut } from 'lucide-react';

const Header = () => {
    const navigate = useNavigate();
    const [role, setRole] = useState('Admin'); // Default role
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const dropdownRef = useRef(null); // To detect click outside dropdown
    const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
    const [availableRoles, setAvailableRoles] = useState([]);
    const toggleDropdown = () => {
        setDropdownVisible((prev) => !prev);
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleRoleChange = (newRole) => {
        setRole(newRole);
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
        ],
        SubOrganizer: [
            { name: 'Schedule Sessions', to: '/organizer/schedule' },
            { name: 'Manage Reviews', to: '/organizer/reviews' },
        ],
        Reviewer: [
            { name: 'Assigned Papers', to: '/reviewer/assigned-papers' },
            { name: 'Submit Review', to: '/reviewer/submit-review' },
        ],
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

     useEffect(() => {
        const storedUser = localStorage.getItem('userDetails');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            const roles = ['Author']; // Default role

           if (Array.isArray(user.SubOrganizerRole) && user.SubOrganizerRole.length > 0) {
            roles.push('TPC_Chair');
        }
           if (
  user.reviewerId &&
  (Array.isArray(user.reviewerId) ? user.reviewerId.length > 0 : true)
) {
  roles.push('Reviewer');
}
if (
  user.organizerId &&
  (Array.isArray(user.organizerId) ? user.organizerId.length > 0 : true)
) {
  roles.push('Organizer');
}

            setAvailableRoles(roles);
        }
    }, []);
    const userDetails = JSON.parse(localStorage.getItem('userDetails'));
    const hasSubOrganizerRole = userDetails?.SubOrganizerRole?.length > 0;
    return (
        <header className="bg-gray-100 p-4 flex justify-between items-center border-b border-gray-300">
            <div className="flex items-center relative">
                <button onClick={toggleDropdown} className="text-xl text-black mr-4">
                    <FaBars />
                </button>
               <span className="text-4xl font-bold bg-gradient-to-r from-sky-400 to-pink-400 bg-clip-text text-transparent">
                  bzchair
                </span>

                {/* Dropdown Menu */}
                <div
                    ref={dropdownRef}
                    className={`absolute top-12 left-0 bg-white border border-gray-300 rounded-lg shadow-md w-48 ${dropdownVisible ? 'block' : 'hidden'}`}
                >
                    <Link to="/settings" className="block p-2 text-gray-700 hover:bg-gray-200">
                        Settings
                    </Link>
                    <Link to="/help" className="block p-2 text-gray-700 hover:bg-gray-200">
                        Help
                    </Link>
                    <button
                      className="block w-full text-left p-2 bg-white text-black hover:bg-gray-100"
                      onClick={() => { setShowChangePasswordModal(true); setDropdownVisible(false); }}
                    >
                      Change Password
                    </button>
                </div>

            </div>

            {/* Role Switcher */}
            {(
    <div className="flex items-center ml-auto mr-2 text-base">
        <RoleSwitcherButton
           roles={availableRoles}
            onRoleSelect={handleRoleChange}
        />
    </div>
)}
            {/* Notification and Logout */}
            <div className="flex items-center">
                <span className="text-xl text-gray-700 mr-4">
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
            <ChangePasswordModal isOpen={showChangePasswordModal} onClose={() => setShowChangePasswordModal(false)} />
        </header>
    );
};

export default Header;
