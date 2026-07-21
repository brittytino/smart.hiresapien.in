import React from 'react';
import Image from 'next/image';

import { LayoutDashboard, FileText, BarChart2, CheckSquare, User, LogOut } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0' }}>
        <Image src="/grad360.png" alt="grad360" width={130} height={44} style={{ objectFit: 'contain' }} priority />
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item">
          <LayoutDashboard size={20} />
          <span>My Overview</span>
        </div>
        <div className="nav-item active">
          <FileText size={20} />
          <span>Take Test</span>
        </div>
        <div className="nav-item">
          <BarChart2 size={20} />
          <span>My Results</span>
        </div>
        <div className="nav-item">
          <CheckSquare size={20} />
          <span>Psychometric Evaluation</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar"><User size={20} /></div>
          <div className="user-info">
            <span className="user-name">USER</span>
            <span className="user-role">STUDENT</span>
          </div>
        </div>
        <button className="signout-btn">
          <LogOut size={16} />
          <span>SIGN OUT</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
