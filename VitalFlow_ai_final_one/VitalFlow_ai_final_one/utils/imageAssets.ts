// Blood component images - reference to medical/hospital related imagery
export const getComponentImage = (componentType: string): string => {
  const imageMap: Record<string, string> = {
    'Whole Blood': 'https://images.unsplash.com/photo-1631217315821-f90de6e0f024?auto=format&fit=crop&q=80&w=400',
    'Plasma': 'https://images.unsplash.com/photo-1576091160396-112babfc1d64?auto=format&fit=crop&q=80&w=400',
    'RBC': 'https://images.unsplash.com/photo-1631217880975-92f3f9868c9c?auto=format&fit=crop&q=80&w=400',
    'PRBC': 'https://images.unsplash.com/photo-1631217880975-92f3f9868c9c?auto=format&fit=crop&q=80&w=400',
    'Platelets': 'https://images.unsplash.com/photo-1576091160550-112b6e8e559f?auto=format&fit=crop&q=80&w=400',
    'PlateletConcentrate': 'https://images.unsplash.com/photo-1576091160550-112b6e8e559f?auto=format&fit=crop&q=80&w=400',
    'WBC': 'https://images.unsplash.com/photo-1631217315821-f90de6e0f024?auto=format&fit=crop&q=80&w=400',
    'FFP': 'https://images.unsplash.com/photo-1576091160396-112babfc1d64?auto=format&fit=crop&q=80&w=400',
    'Cryoprecipitate': 'https://images.unsplash.com/photo-1576091160396-112babfc1d64?auto=format&fit=crop&q=80&w=400'
  };
  return imageMap[componentType] || 'https://images.unsplash.com/photo-1631217315821-f90de6e0f024?auto=format&fit=crop&q=80&w=400';
};

export const getBloodTypeColor = (bloodGroup: string): string => {
  const colorMap: Record<string, string> = {
    'O+': 'from-red-500 to-red-600',
    'O-': 'from-orange-500 to-orange-600',
    'A+': 'from-pink-500 to-pink-600',
    'A-': 'from-rose-500 to-rose-600',
    'B+': 'from-red-600 to-red-700',
    'B-': 'from-red-700 to-red-800',
    'AB+': 'from-purple-500 to-purple-600',
    'AB-': 'from-purple-600 to-purple-700'
  };
  return colorMap[bloodGroup] || 'from-red-500 to-red-600';
};

export const getHospitalImage = (): string => {
  return 'https://images.unsplash.com/photo-1587854692152-cbe660dbde0e?auto=format&fit=crop&q=80&w=600';
};

export const getDeliveryImage = (): string => {
  return 'https://images.unsplash.com/photo-1631217315821-f90de6e0f024?auto=format&fit=crop&q=80&w=600';
};

export const getDoctorImage = (): string => {
  return 'https://images.unsplash.com/photo-1622024432727-b37b532c2044?auto=format&fit=crop&q=80&w=400';
};

export const getNurseImage = (): string => {
  return 'https://images.unsplash.com/photo-1576091160579-2d76a17edbf5?auto=format&fit=crop&q=80&w=400';
};

export const getLabImage = (): string => {
  return 'https://images.unsplash.com/photo-1576091160550-112b6e8e559f?auto=format&fit=crop&q=80&w=600';
};
