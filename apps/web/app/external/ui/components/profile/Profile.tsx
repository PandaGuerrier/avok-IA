import React from 'react';

const Profile: React.FC = () => {
  return (
    <div className="w-full max-w-[935px] mt-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-10 border-b pb-10">
        <img src="https://i.pravatar.cc/150?u=moi" className="w-40 h-40 rounded-full border p-1" />
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-5">
            <h2 className="text-xl font-light">mon_pseudo_react</h2>
            <button className="bg-gray-100 px-4 py-1 rounded-lg font-semibold text-sm">Modifier le profil</button>
          </div>
          <div className="flex gap-8">
            <span><strong>12</strong> publications</span>
            <span><strong>450</strong> abonnés</span>
            <span><strong>300</strong> abonnements</span>
          </div>
          <p className="font-bold text-sm">Développeur React 🚀</p>
        </div>
      </div>
      {/* Grille de photos */}
      <div className="grid grid-cols-3 gap-1 mt-8">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 overflow-hidden group relative cursor-pointer">
            <img src={`https://picsum.photos/id/${i+50}/500/500`} className="object-cover w-full h-full hover:opacity-90" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Profile;