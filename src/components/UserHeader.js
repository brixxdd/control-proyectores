import React from 'react';

const UserHeader = ({ user, userPicture, onLogout }) => {
  return (
    <div className="flex justify-end items-center mb-4 space-x-4 bg-gray-200 p-2 rounded">
      {user && (
        <>
          <div className="w-10 h-10 bg-gray-300 rounded-full overflow-hidden">
            {userPicture && (
              <img 
                src={userPicture}
                alt="Perfil" 
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <span className="text-gray-700">{user.nombre}</span>
          <button 
            onClick={onLogout} 
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Cerrar Sesión
          </button>
        </>
      )}
    </div>
  );
};

export default UserHeader;