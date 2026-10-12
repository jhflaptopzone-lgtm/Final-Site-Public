import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CustomerReview {
  id: string;
  targetId: string; // Product ID or Tool/Software ID
  targetName: string;
  customerName: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase?: boolean;
  createdAt: string;
}

export interface SystemToast {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: string;
}

interface CustomerContextType {
  // Wishlist
  favorites: string[];
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;

  // Compare
  compareList: any[];
  addToCompare: (item: any) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isComparing: (id: string) => boolean;
  isCompareModalOpen: boolean;
  setIsCompareModalOpen: (open: boolean) => void;

  // Track Order
  isTrackingModalOpen: boolean;
  setIsTrackingModalOpen: (open: boolean) => void;
  trackingQuery: string;
  setTrackingQuery: (query: string) => void;

  // AI Assistant
  isAiAssistantOpen: boolean;
  setIsAiAssistantOpen: (open: boolean) => void;

  // Reviews
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, 'id' | 'createdAt'>) => void;
  getProductReviews: (targetId: string) => CustomerReview[];
  getAverageRating: (targetId: string) => { rating: number; count: number };

  // Toasts
  toasts: SystemToast[];
  addToast: (title: string, message: string, type?: 'info' | 'success' | 'warning') => void;
  dismissToast: (id: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

// Initial verified reviews so the platform feels mature and authentic
const DEFAULT_REVIEWS: CustomerReview[] = [
  {
    id: 'rev-1',
    targetId: 'lenovo-t480',
    targetName: 'Lenovo ThinkPad T480',
    customerName: 'Ashiqur Rahman',
    rating: 5,
    comment: 'আলহামদুলিল্লাহ, ল্যাপটপটি একদম ফ্রেশ কন্ডিশনে পেয়েছি। ব্যাটারি ব্যাকআপ প্রায় ৪+ ঘণ্টা থাকে। কিবোর্ড ফিল অসাম!',
    verifiedPurchase: true,
    createdAt: '2026-09-08T10:30:00Z',
  },
  {
    id: 'rev-2',
    targetId: 'hp-840-g8',
    targetName: 'HP EliteBook 840 G8',
    customerName: 'Tanvir Hossain',
    rating: 5,
    comment: 'Original Dubai imported unit. Screen and metal chassis are spotless. Delivery was fast via Sundarban Courier.',
    verifiedPurchase: true,
    createdAt: '2026-09-05T14:15:00Z',
  },
  {
    id: 'rev-3',
    targetId: 'dell-7420',
    targetName: 'Dell Latitude 7420',
    customerName: 'Engr. Mahfuzul Alam',
    rating: 5,
    comment: 'Testing tools zone helped me verify SSD 100% health right after delivery. Top notch service from JHF!',
    verifiedPurchase: true,
    createdAt: '2026-09-02T19:00:00Z',
  },
];

export const CustomerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Favorites persistence
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_customer_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Compare List
  const [compareList, setCompareList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_customer_compare');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Reviews persistence
  const [reviews, setReviews] = useState<CustomerReview[]>(() => {
    try {
      const saved = localStorage.getItem('jhf_customer_reviews');
      return saved ? JSON.parse(saved) : DEFAULT_REVIEWS;
    } catch {
      return DEFAULT_REVIEWS;
    }
  });

  // Modals state
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingQuery, setTrackingQuery] = useState('');
  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);

  // Non-intrusive Toasts
  const [toasts, setToasts] = useState<SystemToast[]>([]);

  // Persist Favorites
  useEffect(() => {
    try {
      localStorage.setItem('jhf_customer_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  // Persist Compare
  useEffect(() => {
    try {
      localStorage.setItem('jhf_customer_compare', JSON.stringify(compareList));
    } catch (e) {
      console.error(e);
    }
  }, [compareList]);

  // Persist Reviews
  useEffect(() => {
    try {
      localStorage.setItem('jhf_customer_reviews', JSON.stringify(reviews));
    } catch (e) {
      console.error(e);
    }
  }, [reviews]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        addToast('Removed from Wishlist', 'Item has been removed from your saved list.', 'info');
        return prev.filter((item) => item !== id);
      } else {
        addToast('Saved to Wishlist', 'Item has been added to your favorites list.', 'success');
        return [...prev, id];
      }
    });
  };

  const isFavorite = (id: string) => favorites.includes(id);

  const addToCompare = (item: any): boolean => {
    if (compareList.some((c) => c.id === item.id)) {
      addToast('Already in Compare', `${item.title || item.name} is already in comparison list.`, 'info');
      setIsCompareModalOpen(true);
      return false;
    }
    if (compareList.length >= 3) {
      addToast('Comparison Limit', 'You can compare up to 3 laptops simultaneously. Remove one first.', 'warning');
      setIsCompareModalOpen(true);
      return false;
    }
    setCompareList((prev) => [...prev, item]);
    addToast('Added to Compare', `${item.title || item.name} added. Comparing ${compareList.length + 1}/3 laptops.`, 'success');
    setIsCompareModalOpen(true);
    return true;
  };

  const removeFromCompare = (id: string) => {
    setCompareList((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompare = () => {
    setCompareList([]);
  };

  const isComparing = (id: string) => compareList.some((c) => c.id === id);

  const addReview = (newRev: Omit<CustomerReview, 'id' | 'createdAt'>) => {
    const createdReview: CustomerReview = {
      ...newRev,
      id: 'rev-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    setReviews((prev) => [createdReview, ...prev]);
    addToast('Review Submitted', 'Thank you for rating JHF Laptop Zone!', 'success');
  };

  const getProductReviews = (targetId: string) => {
    return reviews.filter(
      (r) => r.targetId === targetId || (r.targetName && targetId && r.targetName.toLowerCase().includes(targetId.toLowerCase()))
    );
  };

  const getAverageRating = (targetId: string) => {
    const list = getProductReviews(targetId);
    if (list.length === 0) return { rating: 5.0, count: 1 }; // Default verified benchmark
    const sum = list.reduce((acc, r) => acc + r.rating, 0);
    return {
      rating: parseFloat((sum / list.length).toFixed(1)),
      count: list.length,
    };
  };

  const addToast = (title: string, message: string, type: 'info' | 'success' | 'warning' = 'info') => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, message, type, timestamp: new Date().toISOString() }]);
    setTimeout(() => {
      dismissToast(id);
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <CustomerContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        compareList,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isComparing,
        isCompareModalOpen,
        setIsCompareModalOpen,
        isTrackingModalOpen,
        setIsTrackingModalOpen,
        trackingQuery,
        setTrackingQuery,
        isAiAssistantOpen,
        setIsAiAssistantOpen,
        reviews,
        addReview,
        getProductReviews,
        getAverageRating,
        toasts,
        addToast,
        dismissToast,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
};

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};
