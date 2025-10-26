import React from 'react';

interface Category {
  id: string;
  name: string;
  level: number;
  parent?: Category | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  path?: string;
}

interface CategoryTreeChipsProps {
  categories: Category[];
  className?: string;
}

const CategoryTreeChips: React.FC<CategoryTreeChipsProps> = ({ 
  categories, 
  className = '' 
}) => {



  
  if (!categories || categories.length === 0) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        هیچ دسته‌بندی یافت نشد
      </div>
    );
  }

  // Extract all categories from the nested structure
  const extractAllCategories = (categories: Category[]): Category[] => {
    const allCategories = new Map<string, Category>();
    
    const addCategory = (category: Category) => {
      if (!allCategories.has(category.id)) {
        allCategories.set(category.id, category);
      }
      
      // Recursively add parent categories
      if (category.parent) {
        addCategory(category.parent);
      }
    };
    
    // Process each category and its parents
    categories.forEach(category => {
      addCategory(category);
    });
    
    return Array.from(allCategories.values());
  };

  // Get all categories including nested parents
  const allCategories = extractAllCategories(categories);

  // Sort categories by level first, then by name
  const sortedCategories = allCategories.sort((a, b) => {
    if (a.level !== b.level) {
      return a.level - b.level;
    }
    return a.name.localeCompare(b.name, 'fa');
  });

  // Helper function to determine if this is the last item at its level
  const isLastAtLevel = (category: Category, index: number): boolean => {
    const nextCategory = sortedCategories[index + 1];
    return !nextCategory || nextCategory.level <= category.level;
  };

  // Helper function to get the folder icon based on level and children
  const getFolderIcon = (level: number, hasChildren: boolean = false) => {
    if (level === 0) return hasChildren ? '📁' : '📂';
    if (level === 1) return hasChildren ? '📂' : '📄';
    return '📄';
  };

  // Helper function to get text color based on level
  const getTextColor = (level: number) => {
    const colors = [
      'text-blue-600',
      'text-green-600', 
      'text-purple-600',
      'text-orange-600',
      'text-pink-600',
      'text-indigo-600'
    ];
    return colors[level] || 'text-gray-600';
  };

  return (
    <div className={`bg-gray-50 rounded-lg p-4 border ${className}`}>
      <div className="space-y-1">
        {sortedCategories.map((category, index) => {
          const isLast = isLastAtLevel(category, index);
          const textColor = getTextColor(category.level);
          
          return (
            <div 
              key={category.id} 
              className="flex items-center group hover:bg-white rounded p-2 transition-colors duration-200"
            >
              {/* Tree structure lines */}
              <div 
                className="flex items-center" 
                style={{ width: `${category.level * 20 + 24}px` }}
              >
                {/* Vertical lines for parent levels */}
                {Array.from({ length: category.level }).map((_, i) => (
                  <div key={i} className="w-5 flex justify-center">
                    <div className="w-px h-8 bg-gray-300"></div>
                  </div>
                ))}
                
                {/* Current level connector */}
                {category.level > 0 && (
                  <div className="relative w-5 h-8 flex items-center">
                    <div className={`w-px bg-gray-300 ${isLast ? 'h-4' : 'h-8'}`}></div>
                    <div className="absolute top-4 left-1 w-3 h-px bg-gray-300"></div>
                  </div>
                )}
                
                {/* Folder icon */}
                <div className={`w-6 h-6 flex items-center justify-center rounded ${textColor}`}>
                  {getFolderIcon(category.level)}
                </div>
              </div>
              
              {/* Category content */}
              <div className="flex-1 flex items-center justify-between ml-3">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium group-hover:text-gray-900 ${textColor}`}>
                    {category.name}
                  </span>
                  
                  {/* Level indicator */}
                  <span className="text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
                    سطح {category.level}
                  </span>
                </div>
                
                {/* Status and info */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  {/* Creation date */}
                  <span className="text-xs text-gray-400">
                    {new Date(category.createdAt).toLocaleDateString('fa-IR')}
                  </span>
                  
                  {/* Active status */}
                  {category.isActive ? (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-xs text-green-600">فعال</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                      <span className="text-xs text-red-600">غیرفعال</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary footer */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>مجموع دسته‌ها: {allCategories.length}</span>
          <span>
            سطوح: {Math.max(...allCategories.map(cat => cat.level)) + 1}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CategoryTreeChips;
