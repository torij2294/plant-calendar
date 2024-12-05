import { useQuery } from '@tanstack/react-query';

const profileImages = [
    { 
      id: 1, 
      source: require('@/assets/images/profile-images/profile-1.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
    },
    { 
      id: 2, 
      source: require('@/assets/images/profile-images/profile-2.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
    },
    { 
      id: 3, 
      source: require('@/assets/images/profile-images/profile-3.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I' 
    },
    { 
      id: 4, 
      source: require('@/assets/images/profile-images/profile-4.png'), 
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
    },
    { 
      id: 5, 
      source: require('@/assets/images/profile-images/profile-5.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
     },
    { 
      id: 6, 
      source: require('@/assets/images/profile-images/profile-6.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
     },
    { 
      id: 7, 
      source: require('@/assets/images/profile-images/profile-7.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
     },
    { 
      id: 8, 
      source: require('@/assets/images/profile-images/profile-8.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
     },
    { 
      id: 9, 
      source: require('@/assets/images/profile-images/profile-9.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I' 
    },
    { 
      id: 11, 
      source: require('@/assets/images/profile-images/profile-11.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
     },
    { 
      id: 12, 
      source: require('@/assets/images/profile-images/profile-12.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
     },
    { 
      id: 13, 
      source: require('@/assets/images/profile-images/profile-13.png'),
      blurhash: 'L5H2EC=PM+yV0g-mq.wG9c010J}I'
     },
  ];

async function fetchAvatars() {
  // Simulate async behavior for local images
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(profileImages);
    }, 100);
  });
}

export function useAvatars() {
  return useQuery({
    queryKey: ['avatars'],
    queryFn: fetchAvatars,
    staleTime: Infinity, // Since these are local images, they won't change
    cacheTime: Infinity,
  });
} 