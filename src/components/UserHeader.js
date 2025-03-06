import React from 'react';

const UserHeader = ({ user, userPicture, onLogout }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-gray-200 dark:bg-gray-800 p-3 rounded-lg shadow-sm">
      {user && (
        <>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full overflow-hidden flex-shrink-0">
              {userPicture && (
                <img 
                  src={userPicture}
                  alt="Perfil" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <span className="text-gray-700 dark:text-gray-200 text-sm sm:text-base font-medium truncate">
              {user.nombre}
            </span>
          </div>
          <button 
            onClick={onLogout} 
            className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-600 text-white text-sm sm:text-base rounded-lg hover:bg-red-700 transition-colors"
          >
            Cerrar Sesión
          </button>
        </>
      )}
    </div>
  );
};

export default UserHeader;