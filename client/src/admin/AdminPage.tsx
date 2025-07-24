import React, { useState } from 'react';
import {
  Menu,
  X,
  Plus,
  LayoutList,
  Image,
  Circle,
  ShoppingCart,
  User,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import AddProduct from './AddProduct';
import CarouselManager from './CarouselManager';
import OrdersDashboard from './OrdersDashboard';
import AdminProfile from './AdminProfile';
import AdminCategoryPanel from './AdminCategoryPanel';
import ProductManagementPage from './ProductManagementPage';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('add'); // default to Add Product
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false); // sidebar closed by default on mobile
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(false); // sidebar closed by default on desktop

  const orderNotificationCount = 5;

  type TabItem = [key: string, label: string, icon: React.ReactNode];

  const tabs: TabItem[] = [
    ['add', 'Add Products', <Plus className="w-4 h-4 mr-2" />],
    ['manage', 'Manage Products', <LayoutList className="w-4 h-4 mr-2" />],
    ['carousel', 'Carousel Images', <Image className="w-4 h-4 mr-2" />],
    ['circle', 'Category Circle', <Circle className="w-4 h-4 mr-2" />],
    [
      'orders',
      'Orders Dashboard',
      <div className="relative mr-2">
        <ShoppingCart className="w-4 h-4" />
        {orderNotificationCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center">
            {orderNotificationCount}
          </span>
        )}
      </div>,
    ],
    ['profile', 'Admin Profile', <User className="w-4 h-4 mr-2" />],
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'add':
        return <AddProduct />;
      case 'manage':
        return (
          <ProductManagementPage
            onEdit={(id) => {
              setEditingProductId(id);
              setActiveTab('edit');
            }}
          />
        );
      case 'carousel':
        return <CarouselManager />;
      case 'circle':
        return <AdminCategoryPanel />;
      case 'orders':
        return <OrdersDashboard />;
      case 'profile':
        return <AdminProfile />;
      default:
        return null;
    }
  };

  const SidebarLinks = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-6">
        <Link to="/admin" className="text-2xl font-bold text-white">
          Admin Panel
        </Link>
        {isMobile && (
          <button onClick={() => setIsMobileSidebarOpen(false)}>
            <X className="text-white w-6 h-6" />
          </button>
        )}
      </div>
      {tabs.map(([key, label, icon]) => (
        <button
          key={key}
          onClick={() => {
            setActiveTab(key as string);
            setEditingProductId(null);
            setIsMobileSidebarOpen(false);
          }}
          className={`flex items-center w-full text-left px-4 py-2 rounded-md transition-colors ${
            activeTab === key
              ? 'bg-white text-blue-800 font-semibold'
              : 'text-white hover:bg-blue-600'
          }`}
        >
          {icon} {label}
        </button>
      ))}
    </div>
  );

  return (
    <div>
      <div className="flex min-h-screen bg-gray-100 text-gray-900">
        {/* Desktop Sidebar (initially hidden) */}
        {isDesktopSidebarVisible && (
          <aside className="hidden sm:flex flex-col w-64 bg-blue-800 p-6 shadow-lg">
            <SidebarLinks />
          </aside>
        )}

        {/* Mobile Sidebar Backdrop */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-30 z-40 sm:hidden"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
        )}

        {/* Mobile Sidebar Slide-in */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-blue-800 p-6 sm:hidden transform transition-transform duration-300 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <SidebarLinks isMobile />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-x-hidden">
          {/* Top bar */}
          <header className="sticky top-0 z-40 flex items-center justify-between bg-white border-b px-4 py-3 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                className="sm:hidden text-blue-800"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu />
              </button>
              <button
                className="hidden sm:inline-flex items-center text-blue-800"
                onClick={() => setIsDesktopSidebarVisible(!isDesktopSidebarVisible)}
              >
                {isDesktopSidebarVisible ? <X /> : <Menu />}
              </button>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6 flex-1">
            <div key={activeTab}>{renderContent()}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
